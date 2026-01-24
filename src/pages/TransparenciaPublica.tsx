import { useState, useMemo } from 'react';
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
  FileText,
  Banknote,
  TrendingUp,
  Clock,
  CheckCircle2,
  PlayCircle,
  Building2,
  Loader2,
  LogIn,
  Search,
  Filter,
  X,
  Eye,
  BarChart3,
  Star,
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

type StatusEmenda = 'pendente' | 'aprovado' | 'em_execucao' | 'concluido' | 'cancelado';
type TipoConcedente = 'parlamentar' | 'comissao' | 'bancada' | 'outro';

const statusOptions = [
  { value: 'todos', label: 'Todos os Status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'em_execucao', label: 'Em Execução' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
];

const concedenteOptions = [
  { value: 'todos', label: 'Todos os Tipos' },
  { value: 'parlamentar', label: 'Parlamentar' },
  { value: 'comissao', label: 'Comissão' },
  { value: 'bancada', label: 'Bancada' },
  { value: 'outro', label: 'Outro' },
];

const DynamicFooter = () => {
  const { footerText, footerCompliance } = useFooterSettings();
  return (
    <footer className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
      <p>{footerText}</p>
      <p className="mt-1">{footerCompliance}</p>
    </footer>
  );
};

const TransparenciaPublica = () => {
  const { data: emendas, isLoading } = useEmendas();
  const { selectedYear, setSelectedYear, availableYears, filteredEmendas: yearFilteredEmendas, stats } = useYearFilter(emendas);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusEmenda | 'todos'>('todos');
  const [concedenteFilter, setConcedenteFilter] = useState<TipoConcedente | 'todos'>('todos');
  const [especialFilter, setEspecialFilter] = useState<'todos' | 'sim' | 'nao'>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const dashboardStats = {
    totalEmendas: stats.totalEmendas,
    valorTotal: stats.valorTotal,
    valorExecutado: stats.valorExecutado,
    emendasPendentes: stats.emendasPendentes,
    emendasAprovadas: stats.emendasAprovadas,
    emendasEmExecucao: stats.emendasEmExecucao,
    emendasConcluidas: stats.emendasConcluidas,
  };

  // Filter emendas
  const filteredEmendas = useMemo(() => {
    return yearFilteredEmendas.filter((emenda) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        emenda.numero.toLowerCase().includes(searchLower) ||
        emenda.objeto.toLowerCase().includes(searchLower) ||
        emenda.municipio.toLowerCase().includes(searchLower) ||
        (emenda.nome_concedente || '').toLowerCase().includes(searchLower) ||
        (emenda.nome_parlamentar || '').toLowerCase().includes(searchLower) ||
        emenda.nome_recebedor.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === 'todos' || emenda.status === statusFilter;
      const matchesConcedente = concedenteFilter === 'todos' || emenda.tipo_concedente === concedenteFilter;
      const matchesEspecial = 
        especialFilter === 'todos' || 
        (especialFilter === 'sim' && emenda.especial) || 
        (especialFilter === 'nao' && !emenda.especial);

      return matchesSearch && matchesStatus && matchesConcedente && matchesEspecial;
    });
  }, [yearFilteredEmendas, searchTerm, statusFilter, concedenteFilter, especialFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEmendas.length / itemsPerPage);
  const paginatedEmendas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEmendas.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEmendas, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as StatusEmenda | 'todos');
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setConcedenteFilter('todos');
    setEspecialFilter('todos');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'todos' || concedenteFilter !== 'todos' || especialFilter !== 'todos';

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
            <div className="flex items-center gap-2">
              <YearFilter 
                selectedYear={selectedYear}
                onYearChange={(year) => {
                  setSelectedYear(year);
                  setCurrentPage(1);
                }}
                availableYears={availableYears}
              />
              <Button variant="outline" asChild>
                <Link to="/transparencia/relatorios">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Relatórios
                </Link>
              </Button>
              <Button asChild>
                <Link to="/auth">
                  <LogIn className="mr-2 h-4 w-4" />
                  Área Restrita
                </Link>
              </Button>
            </div>
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

        {/* Stats Cards - Same as Dashboard */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

        {/* Charts */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <ValueProgressChart stats={dashboardStats} />
          <ExecutionChart stats={dashboardStats} />
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filtros
            </div>
            
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, objeto, município, concedente..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={concedenteFilter} onValueChange={(value: TipoConcedente | 'todos') => {
                setConcedenteFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Tipo Concedente" />
                </SelectTrigger>
                <SelectContent>
                  {concedenteOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={especialFilter} onValueChange={(value: 'todos' | 'sim' | 'nao') => {
                setEspecialFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-full sm:w-36">
                  <Star className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Especial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="sim">⭐ Especiais</SelectItem>
                  <SelectItem value="nao">Normais</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table with results count */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-foreground">Emendas Cadastradas</h3>
                <span className="text-sm text-muted-foreground">
                  {filteredEmendas.length === yearFilteredEmendas.length 
                    ? `${yearFilteredEmendas.length} emendas`
                    : `${filteredEmendas.length} de ${yearFilteredEmendas.length} emendas`
                  }
                  {selectedYear !== 'todos' && ` em ${selectedYear}`}
                </span>
              </div>
              <PublicExportDialog 
                emendas={filteredEmendas.map(e => ({
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
                title="Exportar Emendas"
              />
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
                      <TableHead className="text-right">Concedente</TableHead>
                      <TableHead className="text-right">Contrapartida</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">% Exec.</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEmendas.map((emenda) => {
                      const valor = Number(emenda.valor);
                      const contrapartida = Number(emenda.contrapartida || 0);
                      const valorTotal = valor + contrapartida;
                      const valorExecutado = Number(emenda.valor_executado);
                      const percentExec = valorTotal > 0 
                        ? ((valorExecutado / valorTotal) * 100).toFixed(1)
                        : '0';
                      return (
                        <TableRow key={emenda.id}>
                          <TableCell className="font-medium">{emenda.numero}</TableCell>
                          <TableCell>
                            <StatusBadge status={emenda.status} />
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate" title={emenda.nome_concedente || ''}>
                            {emenda.nome_concedente}
                          </TableCell>
                          <TableCell>{emenda.municipio}/{emenda.estado}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(valor)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(contrapartida)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(valorTotal)}
                          </TableCell>
                          <TableCell className="text-right">{percentExec}%</TableCell>
                          <TableCell>{formatDate(emenda.data_disponibilizacao)}</TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/transparencia/${emenda.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredEmendas.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </>
          ) : (
            <div className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-3 text-lg font-medium text-muted-foreground">
                {hasActiveFilters 
                  ? 'Nenhuma emenda encontrada com os filtros aplicados'
                  : selectedYear !== 'todos'
                    ? `Nenhuma emenda encontrada para ${selectedYear}`
                    : 'Nenhuma emenda cadastrada ainda'
                }
              </p>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DynamicFooter />
      </main>
    </div>
  );
};

export default TransparenciaPublica;
