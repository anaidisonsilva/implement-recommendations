import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Campos seguros para exposição pública (sem banco/conta)
const PUBLIC_FIELDS = [
  "id","numero","tipo_concedente","nome_concedente","nome_parlamentar","tipo_recebedor",
  "nome_recebedor","cnpj_recebedor","municipio","estado","data_disponibilizacao",
  "objeto","grupo_natureza_despesa","valor","contrapartida","valor_executado",
  "valor_empenhado","valor_liquidado","valor_pago","valor_repassado","status",
  "numero_convenio","numero_plano_acao","numero_proposta","data_inicio_vigencia",
  "data_fim_vigencia","especial","programa","esfera","funcao_governo","forma_repasse",
  "gestor_responsavel"
].join(",");

const tools = [
  {
    type: "function",
    function: {
      name: "estatisticas_gerais",
      description: "Retorna totais agregados (valor total, executado, quantidades por status) das emendas e convênios. Filtros opcionais.",
      parameters: {
        type: "object",
        properties: {
          prefeitura_slug: { type: "string", description: "Slug da prefeitura para filtrar (opcional)" },
          ano: { type: "number", description: "Ano da data de disponibilização (opcional)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "buscar_emendas",
      description: "Lista emendas/convênios filtrando por texto, status, parlamentar, forma de repasse, esfera, ano ou prefeitura. Retorna no máximo 20 registros resumidos.",
      parameters: {
        type: "object",
        properties: {
          texto: { type: "string", description: "Busca em objeto, parlamentar, recebedor, número, município" },
          status: { type: "string", enum: ["pendente","aprovado","em_execucao","concluido","cancelado"] },
          esfera: { type: "string", enum: ["federal","estadual","municipal"] },
          forma_repasse: { type: "string", enum: ["especial","convenio","fundo_a_fundo"] },
          ano: { type: "number" },
          prefeitura_slug: { type: "string" },
          limite: { type: "number", description: "Padrão 10, máx 20" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "detalhe_emenda",
      description: "Retorna detalhe completo de uma emenda/convênio pelo número ou ID, incluindo execução orçamentária.",
      parameters: {
        type: "object",
        properties: {
          numero: { type: "string" },
          id: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "alertas_vigencia",
      description: "Lista convênios próximos do fim da vigência (90/30/10 dias).",
      parameters: {
        type: "object",
        properties: {
          dias: { type: "number", description: "Janela em dias (padrão 90)" },
          prefeitura_slug: { type: "string" },
        },
      },
    },
  },
];

async function resolvePrefeituraId(slug?: string) {
  if (!slug) return null;
  const { data } = await supabase.from("prefeituras").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

async function runTool(name: string, args: any) {
  try {
    if (name === "estatisticas_gerais") {
      let q = supabase.from("emendas").select("status,valor,contrapartida,valor_executado,data_disponibilizacao,esfera,forma_repasse");
      const pid = await resolvePrefeituraId(args.prefeitura_slug);
      if (pid) q = q.eq("prefeitura_id", pid);
      if (args.ano) q = q.gte("data_disponibilizacao", `${args.ano}-01-01`).lte("data_disponibilizacao", `${args.ano}-12-31`);
      const { data, error } = await q;
      if (error) throw error;
      const ativas = (data || []).filter((e: any) => !["pendente","cancelado"].includes(e.status));
      const sum = (k: string) => ativas.reduce((s: number, e: any) => s + Number(e[k] || 0), 0);
      const porStatus: Record<string, number> = {};
      const porEsfera: Record<string, number> = {};
      const porForma: Record<string, number> = {};
      (data || []).forEach((e: any) => {
        porStatus[e.status] = (porStatus[e.status] || 0) + 1;
        if (e.esfera) porEsfera[e.esfera] = (porEsfera[e.esfera] || 0) + 1;
        if (e.forma_repasse) porForma[e.forma_repasse] = (porForma[e.forma_repasse] || 0) + 1;
      });
      return {
        total_registros: data?.length || 0,
        valor_total_concedente: sum("valor"),
        valor_contrapartida: sum("contrapartida"),
        valor_total_geral: sum("valor") + sum("contrapartida"),
        valor_executado: sum("valor_executado"),
        por_status: porStatus,
        por_esfera: porEsfera,
        por_forma_repasse: porForma,
        observacao: "Totais financeiros excluem status pendente e cancelado.",
      };
    }

    if (name === "buscar_emendas") {
      let q = supabase.from("emendas").select(PUBLIC_FIELDS).order("data_disponibilizacao", { ascending: false });
      const pid = await resolvePrefeituraId(args.prefeitura_slug);
      if (pid) q = q.eq("prefeitura_id", pid);
      if (args.status) q = q.eq("status", args.status);
      if (args.esfera) q = q.eq("esfera", args.esfera);
      if (args.forma_repasse) q = q.eq("forma_repasse", args.forma_repasse);
      if (args.ano) q = q.gte("data_disponibilizacao", `${args.ano}-01-01`).lte("data_disponibilizacao", `${args.ano}-12-31`);
      if (args.texto) {
        const t = `%${args.texto}%`;
        q = q.or(`objeto.ilike.${t},nome_parlamentar.ilike.${t},nome_recebedor.ilike.${t},nome_concedente.ilike.${t},numero.ilike.${t},municipio.ilike.${t},numero_convenio.ilike.${t},numero_proposta.ilike.${t}`);
      }
      const lim = Math.min(args.limite || 10, 20);
      q = q.limit(lim);
      const { data, error } = await q;
      if (error) throw error;
      return { total: data?.length || 0, resultados: data };
    }

    if (name === "detalhe_emenda") {
      let q = supabase.from("emendas").select(PUBLIC_FIELDS);
      if (args.id) q = q.eq("id", args.id);
      else if (args.numero) q = q.eq("numero", args.numero);
      else return { erro: "Informe id ou numero" };
      const { data, error } = await q.maybeSingle();
      if (error) throw error;
      return data || { erro: "Não encontrado" };
    }

    if (name === "alertas_vigencia") {
      const dias = args.dias || 90;
      const hoje = new Date();
      const limite = new Date(hoje.getTime() + dias * 86400000).toISOString().slice(0, 10);
      let q = supabase.from("emendas")
        .select("id,numero,objeto,municipio,nome_parlamentar,data_fim_vigencia,status")
        .not("data_fim_vigencia", "is", null)
        .lte("data_fim_vigencia", limite)
        .gte("data_fim_vigencia", hoje.toISOString().slice(0, 10))
        .neq("status", "concluido")
        .neq("status", "cancelado")
        .order("data_fim_vigencia", { ascending: true })
        .limit(30);
      const pid = await resolvePrefeituraId(args.prefeitura_slug);
      if (pid) q = q.eq("prefeitura_id", pid);
      const { data, error } = await q;
      if (error) throw error;
      return { total: data?.length || 0, alertas: data };
    }

    return { erro: `Ferramenta desconhecida: ${name}` };
  } catch (e) {
    return { erro: String((e as Error).message || e) };
  }
}

const SYSTEM_PROMPT = `Você é um assistente especializado em emendas parlamentares, convênios e execução orçamentária pública do Brasil (regras de TCE-MG e MPC-MG).
Responda sempre em português, de forma clara e objetiva.
Use as ferramentas disponíveis para consultar dados reais antes de responder — nunca invente números.
Formate valores em R$ (BRL) e datas em dd/mm/aaaa.
Quando listar emendas, use tabelas markdown compactas com colunas essenciais.
Para perguntas estatísticas, sempre chame estatisticas_gerais.
Se o usuário mencionar uma prefeitura específica pelo slug (ex: a URL contém /p/xxxx), repasse esse slug nos filtros.
Excluir status "pendente" e "cancelado" dos totais financeiros.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { messages, prefeitura_slug } = await req.json();
    const contextSystem = prefeitura_slug
      ? `${SYSTEM_PROMPT}\n\nContexto atual: usuário está no portal da prefeitura "${prefeitura_slug}". Filtre dados por essa prefeitura por padrão.`
      : SYSTEM_PROMPT;

    const convo: any[] = [{ role: "system", content: contextSystem }, ...messages];

    for (let step = 0; step < 8; step++) {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": LOVABLE_API_KEY,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: convo,
          tools,
        }),
      });

      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde um momento." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (!resp.ok) {
        const txt = await resp.text();
        return new Response(JSON.stringify({ error: `Erro AI: ${txt}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const data = await resp.json();
      const msg = data.choices?.[0]?.message;
      if (!msg) break;
      convo.push(msg);

      const toolCalls = msg.tool_calls;
      if (!toolCalls || toolCalls.length === 0) {
        return new Response(JSON.stringify({ reply: msg.content || "" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      for (const tc of toolCalls) {
        const args = JSON.parse(tc.function.arguments || "{}");
        const result = await runTool(tc.function.name, args);
        convo.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        });
      }
    }

    return new Response(JSON.stringify({ reply: "Não consegui concluir a resposta. Reformule a pergunta." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
