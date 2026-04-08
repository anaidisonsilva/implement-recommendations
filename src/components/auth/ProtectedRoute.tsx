import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { data: roles, isLoading: rolesLoading } = useUserRoles();

  // If user is prefeitura_admin/user (not super_admin), get their prefeitura slug
  const prefeituraId = roles?.find(r => r.prefeitura_id)?.prefeitura_id;
  const isSuperAdmin = roles?.some(r => r.role === 'super_admin') ?? false;
  const isOnGlobalRoute = !location.pathname.startsWith('/p/');

  const { data: prefeitura, isLoading: prefLoading } = useQuery({
    queryKey: ['prefeitura_slug', prefeituraId],
    queryFn: async () => {
      const { data } = await supabase
        .from('prefeituras')
        .select('slug')
        .eq('id', prefeituraId!)
        .single();
      return data;
    },
    enabled: !!prefeituraId && !isSuperAdmin && isOnGlobalRoute,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    const prefeituraMatch = location.pathname.match(/^\/p\/([^/]+)/);
    const redirectPath = prefeituraMatch
      ? `/p/${prefeituraMatch[1]}/auth`
      : '/auth';
    return <Navigate to={redirectPath} replace />;
  }

  // Wait for roles to load
  if (rolesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect prefeitura users from global routes to their prefeitura panel
  if (!isSuperAdmin && isOnGlobalRoute && prefeituraId) {
    if (prefLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    if (prefeitura?.slug) {
      return <Navigate to={`/p/${prefeitura.slug}/dashboard`} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
