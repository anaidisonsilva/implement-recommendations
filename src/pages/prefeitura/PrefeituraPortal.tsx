import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FileText,
  TrendingUp,
  Banknote,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  LogIn,
  Loader2,
  X,
  BarChart3,
  Eye,
  CircleDollarSign,
  HandCoins,
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

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEmendas = useMemo(() => {
    if (!emendas) return [];

    return emendas.filter((emenda) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        emenda.numero.toLowerCase().includes(searchLower) ||
        emenda.objeto.toLowerCase().includes(searchLower) ||
        emenda.municipio.toLowerCase().includes(searchLower) ||
        emenda.nome_concedente.toLowerCase().includes(searchLower) ||
        emenda.nome_recebedor.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === 'todos' || emenda.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [emendas, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredEmendas.length / ITEMS_PER_PAGE);
  const paginatedEmendas = filteredEmendas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = useMemo(() => {
    if (!emendas) return { 
      total: 0, 
      valorConcedente: 0, 
      valorContrapartida: 0, 
      valorTotal: 0, 
      executado: 0,
      pendentes: 0,
      aprovadas: 0,
      emExecucao: 0,
      concluidas: 0,
    };
    return {
      total: emendas.length,
      valorConcedente: emendas.reduce((acc, e) => acc + Number(e.valor), 0),
      valorContrapartida: emendas.reduce((acc, e) => acc + Number(e.contrapartida || 0), 0),
      valorTotal: emendas.reduce((acc, e) => acc + Number(e.valor) + Number(e.contrapartida || 0), 0),
      executado: emendas.reduce((acc, e) => acc + Number(e.valor_executado), 0),
      pendentes: emendas.filter(e => e.status === 'pendente').length,
      aprovadas: emendas.filter(e => e.status === 'aprovado').length,
      emExecucao: emendas.filter(e => e.status === 'em_execucao').length,
      concluidas: emendas.filter(e => e.status === 'concluido').length,
    };
  }, [emendas]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setCurrentPage(1);
  };

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
            <Button variant="outline" asChild>
              <Link to={`/p/${slug}/relatorios`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Relatórios
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
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
        {emendas && emendas.length > 0 && (
          <div className="mb-8">
            <PublicVigenciaCards emendas={emendas} />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, objeto, município..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="em_execucao">Em Execução</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          {(searchTerm || statusFilter !== 'todos') && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>

        {/* Results count */}
        <p className="mb-4 text-sm text-muted-foreground">
          {filteredEmendas.length} emenda(s) encontrada(s)
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
                    <TableCell className="font-medium">{emenda.numero}</TableCell>
                    <TableCell className="max-w-xs truncate">{emenda.objeto}</TableCell>
                    <TableCell>{emenda.nome_concedente}</TableCell>
                    <TableCell>{formatCurrency(Number(emenda.valor))}</TableCell>
                    <TableCell>
                      <StatusBadge status={emenda.status} />
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
              Nenhuma emenda encontrada
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
