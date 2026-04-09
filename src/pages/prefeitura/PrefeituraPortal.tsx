import { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdvancedSearch, { defaultFilters, applyAdvancedFilters, hasActiveAdvancedFilters, type AdvancedSearchFilters } from '@/components/emendas/AdvancedSearch';
import LastUpdatedBanner from '@/components/prefeitura/LastUpdatedBanner';
import {
  FileText,
  TrendingUp,
  Banknote,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  Loader2,
  X,
  BarChart3,
  Eye,
  CircleDollarSign,
  HandCoins,
  Star,
  Filter,
  Zap,
  Database,
  Clock,
  Handshake,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StatusBadge from '@/components/dashboard/StatusBadge';
import PublicDashboardCharts from '@/components/dashboard/PublicDashboardCharts';
import PublicVigenciaCards from '@/components/dashboard/PublicVigenciaCards';
import YearFilter from '@/components/dashboard/YearFilter';
import { usePrefeituraBySlug } from '@/hooks/usePrefeituras';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 10;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const PrefeituraPortal = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: prefeitura, isLoading: loadingPrefeitura, error } = usePrefeituraBySlug(slug ?? '');

  const { data: emendas, isLoading: loadingEmendas } = useQuery({
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

  const [filters, setFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Year filter
  const [selectedYear, setSelectedYear] = useState<string>('');

  const availableYears = useMemo(() => {
    if (!emendas || emendas.length === 0) return [];
    const years = new Set<number>();
    emendas.forEach((emenda) => {
      const year = new Date(emenda.data_disponibilizacao).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [emendas]);

  // Auto-select the latest year when available years are loaded
  useEffect(() => {
    if (availableYears.length > 0 && selectedYear === '') {
      setSelectedYear(availableYears[0].toString());
    }
  }, [availableYears, selectedYear]);

  const yearFilteredEmendas = useMemo(() => {
    if (!emendas) return [];
    if (selectedYear === 'todos') return emendas;
    return emendas.filter((emenda) => {
      const year = new Date(emenda.data_disponibilizacao).getFullYear();
      return year === parseInt(selectedYear);
    });
  }, [emendas, selectedYear]);

  const filteredEmendas = useMemo(() => {
    return applyAdvancedFilters(yearFilteredEmendas, filters);
  }, [yearFilteredEmendas, filters]);

  const totalPages = Math.ceil(filteredEmendas.length / ITEMS_PER_PAGE);
  const paginatedEmendas = filteredEmendas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = useMemo(() => {
    if (!yearFilteredEmendas || yearFilteredEmendas.length === 0) return { 
      total: 0, 
      valorConcedente: 0, 
      valorContrapartida: 0, 
      valorTotal: 0, 
      executado: 0,
      pendentes: 0,
      aprovadas: 0,
      emExecucao: 0,
      concluidas: 0,
      canceladas: 0,
    };
    // Excluir emendas pendentes e canceladas dos cálculos de valores
    const emendasComValor = yearFilteredEmendas.filter(e => e.status !== 'pendente' && e.status !== 'cancelado');
    return {
      total: yearFilteredEmendas.length,
      valorConcedente: emendasComValor.reduce((acc, e) => acc + Number(e.valor), 0),
      valorContrapartida: emendasComValor.reduce((acc, e) => acc + Number(e.contrapartida || 0), 0),
      valorTotal: emendasComValor.reduce((acc, e) => acc + Number(e.valor) + Number(e.contrapartida || 0), 0),
      executado: emendasComValor.reduce((acc, e) => acc + Number(e.valor_executado), 0),
      pendentes: yearFilteredEmendas.filter(e => e.status === 'pendente').length,
      aprovadas: yearFilteredEmendas.filter(e => e.status === 'aprovado').length,
      emExecucao: yearFilteredEmendas.filter(e => e.status === 'em_execucao').length,
      concluidas: yearFilteredEmendas.filter(e => e.status === 'concluido').length,
      canceladas: yearFilteredEmendas.filter(e => e.status === 'cancelado').length,
    };
  }, [yearFilteredEmendas]);

  const clearFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const hasActiveFilters = hasActiveAdvancedFilters(filters);

  if (loadingPrefeitura) {
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
        <p className="mt-2 text-muted-foreground">
          Verifique o endereço e tente novamente
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Voltar ao Portal Principal</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {prefeitura.logo_url ? (
                <img
                  src={prefeitura.logo_url}
                  alt={prefeitura.nome}
                  className="h-12 w-12 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-foreground">{prefeitura.nome}</h1>
                <p className="text-sm text-muted-foreground">
                  Portal de Transparência • Emendas Parlamentares
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <YearFilter 
                selectedYear={selectedYear}
                onYearChange={(year) => {
                  setSelectedYear(year);
                  setCurrentPage(1);
                }}
                availableYears={availableYears}
              />
              <Button variant="outline" asChild>
                <Link to={`/p/${slug}/pix`}>
                  <Zap className="mr-2 h-4 w-4" />
                  Dashboard PIX
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/p/${slug}/relatorios`}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Relatórios
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/p/${slug}/convenios`}>
                  <Handshake className="mr-2 h-4 w-4" />
                  Convênios
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/p/${slug}/dados-abertos`}>
                  <Database className="mr-2 h-4 w-4" />
                  Dados Abertos
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <LastUpdatedBanner emendas={emendas} />

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground truncate">Total de Emendas</p>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-lg font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground truncate">Valor Total</p>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Concedente + Contrapartida</p>
            <p className="mt-1 text-lg font-bold text-foreground truncate" title={formatCurrency(stats.valorTotal)}>{formatCurrency(stats.valorTotal)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground truncate">Concedente</p>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-lg font-bold text-foreground truncate" title={formatCurrency(stats.valorConcedente)}>{formatCurrency(stats.valorConcedente)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground truncate">Contrapartida</p>
              <HandCoins className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-lg font-bold text-foreground truncate" title={formatCurrency(stats.valorContrapartida)}>{formatCurrency(stats.valorContrapartida)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground truncate">Valor Executado</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-lg font-bold text-foreground truncate" title={formatCurrency(stats.executado)}>{formatCurrency(stats.executado)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground truncate">Pendentes</p>
              <div className="h-4 w-4 rounded-full bg-warning/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-warning" />
              </div>
            </div>
            <p className="mt-2 text-lg font-bold text-foreground">{stats.pendentes}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground truncate">Aprovadas</p>
              <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
            </div>
            <p className="mt-2 text-lg font-bold text-foreground">{stats.aprovadas}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground truncate">Em Execução</p>
              <div className="h-4 w-4 rounded-full bg-info/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-info" />
              </div>
            </div>
            <p className="mt-2 text-lg font-bold text-foreground">{stats.emExecucao}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground truncate">Concluídas</p>
              <div className="h-4 w-4 rounded-full bg-success/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-success" />
              </div>
            </div>
            <p className="mt-2 text-lg font-bold text-foreground">{stats.concluidas}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground truncate">Canceladas</p>
              <div className="h-4 w-4 rounded-full bg-destructive/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-destructive" />
              </div>
            </div>
            <p className="mt-2 text-lg font-bold text-foreground">{stats.canceladas}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="mb-8">
          <PublicDashboardCharts
            stats={{
              totalEmendas: stats.total,
              valorTotal: stats.valorTotal,
              valorConcedente: stats.valorConcedente,
              valorContrapartida: stats.valorContrapartida,
              valorExecutado: stats.executado,
              emendasPendentes: stats.pendentes,
              emendasAprovadas: stats.aprovadas,
              emendasEmExecucao: stats.emExecucao,
              emendasConcluidas: stats.concluidas,
            }}
          />
        </div>

        {/* Vigência Cards */}
        {yearFilteredEmendas && yearFilteredEmendas.length > 0 && (
          <div className="mb-8">
            <PublicVigenciaCards emendas={yearFilteredEmendas} />
          </div>
        )}

        {/* Advanced Search */}
        <div className="mb-6">
          <AdvancedSearch
            emendas={yearFilteredEmendas}
            filters={filters}
            onFiltersChange={setFilters}
            onResetPage={() => setCurrentPage(1)}
          />
        </div>

        {/* Results count */}
        <p className="mb-4 text-sm text-muted-foreground">
          {filteredEmendas.length} emenda(s) encontrada(s)
          {selectedYear !== 'todos' && ` em ${selectedYear}`}
        </p>

        {/* Table */}
        {loadingEmendas ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : paginatedEmendas.length > 0 ? (
          <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Objeto</TableHead>
                  <TableHead>Concedente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmendas.map((emenda) => (
                  <TableRow key={emenda.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2 flex-wrap animate-fade-in">
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-foreground border border-border hover-scale">
                          {emenda.programa ? '📋 Programa' : '📄 Emenda'} Nº {emenda.numero || '-'}
                        </span>
                        {emenda.especial && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning hover-scale animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                            <Zap className="h-3 w-3" /> PIX
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{emenda.objeto}</TableCell>
                    <TableCell>{emenda.nome_concedente}</TableCell>
                    <TableCell>{formatCurrency(Number(emenda.valor))}</TableCell>
                    <TableCell>
                      <StatusBadge status={emenda.status as any} />
                    </TableCell>
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
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              {selectedYear !== 'todos' 
                ? `Nenhuma emenda encontrada para ${selectedYear}`
                : 'Nenhuma emenda encontrada'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PrefeituraPortal;
