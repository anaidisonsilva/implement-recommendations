import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_drive";

function sanitize(name: string) {
  return name.replace(/['"\\]/g, "").trim() || "Sem Nome";
}

async function driveFetch(path: string, init: RequestInit, gwHeaders: Record<string, string>) {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: { ...gwHeaders, ...(init.headers as Record<string, string> | undefined) },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Drive ${path} ${res.status}: ${t}`);
  }
  return res.json();
}

async function getOrCreateFolder(
  name: string,
  parentId: string | null,
  gwHeaders: Record<string, string>,
): Promise<string> {
  const safe = sanitize(name);
  const parentClause = parentId ? ` and '${parentId}' in parents` : "";
  const q = encodeURIComponent(
    `name='${safe.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentClause}`,
  );
  const search = await driveFetch(
    `/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=1`,
    { method: "GET" },
    gwHeaders,
  );
  if (search.files?.[0]?.id) return search.files[0].id;

  const created = await driveFetch(
    `/drive/v3/files?fields=id`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: safe,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentId ? [parentId] : undefined,
      }),
    },
    gwHeaders,
  );
  return created.id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_DRIVE_API_KEY = Deno.env.get("GOOGLE_DRIVE_API_KEY");
    if (!LOVABLE_API_KEY || !GOOGLE_DRIVE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Google Drive não conectado." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const nome = (form.get("nome") as string) || file?.name || "arquivo";
    const tipo = (form.get("tipo") as string) || "outro";
    const emendaId = (form.get("emendaId") as string) || null;
    const planoTrabalhoId = (form.get("planoTrabalhoId") as string) || null;

    if (!file) {
      return new Response(JSON.stringify({ error: "Arquivo ausente" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Resolve prefeitura + ano via emenda
    let resolvedEmendaId = emendaId;
    if (!resolvedEmendaId && planoTrabalhoId) {
      const { data: plano } = await admin
        .from("planos_trabalho")
        .select("emenda_id")
        .eq("id", planoTrabalhoId)
        .maybeSingle();
      resolvedEmendaId = plano?.emenda_id ?? null;
    }

    let prefeituraNome = "Sem Prefeitura";
    let ano = String(new Date().getFullYear());

    if (resolvedEmendaId) {
      const { data: emenda } = await admin
        .from("emendas")
        .select("data_disponibilizacao, prefeitura_id, prefeituras:prefeitura_id(nome)")
        .eq("id", resolvedEmendaId)
        .maybeSingle();
      if (emenda) {
        if (emenda.data_disponibilizacao) {
          ano = String(new Date(emenda.data_disponibilizacao).getFullYear());
        }
        const pref = (emenda as any).prefeituras;
        if (pref?.nome) prefeituraNome = pref.nome;
      }
    }

    const gwHeaders = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_DRIVE_API_KEY,
    };

    // Folder structure: {Prefeitura}/{Ano}
    const prefFolderId = await getOrCreateFolder(prefeituraNome, null, gwHeaders);
    const anoFolderId = await getOrCreateFolder(ano, prefFolderId, gwHeaders);

    // Multipart upload to Drive within ano folder
    const boundary = "lovable-boundary-" + crypto.randomUUID();
    const metadata = {
      name: nome,
      mimeType: file.type || "application/octet-stream",
      parents: [anoFolderId],
    };
    const fileBuf = new Uint8Array(await file.arrayBuffer());
    const enc = new TextEncoder();
    const pre = enc.encode(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${metadata.mimeType}\r\n\r\n`,
    );
    const post = enc.encode(`\r\n--${boundary}--`);
    const body = new Uint8Array(pre.length + fileBuf.length + post.length);
    body.set(pre, 0);
    body.set(fileBuf, pre.length);
    body.set(post, pre.length + fileBuf.length);

    const uploadRes = await fetch(
      `${GATEWAY}/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink,name`,
      {
        method: "POST",
        headers: {
          ...gwHeaders,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body,
      },
    );
    if (!uploadRes.ok) {
      const t = await uploadRes.text();
      console.error("Drive upload failed:", uploadRes.status, t);
      return new Response(
        JSON.stringify({ error: `Falha no upload Drive: ${uploadRes.status}`, detail: t }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const driveFile = await uploadRes.json();

    await fetch(`${GATEWAY}/drive/v3/files/${driveFile.id}/permissions`, {
      method: "POST",
      headers: { ...gwHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    });

    const url = driveFile.webViewLink || `https://drive.google.com/file/d/${driveFile.id}/view`;

    const { data: doc, error: dbErr } = await admin
      .from("documentos")
      .insert({
        emenda_id: emendaId,
        plano_trabalho_id: planoTrabalhoId,
        nome,
        tipo,
        url,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (dbErr) throw dbErr;

    return new Response(
      JSON.stringify({
        documento: doc,
        driveFileId: driveFile.id,
        url,
        folder: `${prefeituraNome}/${ano}`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
