import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;
      return data as SystemSetting[];
    },
  });
};

export const useSystemSetting = (key: string) => {
  return useQuery({
    queryKey: ['system-settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', key)
        .maybeSingle();

      if (error) throw error;
      return data as SystemSetting | null;
    },
  });
};

export const useUpdateSystemSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data, error } = await supabase
        .from('system_settings')
        .update({ value })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('Configuração atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating system setting:', error);
      toast.error('Erro ao atualizar configuração');
    },
  });
};

// Helper hook to get system name and subtitle
export const useSystemName = () => {
  const { data: settings, isLoading } = useSystemSettings();
  
  const systemName = settings?.find(s => s.key === 'system_name')?.value || 'Portal de Emendas';
  const systemSubtitle = settings?.find(s => s.key === 'system_subtitle')?.value || 'Transparência e Rastreabilidade';
  
  return { systemName, systemSubtitle, isLoading };
};
