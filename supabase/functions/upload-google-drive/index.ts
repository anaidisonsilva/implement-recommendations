import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_drive";

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

    // Auth
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

    const gwHeaders = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_DRIVE_API_KEY,
    };

    // Multipart upload to Drive
    const boundary = "lovable-boundary-" + crypto.randomUUID();
    const metadata = { name: nome, mimeType: file.type || "application/octet-stream" };
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

    // Make public
    await fetch(`${GATEWAY}/drive/v3/files/${driveFile.id}/permissions`, {
      method: "POST",
      headers: { ...gwHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    });

    const url = driveFile.webViewLink || `https://drive.google.com/file/d/${driveFile.id}/view`;

    // Insert documento using service role (RLS-bypassed but scoped)
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
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
      JSON.stringify({ documento: doc, driveFileId: driveFile.id, url }),
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
