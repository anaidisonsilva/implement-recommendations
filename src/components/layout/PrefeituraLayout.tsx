import { ReactNode } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  FileText,
  LogOut,
  Menu,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePrefeituraBySlug } from '@/hooks/usePrefeituras';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PrefeituraLayoutProps {
  children: ReactNode;
}

const PrefeituraLayout = ({ children }: PrefeituraLayoutProps) => {
  const { slug } = useParams<{ slug: string }>();
  const { data: prefeitura } = usePrefeituraBySlug(slug ?? '');
  const { signOut, profile } = useAuth();
  const { data: roles } = useUserRoles();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPrefeituraAdmin = roles?.some(r => r.role === 'prefeitura_admin' || r.role === 'super_admin');

  const navigation = [
    {
      name: 'Dashboard',
      href: `/p/${slug}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      name: 'Emendas',
      href: `/p/${slug}/emendas`,
      icon: FileText,
    },
    ...(isPrefeituraAdmin ? [{
      name: 'Usuários',
      href: `/p/${slug}/usuarios`,
      icon: Users,
    }] : []),
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleSignOut = async () => {
    await signOut();
  };

  const NavContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border p-4">
        {prefeitura?.logo_url ? (
          <img
            src={prefeitura.logo_url}
            alt={prefeitura.nome}
            className="h-10 w-10 rounded-lg object-contain"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">
            {prefeitura?.nome ?? 'Carregando...'}
          </p>
          <p className="text-xs text-muted-foreground">Área Restrita</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-4">
        <div className="mb-3">
          <p className="text-sm font-medium">{profile?.nome_completo ?? 'Usuário'}</p>
          <p className="text-xs text-muted-foreground">{profile?.cargo ?? 'Gestor'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/p/${slug}`}>Portal Público</Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card lg:block">
        <NavContent />
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            {prefeitura?.logo_url ? (
              <img
                src={prefeitura.logo_url}
                alt={prefeitura.nome}
                className="h-8 w-8 rounded-lg object-contain"
              />
            ) : (
              <Building2 className="h-5 w-5 text-primary" />
            )}
            <span className="font-semibold">{prefeitura?.nome}</span>
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <NavContent />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default PrefeituraLayout;
