import { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PortalBreadcrumb from '@/components/prefeitura/PortalBreadcrumb';
import { usePrefeituraBySlug } from '@/hooks/usePrefeituras';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useYearFilter } from '@/hooks/useYearFilter';
import LastUpdatedBanner from '@/components/prefeitura/LastUpdatedBanner';
import StatusBadge from '@/components/dashboard/StatusBadge';
import PublicDashboardCharts from '@/components/dashboard/PublicDashboardCharts';
import YearFilter from '@/components/dashboard/YearFilter';
import PublicExportDialog from '@/components/emendas/PublicExportDialog';
import {
  ArrowLeft,
  Loader2,
  FileText,
  Banknote,
  TrendingUp,
  Building2,
  Eye,
  Zap,
  HandCoins,
  Clock,
  PlayCircle,
  CheckCircle2,
  BarChart3,
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
import StatsCard from '@/components/dashboard/StatsCard';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const PrefeituraPixPublica = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { data: prefeitura, isLoading: loadingPrefeitura, error } = usePrefeituraBySlug(slug ?? '');

  const { data: emendas, isLoading: loadingEmendas } = useQuery({
    queryKey: ['emendas', 'prefeitura', 'pix', prefeitura?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emendas')
        .select('*')
        .eq('prefeitura_id', prefeitura!.id)
        .eq('especial', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!prefeitura?.id,
  });

  const { selectedYear, setSelectedYear, availableYears, filteredEmendas, stats } = useYearFilter(emendas ?? []);

  if (loadingPrefeitura || loadingEmendas) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !prefeitura) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Prefeitura não encontrada</h1>
        <Button asChild className="mt-6">
          <Link to="/">Voltar ao Portal Principal</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dashboard PIX</h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning">
                    <Zap className="h-3 w-3" />
                    {prefeitura.nome}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">Emendas especiais / PIX da prefeitura</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <YearFilter
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                availableYears={availableYears}
              />
              <Button variant="outline" asChild>
                <Link to={`/p/${slug}/relatorios`}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Relatórios
                </Link>
              </Button>
              <PublicExportDialog
                emendas={filteredEmendas.map((e) => ({
                  id: e.id,
                  numero: e.numero,
                  objeto: e.objeto,
                  nome_concedente: e.nome_concedente,
                  nome_parlamentar: e.nome_parlamentar,
                  nome_recebedor: e.nome_recebedor,
                  municipio: e.municipio,
                  estado: e.estado,
                  valor: Number(e.valor),
                  valor_executado: Number(e.valor_executado),
                  status: e.status,
                  data_disponibilizacao: e.data_disponibilizacao,
                }))}
                title="Exportar Emendas PIX"
                prefeitura={prefeitura ? { nome: prefeitura.nome, cnpj: prefeitura.cnpj, logo_url: prefeitura.logo_url, municipio: prefeitura.municipio, estado: prefeitura.estado } : null}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PortalBreadcrumb slug={slug!} items={[{ label: 'Dashboard PIX' }]} />
        <LastUpdatedBanner emendas={emendas} />
        <div className="mb-8 rounded-xl border border-warning/30 bg-warning/10 p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-warning">Painel público PIX:</strong> exibe apenas emendas especiais / PIX desta prefeitura.
          </p>
        </div>

        <div className="mb-4 grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Emendas PIX" value={stats.totalEmendas} icon={Zap} variant="primary" />
          <StatsCard title="Valor Total" value={formatCurrency(stats.valorTotal)} icon={Banknote} variant="info" />
          <StatsCard title="Concedente" value={formatCurrency(stats.valorConcedente)} icon={Banknote} variant="default" />
          <StatsCard title="Contrapartida" value={formatCurrency(stats.valorContrapartida)} icon={HandCoins} variant="warning" />
        </div>
        <div className="mb-8 grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Valor Executado" value={formatCurrency(stats.valorExecutado)} icon={TrendingUp} variant="success" />
          <StatsCard title="Pendentes" value={stats.emendasPendentes} icon={Clock} variant="warning" />
          <StatsCard title="Em Execução" value={stats.emendasEmExecucao} icon={PlayCircle} variant="info" />
          <StatsCard title="Concluídas" value={stats.emendasConcluidas} icon={CheckCircle2} variant="success" />
        </div>

        <div className="mb-8">
          <PublicDashboardCharts stats={stats} />
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground">Emendas PIX</h3>
                <p className="text-sm text-muted-foreground">{filteredEmendas.length} registro(s)</p>
              </div>
              <Button variant="outline" asChild>
                <Link to={`/p/${slug}`}>Ver portal completo</Link>
              </Button>
            </div>
          </div>

          {filteredEmendas.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmendas.map((emenda) => (
                    <TableRow key={emenda.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{emenda.numero || 'Programa'}</span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
                            <Zap className="h-3 w-3" /> PIX
                          </span>
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={emenda.status as any} /></TableCell>
                      <TableCell className="max-w-[280px] truncate">{emenda.objeto}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(emenda.valor))}</TableCell>
                      <TableCell>{formatDate(emenda.data_disponibilizacao)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/p/${slug}/emenda/${emenda.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">Nenhuma emenda PIX encontrada</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PrefeituraPixPublica;
