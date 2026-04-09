import { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdvancedSearch, { defaultFilters, applyAdvancedFilters, hasActiveAdvancedFilters, type AdvancedSearchFilters } from '@/components/emendas/AdvancedSearch';
import LastUpdatedBanner from '@/components/prefeitura/LastUpdatedBanner';
import YearFilter from '@/components/dashboard/YearFilter';
import PaginationControls from '@/components/ui/pagination-controls';
import {
  Building2,
  Loader2,
  Eye,
  FileText,
  Handshake,
  ArrowLeft,
  Zap,
  TrendingUp,
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
import StatusBadge from '@/components/dashboard/StatusBadge';
import { usePrefeituraBySlug } from '@/hooks/usePrefeituras';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const PrefeituraConvenios = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: prefeitura, isLoading: loadingPrefeitura, error } = usePrefeituraBySlug(slug ?? '');

  const { data: emendas, isLoading: loadingEmendas } = useQuery({
    queryKey: ['emendas', 'prefeitura', prefeitura?.id, 'convenios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emendas')
        .select('*')
        .eq('prefeitura_id', prefeitura!.id)
        .not('numero_convenio', 'is', null)
        .neq('numero_convenio', '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!prefeitura?.id,
  });

  const [filters, setFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  const totalPages = Math.ceil(filteredEmendas.length / itemsPerPage);
  const paginatedEmendas = filteredEmendas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = useMemo(() => {
    if (!yearFilteredEmendas || yearFilteredEmendas.length === 0) return { total: 0, valorTotal: 0, executado: 0, valorConcedente: 0, valorContrapartida: 0 };
    const emendasComValor = yearFilteredEmendas.filter(e => e.status !== 'pendente' && e.status !== 'cancelado');
    return {
      total: yearFilteredEmendas.length,
      valorConcedente: emendasComValor.reduce((acc, e) => acc + Number(e.valor), 0),
      valorContrapartida: emendasComValor.reduce((acc, e) => acc + Number(e.contrapartida || 0), 0),
      valorTotal: emendasComValor.reduce((acc, e) => acc + Number(e.valor) + Number(e.contrapartida || 0), 0),
      executado: emendasComValor.reduce((acc, e) => acc + Number(e.valor_executado), 0),
    };
  }, [yearFilteredEmendas]);

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
        <Button asChild className="mt-6">
          <Link to="/">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
                  Portal de Transparência • Convênios
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
                <Link to={`/p/${slug}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Portal
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <LastUpdatedBanner emendas={emendas} />

        {/* Stats */}
        <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Total de Convênios</p>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-lg font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Valor Total</p>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Concedente + Contrapartida</p>
            <p className="mt-1 text-lg font-bold text-foreground truncate" title={formatCurrency(stats.valorTotal)}>{formatCurrency(stats.valorTotal)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Concedente</p>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-lg font-bold text-foreground truncate" title={formatCurrency(stats.valorConcedente)}>{formatCurrency(stats.valorConcedente)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Contrapartida</p>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-lg font-bold text-foreground truncate" title={formatCurrency(stats.valorContrapartida)}>{formatCurrency(stats.valorContrapartida)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Valor Executado</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-lg font-bold text-foreground truncate" title={formatCurrency(stats.executado)}>{formatCurrency(stats.executado)}</p>
          </div>
        </div>

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
          {filteredEmendas.length} convênio(s) encontrado(s)
          {selectedYear !== 'todos' && ` em ${selectedYear}`}
        </p>

        {/* Table */}
        {loadingEmendas ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : paginatedEmendas.length > 0 ? (
          <>
            <div className="rounded-xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Convênio</TableHead>
                    <TableHead>Nº Emenda</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>Concedente</TableHead>
                    <TableHead>Parlamentar</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmendas.map((emenda) => (
                    <TableRow key={emenda.id}>
                      <TableCell className="font-medium">{emenda.numero_convenio}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-foreground border border-border">
                            {emenda.programa ? '📋 Programa' : '📄 Emenda'} Nº {emenda.numero || '-'}
                          </span>
                          {emenda.especial && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
                              <Zap className="h-3 w-3" /> PIX
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{emenda.objeto}</TableCell>
                      <TableCell>{emenda.nome_concedente}</TableCell>
                      <TableCell>{emenda.nome_parlamentar || '-'}</TableCell>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(val) => {
                    setItemsPerPage(val);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <Handshake className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              Nenhum convênio encontrado
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasActiveAdvancedFilters(filters)
                ? 'Tente alterar os filtros de busca'
                : 'Emendas com número de convênio aparecerão aqui'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PrefeituraConvenios;
