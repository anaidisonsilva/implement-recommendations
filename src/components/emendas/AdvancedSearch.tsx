import { useState, useMemo, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, Filter, X, Star, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmendaBasic {
  id?: string;
  numero: string;
  objeto: string;
  nome_concedente: string | null;
  nome_parlamentar?: string | null;
  nome_recebedor: string;
  municipio: string;
  estado: string;
  valor: number;
  valor_executado?: number;
  valor_repassado?: number;
  contrapartida?: number | null;
  status: string;
  tipo_concedente: string;
  especial?: boolean;
  programa?: boolean;
  data_disponibilizacao: string;
  data_inicio_vigencia?: string | null;
  data_fim_vigencia?: string | null;
  cnpj_recebedor?: string;
  numero_convenio?: string | null;
  grupo_natureza_despesa?: string;
}

export interface AdvancedSearchFilters {
  searchTerm: string;
  statusFilter: string;
  concedenteFilter: string;
  especialFilter: 'todos' | 'sim' | 'nao';
  formaRepasseFilter: 'todos' | 'transferencia_especial' | 'convenio' | 'fundo_a_fundo';
  valorMin: string;
  valorMax: string;
  parlamentar: string;
  vigenciaInicio: string;
  vigenciaFim: string;
}

interface AdvancedSearchProps {
  emendas: EmendaBasic[];
  onFiltersChange: (filters: AdvancedSearchFilters) => void;
  filters: AdvancedSearchFilters;
  onResetPage: () => void;
}

export const defaultFilters: AdvancedSearchFilters = {
  searchTerm: '',
  statusFilter: 'todos',
  concedenteFilter: 'todos',
  especialFilter: 'todos',
  formaRepasseFilter: 'todos',
  valorMin: '',
  valorMax: '',
  parlamentar: '',
  vigenciaInicio: '',
  vigenciaFim: '',
};

export function applyAdvancedFilters(emendas: EmendaBasic[], filters: AdvancedSearchFilters): EmendaBasic[] {
  return emendas.filter((emenda) => {
    const searchLower = filters.searchTerm.toLowerCase();
    const matchesSearch =
      !filters.searchTerm ||
      (emenda.numero || '').toLowerCase().includes(searchLower) ||
      emenda.objeto.toLowerCase().includes(searchLower) ||
      emenda.municipio.toLowerCase().includes(searchLower) ||
      (emenda.nome_concedente || '').toLowerCase().includes(searchLower) ||
      (emenda.nome_parlamentar || '').toLowerCase().includes(searchLower) ||
      emenda.nome_recebedor.toLowerCase().includes(searchLower) ||
      (emenda.cnpj_recebedor || '').includes(searchLower);

    const matchesStatus = filters.statusFilter === 'todos' || emenda.status === filters.statusFilter;
    const matchesConcedente = filters.concedenteFilter === 'todos' || emenda.tipo_concedente === filters.concedenteFilter;
    const matchesEspecial =
      filters.especialFilter === 'todos' ||
      (filters.especialFilter === 'sim' && emenda.especial) ||
      (filters.especialFilter === 'nao' && !emenda.especial);

    // Forma de repasse filter
    let matchesFormaRepasse = true;
    if (filters.formaRepasseFilter !== 'todos') {
      const formaRepasse = emenda.especial
        ? 'transferencia_especial'
        : emenda.numero_convenio
          ? 'convenio'
          : 'fundo_a_fundo';
      matchesFormaRepasse = formaRepasse === filters.formaRepasseFilter;
    }

    const valorTotal = Number(emenda.valor) + Number(emenda.contrapartida || 0);
    const matchesValorMin = !filters.valorMin || valorTotal >= Number(filters.valorMin);
    const matchesValorMax = !filters.valorMax || valorTotal <= Number(filters.valorMax);

    const matchesParlamentar =
      !filters.parlamentar ||
      (emenda.nome_parlamentar || '').toLowerCase().includes(filters.parlamentar.toLowerCase());

    let matchesVigencia = true;
    if (filters.vigenciaInicio && emenda.data_inicio_vigencia) {
      matchesVigencia = matchesVigencia && emenda.data_inicio_vigencia >= filters.vigenciaInicio;
    }
    if (filters.vigenciaFim && emenda.data_fim_vigencia) {
      matchesVigencia = matchesVigencia && emenda.data_fim_vigencia <= filters.vigenciaFim;
    }

    return matchesSearch && matchesStatus && matchesConcedente && matchesEspecial &&
      matchesFormaRepasse && matchesValorMin && matchesValorMax && matchesParlamentar && matchesVigencia;
  });
}

export function hasActiveAdvancedFilters(filters: AdvancedSearchFilters): boolean {
  return (
    filters.searchTerm !== '' ||
    filters.statusFilter !== 'todos' ||
    filters.concedenteFilter !== 'todos' ||
    filters.especialFilter !== 'todos' ||
    filters.formaRepasseFilter !== 'todos' ||
    filters.valorMin !== '' ||
    filters.valorMax !== '' ||
    filters.parlamentar !== '' ||
    filters.vigenciaInicio !== '' ||
    filters.vigenciaFim !== ''
  );
}

const AdvancedSearch = ({ emendas, onFiltersChange, filters, onResetPage }: AdvancedSearchProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!filters.searchTerm || filters.searchTerm.length < 2) return [];
    const term = filters.searchTerm.toLowerCase();
    const results: { type: string; value: string; label: string }[] = [];
    const seen = new Set<string>();

    for (const e of emendas) {
      if (results.length >= 8) break;

      if (e.numero && e.numero.toLowerCase().includes(term) && !seen.has(`n:${e.numero}`)) {
        seen.add(`n:${e.numero}`);
        results.push({ type: 'Nº', value: e.numero, label: e.numero });
      }
      if (e.nome_parlamentar && e.nome_parlamentar.toLowerCase().includes(term) && !seen.has(`p:${e.nome_parlamentar}`)) {
        seen.add(`p:${e.nome_parlamentar}`);
        results.push({ type: 'Parlamentar', value: e.nome_parlamentar, label: e.nome_parlamentar });
      }
      if (e.nome_recebedor.toLowerCase().includes(term) && !seen.has(`r:${e.nome_recebedor}`)) {
        seen.add(`r:${e.nome_recebedor}`);
        results.push({ type: 'Recebedor', value: e.nome_recebedor, label: e.nome_recebedor });
      }
      if (e.objeto.toLowerCase().includes(term) && !seen.has(`o:${e.objeto.slice(0, 50)}`)) {
        seen.add(`o:${e.objeto.slice(0, 50)}`);
        results.push({ type: 'Objeto', value: e.objeto, label: e.objeto.length > 60 ? e.objeto.slice(0, 60) + '...' : e.objeto });
      }
    }
    return results;
  }, [emendas, filters.searchTerm]);

  // Unique parlamentares for dropdown
  const parlamentares = useMemo(() => {
    const names = new Set<string>();
    emendas.forEach(e => {
      if (e.nome_parlamentar) names.add(e.nome_parlamentar);
    });
    return Array.from(names).sort();
  }, [emendas]);

  const update = (partial: Partial<AdvancedSearchFilters>) => {
    onFiltersChange({ ...filters, ...partial });
    onResetPage();
  };

  const clearAll = () => {
    onFiltersChange(defaultFilters);
    onResetPage();
  };

  const activeCount = [
    filters.valorMin,
    filters.valorMax,
    filters.parlamentar,
    filters.vigenciaInicio,
    filters.vigenciaFim,
  ].filter(Boolean).length;

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
      {/* Search row */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
          <Filter className="h-4 w-4" />
          Filtros
        </div>
        <div className="relative flex-1" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, objeto, parlamentar, CNPJ, recebedor..."
            className="pl-10"
            value={filters.searchTerm}
            onChange={(e) => {
              update({ searchTerm: e.target.value });
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover shadow-lg">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-left"
                  onClick={() => {
                    update({ searchTerm: s.value });
                    setShowSuggestions(false);
                  }}
                >
                  <span className="shrink-0 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {s.type}
                  </span>
                  <span className="truncate text-foreground">{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:flex-wrap">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filtros
        </div>

        {/* Search with autocomplete */}
        <div className="relative flex-1" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, objeto, parlamentar, CNPJ, recebedor..."
            className="pl-10"
            value={filters.searchTerm}
            onChange={(e) => {
              update({ searchTerm: e.target.value });
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover shadow-lg">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 text-left"
                  onClick={() => {
                    update({ searchTerm: s.value });
                    setShowSuggestions(false);
                  }}
                >
                  <span className="shrink-0 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {s.type}
                  </span>
                  <span className="truncate text-foreground">{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <Select value={filters.statusFilter} onValueChange={(v) => update({ statusFilter: v })}>
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

        {/* Tipo Concedente */}
        <Select value={filters.concedenteFilter} onValueChange={(v) => update({ concedenteFilter: v })}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Tipo Concedente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Tipos</SelectItem>
            <SelectItem value="parlamentar">Parlamentar</SelectItem>
            <SelectItem value="comissao">Comissão</SelectItem>
            <SelectItem value="bancada">Bancada</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>

        {/* Especial */}
        <Select value={filters.especialFilter} onValueChange={(v: 'todos' | 'sim' | 'nao') => update({ especialFilter: v })}>
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

        {/* Forma de Repasse */}
        <Select value={filters.formaRepasseFilter} onValueChange={(v: 'todos' | 'transferencia_especial' | 'convenio' | 'fundo_a_fundo') => update({ formaRepasseFilter: v })}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Forma de Repasse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as Formas</SelectItem>
            <SelectItem value="transferencia_especial">Transferência Especial</SelectItem>
            <SelectItem value="convenio">Convênio</SelectItem>
            <SelectItem value="fundo_a_fundo">Fundo a Fundo</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced filters toggle */}
        <Popover open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Avançado
              {activeCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Filtros Avançados</h4>

              {/* Parlamentar */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Parlamentar</label>
                <Select value={filters.parlamentar || '_todos'} onValueChange={(v) => update({ parlamentar: v === '_todos' ? '' : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_todos">Todos</SelectItem>
                    {parlamentares.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Valor range */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Faixa de Valor (R$)</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.valorMin}
                    onChange={(e) => update({ valorMin: e.target.value })}
                    className="text-sm"
                  />
                  <span className="text-muted-foreground">a</span>
                  <Input
                    type="number"
                    placeholder="Máximo"
                    value={filters.valorMax}
                    onChange={(e) => update({ valorMax: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Vigência */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Período de Vigência</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={filters.vigenciaInicio}
                    onChange={(e) => update({ vigenciaInicio: e.target.value })}
                    className="text-sm"
                  />
                  <span className="text-muted-foreground">a</span>
                  <Input
                    type="date"
                    value={filters.vigenciaFim}
                    onChange={(e) => update({ vigenciaFim: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full" onClick={() => {
                update({ valorMin: '', valorMax: '', parlamentar: '', vigenciaInicio: '', vigenciaFim: '' });
              }}>
                Limpar Avançados
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveAdvancedFilters(filters) && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X className="mr-1 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
