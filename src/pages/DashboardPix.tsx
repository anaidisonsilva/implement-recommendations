import { FileText, Banknote, TrendingUp, Clock, CheckCircle2, PlayCircle, Loader2, HandCoins, Zap, ThumbsUp, XCircle } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentEmendas from '@/components/dashboard/RecentEmendas';
import ExecutionChart from '@/components/dashboard/ExecutionChart';
import ValueProgressChart from '@/components/dashboard/ValueProgressChart';
import VigenciaCards from '@/components/dashboard/VigenciaCards';
import YearFilter from '@/components/dashboard/YearFilter';
import { useEmendas } from '@/hooks/useEmendas';
import { useYearFilter } from '@/hooks/useYearFilter';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

const DashboardPix = () => {
  const { data: allEmendas, isLoading } = useEmendas();

  // Filter only especial/PIX emendas
  const emendasPix = useMemo(() => {
    if (!allEmendas) return [];
    return allEmendas.filter((e) => e.especial === true);
  }, [allEmendas]);

  const { selectedYear, setSelectedYear, availableYears, filteredEmendas, stats } = useYearFilter(emendasPix);

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Dashboard Emendas PIX</h1>
            <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 gap-1">
              <Zap className="h-3 w-3" />
              Especial / PIX
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            Visão exclusiva das emendas especiais (PIX) • ADPF 854/DF
          </p>
        </div>
        <YearFilter
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={availableYears}
        />
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8">
        <StatsCard title="Emendas PIX" value={stats.totalEmendas} icon={Zap} variant="primary" />
        <StatsCard title="Valor Total" value={formatCurrency(stats.valorTotal)} subtitle="Concedente + Contrapartida" icon={Banknote} variant="info" />
        <StatsCard title="Concedente" value={formatCurrency(stats.valorConcedente)} icon={Banknote} variant="default" />
        <StatsCard title="Contrapartida" value={formatCurrency(stats.valorContrapartida)} icon={HandCoins} variant="warning" />
        <StatsCard title="Valor Executado" value={formatCurrency(stats.valorExecutado)} icon={TrendingUp} variant="success" />
        <StatsCard title="Pendentes" value={stats.emendasPendentes} icon={Clock} variant="warning" />
        <StatsCard title="Aprovadas" value={stats.emendasAprovadas} icon={ThumbsUp} variant="info" />
        <StatsCard title="Em Execução" value={stats.emendasEmExecucao} icon={PlayCircle} variant="info" />
        <StatsCard title="Concluídas" value={stats.emendasConcluidas} icon={CheckCircle2} variant="success" />
        <StatsCard title="Canceladas" value={stats.emendasCanceladas} icon={XCircle} variant="destructive" />
      </div>

      {/* Charts section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ValueProgressChart stats={stats} />
        <ExecutionChart stats={stats} />
      </div>

      {/* Vigência Cards */}
      <VigenciaCards emendas={filteredEmendas} />

      {/* Recent emendas */}
      {filteredEmendas && filteredEmendas.length > 0 && <RecentEmendas emendas={filteredEmendas} />}

      {/* Empty state */}
      {(!filteredEmendas || filteredEmendas.length === 0) && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <Zap className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            {selectedYear !== 'todos'
              ? `Nenhuma emenda PIX encontrada para ${selectedYear}`
              : 'Nenhuma emenda PIX cadastrada'
            }
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedYear !== 'todos'
              ? 'Selecione outro ano ou cadastre novas emendas especiais'
              : 'Cadastre emendas marcadas como "Especial" para vê-las aqui'
            }
          </p>
        </div>
      )}

      {/* Compliance notice */}
      <div className="rounded-xl border border-info/30 bg-info/5 p-4">
        <h4 className="font-medium text-info">Conformidade ADPF 854/DF — Emendas PIX</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          As emendas especiais (PIX) exigem acompanhamento diferenciado conforme determinado pelo STF.
          Este painel permite monitoramento específico dessas transferências conforme a Recomendação MPC-MG nº 01/2025.
        </p>
      </div>
    </div>
  );
};

export default DashboardPix;
