import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Prefeitura {
  id: string;
  nome: string;
  slug: string;
  cnpj: string | null;
  estado: string;
  municipio: string;
  logo_url: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePrefeituraInput {
  nome: string;
  slug: string;
  cnpj?: string;
  estado?: string;
  municipio: string;
  logo_url?: string;
}

export const usePrefeituras = () => {
  return useQuery({
    queryKey: ['prefeituras'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prefeituras')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      return data as Prefeitura[];
    },
  });
};

export const usePrefeitura = (id: string) => {
  return useQuery({
    queryKey: ['prefeitura', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prefeituras')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Prefeitura;
    },
    enabled: !!id,
  });
};

export const usePrefeituraBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['prefeitura', 'slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prefeituras')
        .select('*')
        .eq('slug', slug)
        .eq('ativo', true)
        .single();

      if (error) throw error;
      return data as Prefeitura;
    },
    enabled: !!slug,
  });
};

export const useCreatePrefeitura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePrefeituraInput) => {
      const { data, error } = await supabase
        .from('prefeituras')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prefeituras'] });
      toast.success('Prefeitura cadastrada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cadastrar prefeitura: ${error.message}`);
    },
  });
};

export const useUpdatePrefeitura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Prefeitura> & { id: string }) => {
      const { data, error } = await supabase
        .from('prefeituras')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['prefeituras'] });
      queryClient.invalidateQueries({ queryKey: ['prefeitura', data.id] });
      toast.success('Prefeitura atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar prefeitura: ${error.message}`);
    },
  });
};

export const useDeletePrefeitura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('prefeituras').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prefeituras'] });
      toast.success('Prefeitura excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir prefeitura: ${error.message}`);
    },
  });
};
