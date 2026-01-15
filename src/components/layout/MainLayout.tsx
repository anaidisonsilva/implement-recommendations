import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>

        <footer className="border-t border-border bg-card px-4 py-3 text-center text-xs text-muted-foreground">
          <p>
            Portal de Transparência de Emendas Parlamentares • ADPF 854/DF • MPC-MG
          </p>
          <p className="mt-1">
            Em conformidade com a Recomendação MPC-MG nº 01/2025 e Lei Complementar nº 210/2024
          </p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
