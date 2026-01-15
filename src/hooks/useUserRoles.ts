import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type AppRole = 'super_admin' | 'prefeitura_admin' | 'prefeitura_user';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  prefeitura_id: string | null;
  created_at: string;
}

export const useUserRoles = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user_roles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!user,
  });
};

export const useIsSuperAdmin = () => {
  const { data: roles, isLoading } = useUserRoles();
  
  return {
    isSuperAdmin: roles?.some(r => r.role === 'super_admin') ?? false,
    isLoading,
  };
};

export const useUserPrefeitura = () => {
  const { data: roles, isLoading } = useUserRoles();
  
  const prefeituraRole = roles?.find(r => r.prefeitura_id);
  
  return {
    prefeituraId: prefeituraRole?.prefeitura_id ?? null,
    role: prefeituraRole?.role ?? null,
    isLoading,
  };
};

export const useAllUserRoles = () => {
  return useQuery({
    queryKey: ['all_user_roles'],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          prefeituras (nome, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for all users
      const userIds = [...new Set(roles?.map(r => r.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nome_completo, email')
        .in('user_id', userIds);

      // Map profiles to roles
      const profileMap = new Map(profiles?.map(p => [p.user_id, { nome: p.nome_completo, email: p.email }]) || []);
      
      return roles?.map(role => ({
        ...role,
        profile_nome: profileMap.get(role.user_id)?.nome || null,
        profile_email: profileMap.get(role.user_id)?.email || null,
      })) || [];
    },
  });
};

export const useCreateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { user_id: string; role: AppRole; prefeitura_id?: string }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_roles'] });
      queryClient.invalidateQueries({ queryKey: ['all_user_roles'] });
      toast.success('Permissão atribuída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atribuir permissão: ${error.message}`);
    },
  });
};

export const useDeleteUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_roles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_roles'] });
      queryClient.invalidateQueries({ queryKey: ['all_user_roles'] });
      toast.success('Permissão removida com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover permissão: ${error.message}`);
    },
  });
};
