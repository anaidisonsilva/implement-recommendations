import { FileText, Banknote, TrendingUp, Clock, CheckCircle2, PlayCircle, Loader2, HandCoins } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentEmendas from '@/components/dashboard/RecentEmendas';
import ExecutionChart from '@/components/dashboard/ExecutionChart';
import ValueProgressChart from '@/components/dashboard/ValueProgressChart';
import { useEmendas, useEmendasStats } from '@/hooks/useEmendas';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

const Dashboard = () => {
  const { data: emendas, isLoading } = useEmendas();
  const stats = useEmendasStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Visão geral das emendas parlamentares • ADPF 854/DF
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatsCard
          title="Total de Emendas"
          value={stats.totalEmendas}
          icon={FileText}
          variant="primary"
        />
        <StatsCard
          title="Valor Total"
          value={formatCurrency(stats.valorTotal)}
          icon={Banknote}
          variant="info"
        />
        <StatsCard
          title="Valor Executado"
          value={formatCurrency(stats.valorExecutado)}
          icon={TrendingUp}
          variant="success"
        />
        <StatsCard
          title="Contrapartida"
          value={formatCurrency(stats.valorContrapartida)}
          icon={HandCoins}
          variant="warning"
        />
        <StatsCard
          title="Pendentes"
          value={stats.emendasPendentes}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Em Execução"
          value={stats.emendasEmExecucao}
          icon={PlayCircle}
          variant="info"
        />
        <StatsCard
          title="Concluídas"
          value={stats.emendasConcluidas}
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      {/* Charts section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ValueProgressChart stats={stats} />
        <ExecutionChart stats={stats} />
      </div>

      {/* Recent emendas */}
      {emendas && emendas.length > 0 && <RecentEmendas emendas={emendas} />}

      {/* Empty state */}
      {(!emendas || emendas.length === 0) && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Nenhuma emenda cadastrada
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Comece cadastrando a primeira emenda no sistema
          </p>
        </div>
      )}

      {/* Compliance notice */}
      <div className="rounded-xl border border-info/30 bg-info/5 p-4">
        <h4 className="font-medium text-info">Conformidade ADPF 854/DF</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Este portal atende às exigências da Recomendação MPC-MG nº 01/2025 e da Lei Complementar nº 210/2024, 
          garantindo transparência e rastreabilidade das emendas parlamentares conforme determinado pelo STF.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
