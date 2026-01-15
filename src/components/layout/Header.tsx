import { Menu, Bell, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSystemName } from '@/hooks/useSystemSettings';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { systemName, systemSubtitle } = useSystemName();
  
  // Get initials from system name (first letter of first two words)
  const initials = systemName
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  return (
    <header className="sticky top-0 z-50 w-full bg-header text-header-foreground shadow-md">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-header-foreground hover:bg-primary/20"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
              <span className="text-lg font-bold">{initials}</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold leading-tight">{systemName}</h1>
              <p className="text-xs text-header-foreground/70">{systemSubtitle}</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar emendas..."
              className="w-full pl-10 bg-header-foreground/10 border-header-foreground/20 text-header-foreground placeholder:text-header-foreground/50 focus:bg-header-foreground/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-primary/20">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-primary/20">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
