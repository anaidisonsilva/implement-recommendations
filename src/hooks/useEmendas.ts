import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { toast } from 'sonner';

export interface EmendaDB {
  id: string;
  numero: string;
  tipo_concedente: 'parlamentar' | 'comissao' | 'bancada' | 'outro';
  nome_concedente: string | null;
  nome_parlamentar: string | null;
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
  banco: string | null;
  conta_corrente: string | null;
  anuencia_previa_sus: boolean | null;
  contrapartida: number | null;
  numero_convenio: string | null;
  numero_plano_acao: string | null;
  numero_proposta: string | null;
  data_inicio_vigencia: string | null;
  data_fim_vigencia: string | null;
  status: 'pendente' | 'aprovado' | 'em_execucao' | 'concluido' | 'cancelado';
  created_by: string | null;
  prefeitura_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEmendaInput {
  numero: string;
  tipo_concedente: 'parlamentar' | 'comissao' | 'bancada' | 'outro';
  nome_concedente?: string | null;
  nome_parlamentar?: string | null;
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
  banco?: string | null;
  conta_corrente?: string | null;
  anuencia_previa_sus?: boolean | null;
  contrapartida?: number | null;
  numero_convenio?: string | null;
  numero_plano_acao?: string | null;
  numero_proposta?: string | null;
  data_inicio_vigencia?: string | null;
  data_fim_vigencia?: string | null;
}

export const useEmendas = () => {
  const { data: roles } = useUserRoles();
  
  const isSuperAdmin = roles?.some(r => r.role === 'super_admin') ?? false;
  const prefeituraId = roles?.find(r => r.prefeitura_id)?.prefeitura_id ?? null;

  return useQuery({
    queryKey: ['emendas', isSuperAdmin, prefeituraId],
    queryFn: async () => {
      let query = supabase
        .from('emendas')
        .select('*')
        .order('created_at', { ascending: false });

      // Se não for super_admin, filtra pela prefeitura do usuário
      if (!isSuperAdmin && prefeituraId) {
        query = query.eq('prefeitura_id', prefeituraId);
      } else if (!isSuperAdmin && !prefeituraId) {
        // Usuário sem prefeitura associada não vê nenhuma emenda
        return [];
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as EmendaDB[];
    },
    enabled: roles !== undefined,
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
  const { data: roles } = useUserRoles();
  
  const prefeituraId = roles?.find(r => r.prefeitura_id)?.prefeitura_id ?? null;

  return useMutation({
    mutationFn: async (input: CreateEmendaInput & { prefeitura_id?: string }) => {
      const { data, error } = await supabase
        .from('emendas')
        .insert({
          ...input,
          created_by: user?.id,
          prefeitura_id: input.prefeitura_id ?? prefeituraId,
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

  const valorConcedente = emendas?.reduce((acc, e) => acc + Number(e.valor), 0) ?? 0;
  const valorContrapartida = emendas?.reduce((acc, e) => acc + Number(e.contrapartida || 0), 0) ?? 0;
  const valorTotal = valorConcedente + valorContrapartida;

  return {
    totalEmendas: emendas?.length ?? 0,
    valorConcedente,
    valorTotal,
    valorExecutado: emendas?.reduce((acc, e) => acc + Number(e.valor_executado), 0) ?? 0,
    valorContrapartida,
    emendasPendentes: emendas?.filter((e) => e.status === 'pendente').length ?? 0,
    emendasAprovadas: emendas?.filter((e) => e.status === 'aprovado').length ?? 0,
    emendasEmExecucao: emendas?.filter((e) => e.status === 'em_execucao').length ?? 0,
    emendasConcluidas: emendas?.filter((e) => e.status === 'concluido').length ?? 0,
  };
};
