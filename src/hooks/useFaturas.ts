import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Fatura {
  id: string;
  prefeitura_id: string;
  asaas_payment_id: string | null;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: string;
  mes_referencia: string;
  url_boleto: string | null;
  url_boleto_pdf: string | null;
  linha_digitavel: string | null;
  created_at: string;
  updated_at: string;
  prefeituras?: { nome: string; slug: string };
}

export const useFaturas = (prefeituraId?: string) => {
  return useQuery({
    queryKey: ['faturas', prefeituraId],
    queryFn: async () => {
      let query = supabase
        .from('faturas')
        .select('*, prefeituras(nome, slug)')
        .order('data_vencimento', { ascending: false });

      if (prefeituraId) {
        query = query.eq('prefeitura_id', prefeituraId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Fatura[];
    },
  });
};

export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { prefeitura_id: string; valor: number; mes_referencia: string }) => {
      const { data, error } = await supabase.functions.invoke('asaas-billing', {
        body: { action: 'generate_invoice', ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faturas'] });
      toast.success('Fatura gerada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao gerar fatura: ${error.message}`);
    },
  });
};

export const useCreateAsaasCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { prefeitura_id: string; nome: string; cnpj: string; email?: string }) => {
      const { data, error } = await supabase.functions.invoke('asaas-billing', {
        body: { action: 'create_customer', ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prefeituras'] });
      toast.success('Cliente cadastrado no Asaas!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cadastrar cliente: ${error.message}`);
    },
  });
};

export const useManualConfirm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fatura_id: string) => {
      const { data, error } = await supabase.functions.invoke('asaas-billing', {
        body: { action: 'manual_confirm', fatura_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faturas'] });
      toast.success('Pagamento confirmado manualmente!');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
};

export const useCheckInvoiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fatura_id: string) => {
      const { data, error } = await supabase.functions.invoke('asaas-billing', {
        body: { action: 'check_status', fatura_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faturas'] });
      toast.success('Status atualizado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
};

export const usePrefeituraBlockStatus = (prefeituraId?: string | null) => {
  return useQuery({
    queryKey: ['block_status', prefeituraId],
    queryFn: async () => {
      if (!prefeituraId) return { blocked: false, reason: null };

      // Check if prefeitura is in test mode
      const { data: pref } = await supabase
        .from('prefeituras')
        .select('is_teste')
        .eq('id', prefeituraId)
        .single();

      if (pref?.is_teste) return { blocked: false, reason: null };

      // Check for overdue invoices (10+ days past due)
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const { data: overdue } = await supabase
        .from('faturas')
        .select('id, data_vencimento, mes_referencia')
        .eq('prefeitura_id', prefeituraId)
        .in('status', ['PENDING', 'OVERDUE'])
        .lte('data_vencimento', tenDaysAgo.toISOString().split('T')[0])
        .limit(1);

      if (overdue && overdue.length > 0) {
        return {
          blocked: true,
          reason: `Fatura vencida há mais de 10 dias (Ref: ${overdue[0].mes_referencia}). Entre em contato com o suporte para regularizar.`,
        };
      }

      return { blocked: false, reason: null };
    },
    enabled: !!prefeituraId,
    refetchInterval: 60000,
  });
};
