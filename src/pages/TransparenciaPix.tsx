import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEmendas } from '@/hooks/useEmendas';
import { useYearFilter } from '@/hooks/useYearFilter';
import { useFooterSettings } from '@/hooks/useSystemSettings';
import StatsCard from '@/components/dashboard/StatsCard';
import ExecutionChart from '@/components/dashboard/ExecutionChart';
import ValueProgressChart from '@/components/dashboard/ValueProgressChart';
import StatusBadge from '@/components/dashboard/StatusBadge';
import PublicExportDialog from '@/components/emendas/PublicExportDialog';
import PaginationControls from '@/components/ui/pagination-controls';
import YearFilter from '@/components/dashboard/YearFilter';
import {
  ArrowLeft,
  FileText,
  Banknote,
  TrendingUp,
  Clock,
  CheckCircle2,
  PlayCircle,
  Building2,
  Loader2,
  Eye,
  Zap,
  HandCoins,
  ThumbsUp,
  XCircle,
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const DynamicFooter = () => {
  const { footerText, footerCompliance } = useFooterSettings();

  return (
    <footer className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
      <p>{footerText}</p>
      <p className="mt-1">{footerCompliance}</p>
    </footer>
  );
};

const TransparenciaPix = () => {
  const { data: emendas, isLoading } = useEmendas();
  const emendasPix = useMemo(() => (emendas ?? []).filter((emenda) => emenda.especial), [emendas]);
  const { selectedYear, setSelectedYear, availableYears, filteredEmendas, stats } = useYearFilter(emendasPix);
  const paginatedEmendas = filteredEmendas.slice(0, 10);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/transparencia">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dashboard PIX</h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning">
                    <Zap className="h-3 w-3" />
                    Emendas especiais
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">Portal público das emendas especiais / PIX</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <YearFilter
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                availableYears={availableYears}
              />
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
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-xl border border-warning/30 bg-warning/10 p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-warning">Painel público PIX:</strong> aqui aparecem somente as emendas marcadas como especiais / PIX.
          </p>
        </div>

        <div className="mb-8 grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Emendas PIX" value={stats.totalEmendas} icon={Zap} variant="primary" />
          <StatsCard title="Valor Total" value={formatCurrency(stats.valorTotal)} icon={Banknote} variant="info" />
          <StatsCard title="Concedente" value={formatCurrency(stats.valorConcedente)} icon={Banknote} variant="default" />
          <StatsCard title="Contrapartida" value={formatCurrency(stats.valorContrapartida)} icon={HandCoins} variant="warning" />
        </div>
        <div className="mb-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <StatsCard title="Valor Executado" value={formatCurrency(stats.valorExecutado)} icon={TrendingUp} variant="success" />
          <StatsCard title="Pendentes" value={stats.emendasPendentes} icon={Clock} variant="warning" />
          <StatsCard title="Aprovadas" value={stats.emendasAprovadas} icon={ThumbsUp} variant="info" />
          <StatsCard title="Em Execução" value={stats.emendasEmExecucao} icon={PlayCircle} variant="info" />
          <StatsCard title="Concluídas" value={stats.emendasConcluidas} icon={CheckCircle2} variant="success" />
          <StatsCard title="Canceladas" value={stats.emendasCanceladas} icon={XCircle} variant="warning" />
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <ValueProgressChart stats={stats} />
          <ExecutionChart stats={stats} />
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground">Emendas PIX cadastradas</h3>
                <p className="text-sm text-muted-foreground">
                  {filteredEmendas.length} registro(s) {selectedYear !== 'todos' && `em ${selectedYear}`}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/transparencia">Ver todas</Link>
              </Button>
            </div>
          </div>

          {paginatedEmendas.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Concedente</TableHead>
                      <TableHead>Município</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEmendas.map((emenda) => (
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
                        <TableCell className="max-w-[180px] truncate">{emenda.nome_concedente || '-'}</TableCell>
                        <TableCell>{emenda.municipio}/{emenda.estado}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(emenda.valor))}</TableCell>
                        <TableCell>{formatDate(emenda.data_disponibilizacao)}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/transparencia/${emenda.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <PaginationControls
                currentPage={1}
                totalPages={1}
                totalItems={Math.min(filteredEmendas.length, 10)}
                itemsPerPage={10}
                onPageChange={() => {}}
                onItemsPerPageChange={() => {}}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">Nenhuma emenda PIX encontrada</p>
              <p className="mt-1 text-sm text-muted-foreground">Selecione outro ano ou volte para a transparência geral.</p>
            </div>
          )}
        </div>

        <DynamicFooter />
      </main>
    </div>
  );
};

export default TransparenciaPix;
