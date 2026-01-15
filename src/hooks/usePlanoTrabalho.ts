import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PlanoTrabalhoDB {
  id: string;
  emenda_id: string;
  objeto: string;
  finalidade: string;
  estimativa_recursos: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CronogramaItemDB {
  id: string;
  plano_trabalho_id: string;
  etapa: string;
  data_inicio: string;
  data_fim: string;
  percentual_conclusao: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentoDB {
  id: string;
  emenda_id: string | null;
  plano_trabalho_id: string | null;
  nome: string;
  tipo: string;
  url: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface CreatePlanoTrabalhoInput {
  emenda_id: string;
  objeto: string;
  finalidade: string;
  estimativa_recursos: number;
}

export interface CreateCronogramaItemInput {
  plano_trabalho_id: string;
  etapa: string;
  data_inicio: string;
  data_fim: string;
  percentual_conclusao?: number;
}

// Plano de Trabalho Hooks
export const usePlanoTrabalho = (emendaId: string) => {
  return useQuery({
    queryKey: ['plano-trabalho', emendaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planos_trabalho')
        .select('*')
        .eq('emenda_id', emendaId)
        .maybeSingle();

      if (error) throw error;
      return data as PlanoTrabalhoDB | null;
    },
    enabled: !!emendaId,
  });
};

export const useCreatePlanoTrabalho = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreatePlanoTrabalhoInput) => {
      const { data, error } = await supabase
        .from('planos_trabalho')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plano-trabalho', data.emenda_id] });
      toast.success('Plano de trabalho criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar plano de trabalho: ${error.message}`);
    },
  });
};

export const useUpdatePlanoTrabalho = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<PlanoTrabalhoDB> & { id: string }) => {
      const { data, error } = await supabase
        .from('planos_trabalho')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plano-trabalho', data.emenda_id] });
      toast.success('Plano de trabalho atualizado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
};

// Cronograma Hooks
export const useCronogramaItems = (planoTrabalhoId: string) => {
  return useQuery({
    queryKey: ['cronograma', planoTrabalhoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cronograma_itens')
        .select('*')
        .eq('plano_trabalho_id', planoTrabalhoId)
        .order('data_inicio', { ascending: true });

      if (error) throw error;
      return data as CronogramaItemDB[];
    },
    enabled: !!planoTrabalhoId,
  });
};

export const useCreateCronogramaItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCronogramaItemInput) => {
      const { data, error } = await supabase
        .from('cronograma_itens')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cronograma', data.plano_trabalho_id] });
      toast.success('Etapa adicionada ao cronograma!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar etapa: ${error.message}`);
    },
  });
};

export const useUpdateCronogramaItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, plano_trabalho_id, ...input }: Partial<CronogramaItemDB> & { id: string; plano_trabalho_id: string }) => {
      const { data, error } = await supabase
        .from('cronograma_itens')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, plano_trabalho_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cronograma', data.plano_trabalho_id] });
      toast.success('Etapa atualizada!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar etapa: ${error.message}`);
    },
  });
};

export const useDeleteCronogramaItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, planoTrabalhoId }: { id: string; planoTrabalhoId: string }) => {
      const { error } = await supabase.from('cronograma_itens').delete().eq('id', id);
      if (error) throw error;
      return planoTrabalhoId;
    },
    onSuccess: (planoTrabalhoId) => {
      queryClient.invalidateQueries({ queryKey: ['cronograma', planoTrabalhoId] });
      toast.success('Etapa removida!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover etapa: ${error.message}`);
    },
  });
};

// Documentos Hooks
export const useDocumentos = (planoTrabalhoId: string) => {
  return useQuery({
    queryKey: ['documentos', planoTrabalhoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('plano_trabalho_id', planoTrabalhoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DocumentoDB[];
    },
    enabled: !!planoTrabalhoId,
  });
};

export const useUploadDocumento = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ file, planoTrabalhoId, tipo }: { file: File; planoTrabalhoId: string; tipo: string }) => {
      // Upload file to storage
      const filePath = `${user?.id}/${planoTrabalhoId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);

      // Insert document record
      const { data, error } = await supabase
        .from('documentos')
        .insert({
          plano_trabalho_id: planoTrabalhoId,
          nome: file.name,
          tipo,
          url: urlData.publicUrl,
          uploaded_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documentos', data.plano_trabalho_id] });
      toast.success('Documento enviado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao enviar documento: ${error.message}`);
    },
  });
};

export const useDeleteDocumento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, planoTrabalhoId, url }: { id: string; planoTrabalhoId: string; url: string }) => {
      // Extract file path from URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/storage/v1/object/public/documentos/');
      if (pathParts[1]) {
        await supabase.storage.from('documentos').remove([decodeURIComponent(pathParts[1])]);
      }

      const { error } = await supabase.from('documentos').delete().eq('id', id);
      if (error) throw error;
      return planoTrabalhoId;
    },
    onSuccess: (planoTrabalhoId) => {
      queryClient.invalidateQueries({ queryKey: ['documentos', planoTrabalhoId] });
      toast.success('Documento removido!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover documento: ${error.message}`);
    },
  });
};
