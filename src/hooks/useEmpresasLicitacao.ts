import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EmpresaLicitacao {
  id: string;
  emenda_id: string;
  nome_empresa: string;
  cnpj: string;
  numero_empenho: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Pagamento {
  id: string;
  empresa_id: string;
  valor: number;
  data_pagamento: string;
  descricao: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface EmpresaWithPagamentos extends EmpresaLicitacao {
  pagamentos: Pagamento[];
}

// Fetch empresas for a specific emenda
export const useEmpresasByEmenda = (emendaId: string) => {
  return useQuery({
    queryKey: ['empresas_licitacao', emendaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas_licitacao')
        .select(`
          *,
          pagamentos (*)
        `)
        .eq('emenda_id', emendaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmpresaWithPagamentos[];
    },
    enabled: !!emendaId,
  });
};

// Create empresa
export const useCreateEmpresa = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      emenda_id: string;
      nome_empresa: string;
      cnpj: string;
      numero_empenho: string;
    }) => {
      const { data, error } = await supabase
        .from('empresas_licitacao')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['empresas_licitacao', variables.emenda_id] });
      toast.success('Empresa cadastrada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cadastrar empresa: ${error.message}`);
    },
  });
};

// Update empresa
export const useUpdateEmpresa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<EmpresaLicitacao> & { id: string }) => {
      const { data, error } = await supabase
        .from('empresas_licitacao')
        .update({
          nome_empresa: input.nome_empresa,
          cnpj: input.cnpj,
          numero_empenho: input.numero_empenho,
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['empresas_licitacao'] });
      toast.success('Empresa atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar empresa: ${error.message}`);
    },
  });
};

// Delete empresa
export const useDeleteEmpresa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('empresas_licitacao').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas_licitacao'] });
      toast.success('Empresa excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir empresa: ${error.message}`);
    },
  });
};

// Create pagamento
export const useCreatePagamento = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      empresa_id: string;
      valor: number;
      data_pagamento: string;
      descricao?: string;
    }) => {
      const { data, error } = await supabase
        .from('pagamentos')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas_licitacao'] });
      toast.success('Pagamento registrado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar pagamento: ${error.message}`);
    },
  });
};

// Update pagamento
export const useUpdatePagamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<Pagamento> & { id: string }) => {
      const { data, error } = await supabase
        .from('pagamentos')
        .update({
          valor: input.valor,
          data_pagamento: input.data_pagamento,
          descricao: input.descricao,
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas_licitacao'] });
      toast.success('Pagamento atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar pagamento: ${error.message}`);
    },
  });
};

// Delete pagamento
export const useDeletePagamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pagamentos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas_licitacao'] });
      toast.success('Pagamento excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir pagamento: ${error.message}`);
    },
  });
};