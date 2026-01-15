import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EmendaDB {
  id: string;
  numero: string;
  tipo_concedente: 'parlamentar' | 'comissao' | 'bancada' | 'outro';
  nome_concedente: string;
  tipo_recebedor: 'administracao_publica' | 'entidade_sem_fins_lucrativos' | 'consorcio_publico' | 'pessoa_juridica_privada' | 'outro';
  nome_recebedor: string;
  cnpj_recebedor: string;
  municipio: string;
  estado: string;
  data_disponibilizacao: string;
  gestor_responsavel: string;
  objeto: string;
  grupo_natureza_despesa: string;
  valor: number;
  valor_executado: number;
  banco: string;
  conta_corrente: string;
  anuencia_previa_sus: boolean | null;
  status: 'pendente' | 'aprovado' | 'em_execucao' | 'concluido' | 'cancelado';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEmendaInput {
  numero: string;
  tipo_concedente: 'parlamentar' | 'comissao' | 'bancada' | 'outro';
  nome_concedente: string;
  tipo_recebedor: 'administracao_publica' | 'entidade_sem_fins_lucrativos' | 'consorcio_publico' | 'pessoa_juridica_privada' | 'outro';
  nome_recebedor: string;
  cnpj_recebedor: string;
  municipio: string;
  estado?: string;
  data_disponibilizacao: string;
  gestor_responsavel: string;
  objeto: string;
  grupo_natureza_despesa: string;
  valor: number;
  banco: string;
  conta_corrente: string;
  anuencia_previa_sus?: boolean | null;
}

export const useEmendas = () => {
  return useQuery({
    queryKey: ['emendas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emendas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmendaDB[];
    },
  });
};

export const useEmenda = (id: string) => {
  return useQuery({
    queryKey: ['emenda', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emendas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as EmendaDB;
    },
    enabled: !!id,
  });
};

export const useCreateEmenda = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateEmendaInput) => {
      const { data, error } = await supabase
        .from('emendas')
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
      queryClient.invalidateQueries({ queryKey: ['emendas'] });
      toast.success('Emenda cadastrada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cadastrar emenda: ${error.message}`);
    },
  });
};

export const useUpdateEmenda = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<EmendaDB> & { id: string }) => {
      const { data, error } = await supabase
        .from('emendas')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emendas'] });
      queryClient.invalidateQueries({ queryKey: ['emenda', data.id] });
      toast.success('Emenda atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar emenda: ${error.message}`);
    },
  });
};

export const useDeleteEmenda = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('emendas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emendas'] });
      toast.success('Emenda excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir emenda: ${error.message}`);
    },
  });
};

export const useEmendasStats = () => {
  const { data: emendas } = useEmendas();

  return {
    totalEmendas: emendas?.length ?? 0,
    valorTotal: emendas?.reduce((acc, e) => acc + Number(e.valor), 0) ?? 0,
    valorExecutado: emendas?.reduce((acc, e) => acc + Number(e.valor_executado), 0) ?? 0,
    emendasPendentes: emendas?.filter((e) => e.status === 'pendente').length ?? 0,
    emendasAprovadas: emendas?.filter((e) => e.status === 'aprovado').length ?? 0,
    emendasEmExecucao: emendas?.filter((e) => e.status === 'em_execucao').length ?? 0,
    emendasConcluidas: emendas?.filter((e) => e.status === 'concluido').length ?? 0,
  };
};
