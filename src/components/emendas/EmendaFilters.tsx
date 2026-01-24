import { Search, Filter, X, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusEmenda, TipoConcedente } from '@/types/emenda';

interface EmendaFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusEmenda | 'todos';
  onStatusChange: (value: StatusEmenda | 'todos') => void;
  concedenteFilter: TipoConcedente | 'todos';
  onConcedenteChange: (value: TipoConcedente | 'todos') => void;
  especialFilter?: 'todos' | 'sim' | 'nao';
  onEspecialChange?: (value: 'todos' | 'sim' | 'nao') => void;
  onClearFilters: () => void;
}

const EmendaFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  concedenteFilter,
  onConcedenteChange,
  especialFilter = 'todos',
  onEspecialChange,
  onClearFilters,
}: EmendaFiltersProps) => {
  const hasActiveFilters =
    searchTerm || statusFilter !== 'todos' || concedenteFilter !== 'todos' || especialFilter !== 'todos';

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por número, objeto, município..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full lg:w-44">
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

        {/* Concedente filter */}
        <Select value={concedenteFilter} onValueChange={onConcedenteChange}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Concedente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Tipos</SelectItem>
            <SelectItem value="parlamentar">Parlamentar</SelectItem>
            <SelectItem value="comissao">Comissão</SelectItem>
            <SelectItem value="bancada">Bancada</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>

        {/* Especial filter */}
        {onEspecialChange && (
          <Select value={especialFilter} onValueChange={onEspecialChange}>
            <SelectTrigger className="w-full lg:w-36">
              <Star className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Especial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="sim">⭐ Especiais</SelectItem>
              <SelectItem value="nao">Normais</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmendaFilters;
