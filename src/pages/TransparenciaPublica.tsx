import { useState, useMemo } from 'react';
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
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
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

const statusOptions = [
  { value: 'todos', label: 'Todos os status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'em_execucao', label: 'Em Execução' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
];

const ITEMS_PER_PAGE = 10;

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

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusEmenda | 'todos'>('todos');
  const [currentPage, setCurrentPage] = useState(1);

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

  // Pagination
  const totalPages = Math.ceil(filteredEmendas.length / ITEMS_PER_PAGE);
  const paginatedEmendas = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmendas.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEmendas, currentPage]);

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
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'todos';

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
                <SelectTrigger className="w-full sm:w-48">
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
              <h3 className="font-semibold text-foreground">Emendas Cadastradas</h3>
              <span className="text-sm text-muted-foreground">
                {filteredEmendas.length === emendas?.length 
                  ? `${emendas?.length || 0} emendas`
                  : `${filteredEmendas.length} de ${emendas?.length || 0} emendas`
                }
              </span>
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
                      <TableHead>Recebedor</TableHead>
                      <TableHead>Município</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">% Exec.</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEmendas.map((emenda) => {
                      const percentExec = Number(emenda.valor) > 0 
                        ? ((Number(emenda.valor_executado) / Number(emenda.valor)) * 100).toFixed(1)
                        : '0';
                      return (
                        <TableRow key={emenda.id}>
                          <TableCell className="font-medium">{emenda.numero}</TableCell>
                          <TableCell>
                            <StatusBadge status={emenda.status} />
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate" title={emenda.nome_concedente}>
                            {emenda.nome_concedente}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate" title={emenda.nome_recebedor}>
                            {emenda.nome_recebedor}
                          </TableCell>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    {/* Page numbers */}
                    <div className="hidden items-center gap-1 sm:flex">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-9"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-3 text-lg font-medium text-muted-foreground">
                {hasActiveFilters 
                  ? 'Nenhuma emenda encontrada com os filtros aplicados'
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
