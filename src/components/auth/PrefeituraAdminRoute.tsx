import { Navigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePrefeituraBySlug } from '@/hooks/usePrefeituras';
import { useIsPrefeituraAdmin } from '@/hooks/useUserRoles';

interface PrefeituraAdminRouteProps {
  children: React.ReactNode;
}

const PrefeituraAdminRoute = ({ children }: PrefeituraAdminRouteProps) => {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const { data: prefeitura, isLoading: prefeituraLoading } = usePrefeituraBySlug(slug ?? '');
  const { isPrefeituraAdmin, isLoading: rolesLoading } = useIsPrefeituraAdmin(prefeitura?.id);

  if (authLoading || prefeituraLoading || rolesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/p/${slug}/auth`} replace />;
  }

  if (!isPrefeituraAdmin) {
    return <Navigate to={`/p/${slug}/dashboard`} replace />;
  }

  return <>{children}</>;
};

export default PrefeituraAdminRoute;
