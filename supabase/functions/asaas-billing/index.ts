import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://deno.land/x/edge_cors@0.2.1/mod.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ASAAS_BASE_URL = "https://sandbox.asaas.com/api/v3";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");
    if (!ASAAS_API_KEY) throw new Error("ASAAS_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { action, ...params } = await req.json();

    switch (action) {
      case "create_customer": {
        const { prefeitura_id, nome, cnpj, email } = params;
        if (!prefeitura_id || !nome || !cnpj) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: CORS });
        }
        // Create customer in Asaas
        const customerRes = await fetch(`${ASAAS_BASE_URL}/customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json", access_token: ASAAS_API_KEY },
          body: JSON.stringify({
            name: nome,
            cpfCnpj: cnpj.replace(/\D/g, ""),
            email: email || undefined,
            notificationDisabled: false,
          }),
        });
        const customer = await customerRes.json();
        if (!customerRes.ok) {
          return new Response(JSON.stringify({ error: "Asaas error", details: customer }), { status: 400, headers: CORS });
        }
        // Save customer ID
        await supabase
          .from("prefeituras")
          .update({ asaas_customer_id: customer.id })
          .eq("id", prefeitura_id);
        return new Response(JSON.stringify({ success: true, customer_id: customer.id }), { headers: { ...CORS, "Content-Type": "application/json" } });
      }

      case "generate_invoice": {
        const { prefeitura_id, valor, mes_referencia } = params;
        if (!prefeitura_id || !valor || !mes_referencia) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: CORS });
        }
        // Get prefeitura data
        const { data: pref } = await supabase
          .from("prefeituras")
          .select("*")
          .eq("id", prefeitura_id)
          .single();
        if (!pref) {
          return new Response(JSON.stringify({ error: "Prefeitura not found" }), { status: 404, headers: CORS });
        }
        if (!pref.asaas_customer_id) {
          return new Response(JSON.stringify({ error: "Customer not registered in Asaas. Create customer first." }), { status: 400, headers: CORS });
        }
        // Check if invoice already exists for this month
        const { data: existing } = await supabase
          .from("faturas")
          .select("id")
          .eq("prefeitura_id", prefeitura_id)
          .eq("mes_referencia", mes_referencia)
          .maybeSingle();
        if (existing) {
          return new Response(JSON.stringify({ error: "Invoice already exists for this period" }), { status: 409, headers: CORS });
        }
        // Calculate due date (10th of the reference month)
        const [year, month] = mes_referencia.split("-");
        const dueDate = `${year}-${month}-10`;
        // Create payment in Asaas
        const paymentRes = await fetch(`${ASAAS_BASE_URL}/payments`, {
          method: "POST",
          headers: { "Content-Type": "application/json", access_token: ASAAS_API_KEY },
          body: JSON.stringify({
            customer: pref.asaas_customer_id,
            billingType: "BOLETO",
            value: parseFloat(valor),
            dueDate: dueDate,
            description: `Mensalidade sistema - ${mes_referencia} - ${pref.nome}`,
            externalReference: prefeitura_id,
          }),
        });
        const payment = await paymentRes.json();
        if (!paymentRes.ok) {
          return new Response(JSON.stringify({ error: "Asaas payment error", details: payment }), { status: 400, headers: CORS });
        }
        // Save invoice
        const { data: fatura, error: faturaError } = await supabase
          .from("faturas")
          .insert({
            prefeitura_id,
            asaas_payment_id: payment.id,
            valor: parseFloat(valor),
            data_vencimento: dueDate,
            status: "PENDING",
            mes_referencia,
            url_boleto: payment.bankSlipUrl || null,
            url_boleto_pdf: payment.bankSlipUrl ? `${payment.bankSlipUrl}.pdf` : null,
            linha_digitavel: payment.nossoNumero || null,
          })
          .select()
          .single();
        if (faturaError) throw faturaError;
        return new Response(JSON.stringify({ success: true, fatura }), { headers: { ...CORS, "Content-Type": "application/json" } });
      }

      case "webhook": {
        // Process Asaas webhook
        const { event, payment } = params;
        if (!payment?.id) {
          return new Response(JSON.stringify({ error: "Invalid webhook" }), { status: 400, headers: CORS });
        }
        const { data: fatura } = await supabase
          .from("faturas")
          .select("*")
          .eq("asaas_payment_id", payment.id)
          .maybeSingle();
        if (!fatura) {
          return new Response(JSON.stringify({ ok: true, message: "Invoice not found, ignoring" }), { headers: { ...CORS, "Content-Type": "application/json" } });
        }
        let newStatus = fatura.status;
        let dataPagamento = fatura.data_pagamento;
        switch (event) {
          case "PAYMENT_CONFIRMED":
          case "PAYMENT_RECEIVED":
            newStatus = "CONFIRMED";
            dataPagamento = new Date().toISOString().split("T")[0];
            break;
          case "PAYMENT_OVERDUE":
            newStatus = "OVERDUE";
            break;
          case "PAYMENT_DELETED":
          case "PAYMENT_REFUNDED":
            newStatus = "CANCELLED";
            break;
        }
        await supabase
          .from("faturas")
          .update({
            status: newStatus,
            data_pagamento: dataPagamento,
            url_boleto: payment.bankSlipUrl || fatura.url_boleto,
            linha_digitavel: payment.nossoNumero || fatura.linha_digitavel,
            updated_at: new Date().toISOString(),
          })
          .eq("id", fatura.id);
        return new Response(JSON.stringify({ success: true }), { headers: { ...CORS, "Content-Type": "application/json" } });
      }

      case "check_status": {
        // Check payment status in Asaas for a specific invoice
        const { fatura_id } = params;
        if (!fatura_id) {
          return new Response(JSON.stringify({ error: "Missing fatura_id" }), { status: 400, headers: CORS });
        }
        const { data: fatura } = await supabase
          .from("faturas")
          .select("*")
          .eq("id", fatura_id)
          .single();
        if (!fatura?.asaas_payment_id) {
          return new Response(JSON.stringify({ error: "Invoice not found" }), { status: 404, headers: CORS });
        }
        const statusRes = await fetch(`${ASAAS_BASE_URL}/payments/${fatura.asaas_payment_id}`, {
          headers: { access_token: ASAAS_API_KEY },
        });
        const statusData = await statusRes.json();
        if (!statusRes.ok) {
          return new Response(JSON.stringify({ error: "Asaas error" }), { status: 400, headers: CORS });
        }
        let newStatus = fatura.status;
        let dataPagamento = fatura.data_pagamento;
        if (["CONFIRMED", "RECEIVED"].includes(statusData.status)) {
          newStatus = "CONFIRMED";
          dataPagamento = statusData.confirmedDate || statusData.paymentDate || new Date().toISOString().split("T")[0];
        } else if (statusData.status === "OVERDUE") {
          newStatus = "OVERDUE";
        } else if (statusData.status === "PENDING") {
          newStatus = "PENDING";
        }
        await supabase
          .from("faturas")
          .update({
            status: newStatus,
            data_pagamento: dataPagamento,
            url_boleto: statusData.bankSlipUrl || fatura.url_boleto,
            updated_at: new Date().toISOString(),
          })
          .eq("id", fatura.id);
        return new Response(JSON.stringify({ success: true, status: newStatus }), { headers: { ...CORS, "Content-Type": "application/json" } });
      }

      case "manual_confirm": {
        // Manual confirmation by super admin
        const { fatura_id } = params;
        if (!fatura_id) {
          return new Response(JSON.stringify({ error: "Missing fatura_id" }), { status: 400, headers: CORS });
        }
        await supabase
          .from("faturas")
          .update({
            status: "CONFIRMED",
            data_pagamento: new Date().toISOString().split("T")[0],
            updated_at: new Date().toISOString(),
          })
          .eq("id", fatura_id);
        return new Response(JSON.stringify({ success: true }), { headers: { ...CORS, "Content-Type": "application/json" } });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: CORS });
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
