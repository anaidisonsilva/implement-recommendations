import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEmendas, useEmendasStats } from '@/hooks/useEmendas';
import ExecutionChart from '@/components/dashboard/ExecutionChart';
import ValueProgressChart from '@/components/dashboard/ValueProgressChart';
import StatusBadge from '@/components/dashboard/StatusBadge';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  Building2,
  Loader2,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// Simple stats card component for this page
const SimpleStatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  subtitle 
}: { 
  title: string; 
  value: string; 
  icon: React.ElementType; 
  subtitle?: string;
}) => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const TransparenciaPublica = () => {
  const { data: emendas, isLoading } = useEmendas();
  const stats = useEmendasStats();

  const recentEmendas = useMemo(() => {
    if (!emendas) return [];
    return emendas.slice(0, 10);
  }, [emendas]);

  const dashboardStats = {
    totalEmendas: stats.totalEmendas,
    valorTotal: stats.valorTotal,
    valorExecutado: stats.valorExecutado,
    emendasPendentes: stats.emendasPendentes,
    emendasAprovadas: stats.emendasAprovadas,
    emendasEmExecucao: stats.emendasEmExecucao,
    emendasConcluidas: stats.emendasConcluidas,
  };

  const percentualExecutado = stats.valorTotal > 0 
    ? ((stats.valorExecutado / stats.valorTotal) * 100).toFixed(1) 
    : '0';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Portal de Transparência
              </h1>
              <p className="mt-1 text-muted-foreground">
                Emendas Parlamentares - Acesso Público
              </p>
            </div>
            <Button asChild>
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                Área Restrita
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Compliance Banner */}
        <div className="mb-8 rounded-xl border border-info/30 bg-info/5 p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-info">Conformidade Legal:</strong> Este portal atende aos 
            requisitos de transparência da Recomendação MPC-MG nº 01/2025, ADPF 854/DF e 
            Lei Complementar 210/2024.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SimpleStatsCard
            title="Total de Emendas"
            value={stats.totalEmendas.toString()}
            icon={FileText}
            subtitle={`${stats.emendasEmExecucao} em execução`}
          />
          <SimpleStatsCard
            title="Valor Total"
            value={formatCurrency(stats.valorTotal)}
            icon={DollarSign}
            subtitle={`${percentualExecutado}% executado`}
          />
          <SimpleStatsCard
            title="Valor Executado"
            value={formatCurrency(stats.valorExecutado)}
            icon={TrendingUp}
            subtitle={`${stats.emendasConcluidas} concluídas`}
          />
          <SimpleStatsCard
            title="Pendentes"
            value={stats.emendasPendentes.toString()}
            icon={Clock}
            subtitle={`${stats.emendasAprovadas} aprovadas`}
          />
        </div>

        {/* Charts */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <ExecutionChart stats={dashboardStats} />
          <ValueProgressChart stats={dashboardStats} />
        </div>

        {/* Recent Emendas Table */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Emendas Cadastradas</h3>
            <span className="text-sm text-muted-foreground">
              Mostrando {recentEmendas.length} de {emendas?.length || 0}
            </span>
          </div>
          
          {recentEmendas.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Concedente</TableHead>
                    <TableHead>Recebedor</TableHead>
                    <TableHead>Município</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">% Exec.</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEmendas.map((emenda) => {
                    const percentExec = Number(emenda.valor) > 0 
                      ? ((Number(emenda.valor_executado) / Number(emenda.valor)) * 100).toFixed(1)
                      : '0';
                    return (
                      <TableRow key={emenda.id}>
                        <TableCell className="font-medium">{emenda.numero}</TableCell>
                        <TableCell>
                          <StatusBadge status={emenda.status} />
                        </TableCell>
                        <TableCell>{emenda.nome_concedente}</TableCell>
                        <TableCell>{emenda.nome_recebedor}</TableCell>
                        <TableCell>{emenda.municipio}/{emenda.estado}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(emenda.valor))}
                        </TableCell>
                        <TableCell className="text-right">{percentExec}%</TableCell>
                        <TableCell>{formatDate(emenda.data_disponibilizacao)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">
                Nenhuma emenda cadastrada ainda.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>
            Portal de Emendas Parlamentares - Sistema de Gestão e Transparência
          </p>
          <p className="mt-1">
            Em conformidade com a Recomendação MPC-MG nº 01/2025
          </p>
        </footer>
      </main>
    </div>
  );
};

export default TransparenciaPublica;
