import { Link, useParams } from 'react-router-dom';
import { FileText, Banknote, TrendingUp, Clock, CheckCircle2, PlayCircle, HandCoins, XCircle, ThumbsUp, Receipt, Users } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentEmendas from '@/components/dashboard/RecentEmendas';
import ExecutionChart from '@/components/dashboard/ExecutionChart';
import ValueProgressChart from '@/components/dashboard/ValueProgressChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePrefeituraBySlug } from '@/hooks/usePrefeituras';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo, useState } from 'react';
import { useIsPrefeituraAdmin } from '@/hooks/useUserRoles';
import { FullDashboardSkeleton } from '@/components/ui/skeletons';
import YearFilter from '@/components/dashboard/YearFilter';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

const PrefeturaDashboard = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: prefeitura } = usePrefeituraBySlug(slug ?? '');
  const { isPrefeituraAdmin } = useIsPrefeituraAdmin(prefeitura?.id);

  const { data: emendas, isLoading } = useQuery({
    queryKey: ['emendas', 'prefeitura', prefeitura?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emendas')
        .select('*')
        .eq('prefeitura_id', prefeitura!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!prefeitura?.id,
  });

  const [selectedYear, setSelectedYear] = useState<string>('todos');

  const availableYears = useMemo(() => {
    if (!emendas) return [];
    const years = new Set<number>();
    emendas.forEach((e) => {
      if (e.data_disponibilizacao) {
        years.add(new Date(e.data_disponibilizacao).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [emendas]);

  const filteredEmendas = useMemo(() => {
    if (!emendas) return [];
    if (selectedYear === 'todos') return emendas;
    return emendas.filter(
      (e) =>
        e.data_disponibilizacao &&
        new Date(e.data_disponibilizacao).getFullYear().toString() === selectedYear,
    );
  }, [emendas, selectedYear]);

  const stats = useMemo(() => {
    if (!filteredEmendas) {
      return {
        totalEmendas: 0,
        valorConcedente: 0,
        valorTotal: 0,
        valorExecutado: 0,
        valorContrapartida: 0,
        emendasPendentes: 0,
        emendasAprovadas: 0,
        emendasEmExecucao: 0,
        emendasConcluidas: 0,
        emendasCanceladas: 0,
      };
    }

    const emendasComValor = filteredEmendas.filter((e) => e.status !== 'pendente' && e.status !== 'cancelado');
    const valorConcedente = emendasComValor.reduce((acc, e) => acc + Number(e.valor), 0);
    const valorContrapartida = emendasComValor.reduce((acc, e) => acc + Number(e.contrapartida || 0), 0);
    const valorTotal = valorConcedente + valorContrapartida;

    return {
      totalEmendas: filteredEmendas.length,
      valorConcedente,
      valorTotal,
      valorExecutado: emendasComValor.reduce((acc, e) => acc + Number(e.valor_executado), 0),
      valorContrapartida,
      emendasPendentes: filteredEmendas.filter((e) => e.status === 'pendente').length,
      emendasAprovadas: filteredEmendas.filter((e) => e.status === 'aprovado').length,
      emendasEmExecucao: filteredEmendas.filter((e) => e.status === 'em_execucao').length,
      emendasConcluidas: filteredEmendas.filter((e) => e.status === 'concluido').length,
      emendasCanceladas: filteredEmendas.filter((e) => e.status === 'cancelado').length,
    };
  }, [filteredEmendas]);

  if (isLoading) {
    return <FullDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Visão geral das emendas parlamentares • {prefeitura?.nome}
          </p>
        </div>
        <YearFilter
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={availableYears}
        />
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatsCard
          title="Total de Emendas"
          value={stats.totalEmendas}
          icon={FileText}
          variant="primary"
        />
        <StatsCard
          title="Valor Total"
          value={formatCurrency(stats.valorTotal)}
          subtitle="Concedente + Contrapartida"
          icon={Banknote}
          variant="info"
        />
        <StatsCard
          title="Concedente"
          value={formatCurrency(stats.valorConcedente)}
          icon={Banknote}
          variant="default"
        />
        <StatsCard
          title="Contrapartida"
          value={formatCurrency(stats.valorContrapartida)}
          icon={HandCoins}
          variant="warning"
        />
        <StatsCard
          title="Valor Executado"
          value={formatCurrency(stats.valorExecutado)}
          icon={TrendingUp}
          variant="success"
        />
        <StatsCard
          title="Pendentes"
          value={stats.emendasPendentes}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Aprovadas"
          value={stats.emendasAprovadas}
          icon={ThumbsUp}
          variant="default"
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
        <StatsCard
          title="Canceladas"
          value={stats.emendasCanceladas}
          icon={XCircle}
          variant="warning"
        />
      </div>

      {/* Charts section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ValueProgressChart stats={stats} />
        <ExecutionChart stats={stats} />
      </div>

      {isPrefeituraAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Administração</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to={`/p/${slug}/usuarios`}>
                <Users className="h-4 w-4" />
                Usuários
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/p/${slug}/faturas`}>
                <Receipt className="h-4 w-4" />
                Faturamento
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent emendas */}
      {filteredEmendas && filteredEmendas.length > 0 && (
        <RecentEmendas emendas={filteredEmendas} basePath={`/p/${slug}`} />
      )}

      {/* Empty state */}
      {(!filteredEmendas || filteredEmendas.length === 0) && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            {selectedYear !== 'todos'
              ? `Nenhuma emenda encontrada para ${selectedYear}`
              : 'Nenhuma emenda cadastrada'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedYear !== 'todos'
              ? 'Selecione outro ano ou cadastre novas emendas'
              : 'Comece cadastrando a primeira emenda no sistema'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PrefeturaDashboard;
