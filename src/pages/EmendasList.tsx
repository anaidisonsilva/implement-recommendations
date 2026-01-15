import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, LayoutGrid, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmendaCard from '@/components/emendas/EmendaCard';
import EmendaFilters from '@/components/emendas/EmendaFilters';
import ExportDialog from '@/components/emendas/ExportDialog';
import PaginationControls from '@/components/ui/pagination-controls';
import { useEmendas } from '@/hooks/useEmendas';

type StatusEmenda = 'pendente' | 'aprovado' | 'em_execucao' | 'concluido' | 'cancelado';
type TipoConcedente = 'parlamentar' | 'comissao' | 'bancada' | 'outro';

const EmendasList = () => {
  const { data: emendas, isLoading } = useEmendas();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusEmenda | 'todos'>('todos');
  const [concedenteFilter, setConcedenteFilter] = useState<TipoConcedente | 'todos'>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      const matchesConcedente =
        concedenteFilter === 'todos' || emenda.tipo_concedente === concedenteFilter;

      return matchesSearch && matchesStatus && matchesConcedente;
    });
  }, [emendas, searchTerm, statusFilter, concedenteFilter]);

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

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setConcedenteFilter('todos');
    setCurrentPage(1);
  };

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
          <h1 className="text-2xl font-bold text-foreground">Emendas Parlamentares</h1>
          <p className="mt-1 text-muted-foreground">
            {filteredEmendas.length} emenda(s) encontrada(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportDialog 
            statusFilter={statusFilter} 
            concedenteFilter={concedenteFilter} 
          />
          <Button asChild>
            <Link to="/emendas/nova">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Emenda
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <EmendaFilters
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}
        concedenteFilter={concedenteFilter}
        onConcedenteChange={(value) => {
          setConcedenteFilter(value);
          setCurrentPage(1);
        }}
        onClearFilters={clearFilters}
      />

      {/* View mode toggle */}
      <div className="flex items-center justify-end gap-1">
        <Button
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setViewMode('grid')}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setViewMode('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Emendas grid/list */}
      {paginatedEmendas.length > 0 ? (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
                : 'space-y-4'
            }
          >
            {paginatedEmendas.map((emenda) => (
              <EmendaCard key={emenda.id} emenda={emenda} />
            ))}
          </div>

          {/* Pagination */}
          <div className="rounded-xl border border-border bg-card">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredEmendas.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <p className="text-lg font-medium text-muted-foreground">
            Nenhuma emenda encontrada
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tente ajustar os filtros ou cadastre uma nova emenda
          </p>
          <Button asChild className="mt-4">
            <Link to="/emendas/nova">
              <PlusCircle className="mr-2 h-4 w-4" />
              Cadastrar Emenda
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmendasList;
