import { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useYearParam } from '@/hooks/useYearParam';
import PortalBreadcrumb from '@/components/prefeitura/PortalBreadcrumb';
import { usePrefeituraBySlug } from '@/hooks/usePrefeituras';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StatusBadge from '@/components/dashboard/StatusBadge';
import PublicExportDialog from '@/components/emendas/PublicExportDialog';
import PaginationControls from '@/components/ui/pagination-controls';
import LastUpdatedBanner from '@/components/prefeitura/LastUpdatedBanner';
import YearFilter from '@/components/dashboard/YearFilter';
import {
  ArrowLeft,
  Loader2,
  FileText,
  Banknote,
  TrendingUp,
  Search,
  Filter,
  X,
  Printer,
  Building2,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  }).format(value);
};

const formatCurrencyCompact = (value: number) => {
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

const PrefeituraRelatoriosPublicos = () => {
  const navigate = useNavigate();
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
  const [statusFilter, setStatusFilter] = useState<StatusEmenda | 'todos'>('todos');
  const [especialFilter, setEspecialFilter] = useState<'todos' | 'sim' | 'nao'>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const { selectedYear, setSelectedYear } = useYearParam();

  // Calculate available years
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    for (let y = 2020; y <= currentYear; y++) {
      years.add(y);
    }
    if (emendas && emendas.length > 0) {
      emendas.forEach((emenda) => {
        const year = new Date(emenda.data_disponibilizacao).getFullYear();
        years.add(year);
      });
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [emendas]);

  // Auto-select the latest year when available years are loaded
  useEffect(() => {
    if (availableYears.length > 0 && selectedYear === '') {
      setSelectedYear(availableYears[0].toString());
    }
  }, [availableYears, selectedYear]);

  // Filter by year first
  const yearFilteredEmendas = useMemo(() => {
    if (!emendas) return [];
    if (selectedYear === 'todos') return emendas;
    return emendas.filter((emenda) => {
      const year = new Date(emenda.data_disponibilizacao).getFullYear();
      return year === parseInt(selectedYear);
    });
  }, [emendas, selectedYear]);

  const filteredEmendas = useMemo(() => {
    return yearFilteredEmendas.filter((emenda) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (emenda.numero || '').toLowerCase().includes(searchLower) ||
        emenda.objeto.toLowerCase().includes(searchLower) ||
        emenda.municipio.toLowerCase().includes(searchLower) ||
        emenda.nome_concedente?.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === 'todos' || emenda.status === statusFilter;
      const matchesEspecial = 
        especialFilter === 'todos' || 
        (especialFilter === 'sim' && emenda.especial) ||
        (especialFilter === 'nao' && !emenda.especial);

      return matchesSearch && matchesStatus && matchesEspecial;
    });
  }, [yearFilteredEmendas, searchTerm, statusFilter, especialFilter]);

  // Calculate summary values
  const summaryStats = useMemo(() => {
    const valorConcedente = filteredEmendas.reduce((sum, e) => sum + Number(e.valor), 0);
    const contrapartida = filteredEmendas.reduce((sum, e) => sum + Number(e.contrapartida || 0), 0);
    const valorTotal = valorConcedente + contrapartida;
    const valorExecutado = filteredEmendas.reduce((sum, e) => sum + Number(e.valor_executado), 0);
    return { valorConcedente, contrapartida, valorTotal, valorExecutado };
  }, [filteredEmendas]);

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
    setEspecialFilter('todos');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'todos' || especialFilter !== 'todos';

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Emendas - ${prefeitura?.nome || ''}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 15px; color: #333; font-size: 10px; }
          .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #1a365d; padding-bottom: 10px; }
          .header h1 { color: #1a365d; font-size: 16px; margin-bottom: 3px; }
          .header p { color: #666; font-size: 9px; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; }
          .summary-card { background: #f8fafc; padding: 10px; border-radius: 6px; text-align: center; border: 1px solid #e2e8f0; }
          .summary-card .label { font-size: 8px; color: #666; text-transform: uppercase; }
          .summary-card .value { font-size: 12px; font-weight: bold; color: #1a365d; }
          table { width: 100%; border-collapse: collapse; font-size: 9px; }
          th, td { border: 1px solid #e2e8f0; padding: 5px; text-align: left; }
          th { background: #f1f5f9; font-weight: bold; color: #1a365d; }
          tr:nth-child(even) { background: #f8fafc; }
          .text-right { text-align: right; }
          .footer { margin-top: 15px; text-align: center; font-size: 8px; color: #666; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RELATÓRIO DE EMENDAS PARLAMENTARES</h1>
          <h2>${prefeitura?.nome || ''}</h2>
          <p>Portal de Transparência - Gerado em ${new Date().toLocaleString('pt-BR')}</p>
          <p>${filteredEmendas.length} emenda(s) ${selectedYear !== 'todos' ? `de ${selectedYear}` : ''} ${hasActiveFilters ? '(filtrado)' : ''}</p>
        </div>

        <div class="summary">
          <div class="summary-card">
            <div class="label">Valor Concedente</div>
            <div class="value">${formatCurrency(summaryStats.valorConcedente)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Contrapartida</div>
            <div class="value">${formatCurrency(summaryStats.contrapartida)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Valor Total</div>
            <div class="value">${formatCurrency(summaryStats.valorTotal)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Executado</div>
            <div class="value">${formatCurrency(summaryStats.valorExecutado)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Esfera</th>
              <th>Tipo</th>
              <th>Autoria</th>
              <th>Forma Repasse</th>
              <th>Nº Convênio</th>
              <th>Objeto</th>
              <th>Função Governo</th>
              <th class="text-right">Previsto</th>
              <th class="text-right">Repassado</th>
              <th class="text-right">Executado</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredEmendas.map(emenda => {
              const tipoLabels: Record<string, string> = { parlamentar: 'Individual', comissao: 'Comissão', bancada: 'Bancada', outro: 'Outro' };
              const formaRepasse = emenda.especial ? 'Transf. Especial' : emenda.numero_convenio ? 'Convênio' : 'Fundo a Fundo';
              return `
              <tr>
                <td>${emenda.numero || 'Programa'}</td>
                <td>${emenda.esfera === 'estadual' ? 'Estadual' : 'Federal'}</td>
                <td>${tipoLabels[emenda.tipo_concedente] || emenda.tipo_concedente}</td>
                <td>${emenda.nome_parlamentar || emenda.nome_concedente || '-'}</td>
                <td>${formaRepasse}</td>
                <td>${emenda.numero_convenio || '-'}</td>
                <td>${emenda.objeto.substring(0, 40)}${emenda.objeto.length > 40 ? '...' : ''}</td>
                <td>${emenda.grupo_natureza_despesa || '-'}</td>
                <td class="text-right">${formatCurrency(Number(emenda.valor))}</td>
                <td class="text-right">${formatCurrency(Number(emenda.valor_repassado || 0))}</td>
                <td class="text-right">${formatCurrency(Number(emenda.valor_executado))}</td>
                <td>${emenda.status.replace('_', ' ')}</td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Este relatório foi gerado automaticamente pelo Portal de Transparência de Emendas Parlamentares</p>
          <p>Em conformidade com a Recomendação MPC-MG nº 01/2025</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
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

  const isLoading = loadingEmendas;

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
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                {prefeitura.logo_url ? (
                  <img
                    src={prefeitura.logo_url}
                    alt={prefeitura.nome}
                    className="h-10 w-10 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                    Relatórios
                  </h1>
                  <p className="mt-1 text-muted-foreground">
                    {prefeitura.nome} - Emendas Parlamentares
                  </p>
                </div>
              </div>
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
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
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
                  valor_repassado: Number(e.valor_repassado || 0),
                  contrapartida: Number(e.contrapartida || 0),
                  status: e.status,
                  data_disponibilizacao: e.data_disponibilizacao,
                  esfera: e.esfera || 'federal',
                  tipo_concedente: e.tipo_concedente,
                  especial: e.especial,
                  numero_convenio: e.numero_convenio,
                  grupo_natureza_despesa: e.grupo_natureza_despesa,
                }))}
                title="Exportar Relatório"
                prefeitura={prefeitura ? { nome: prefeitura.nome, cnpj: prefeitura.cnpj, logo_url: prefeitura.logo_url, municipio: prefeitura.municipio, estado: prefeitura.estado } : null}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PortalBreadcrumb slug={slug!} items={[{ label: 'Relatórios' }]} />
        <LastUpdatedBanner emendas={emendas} />
        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emendas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredEmendas.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Concedente</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" title={formatCurrency(summaryStats.valorConcedente)}>
                {formatCurrencyCompact(summaryStats.valorConcedente)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" title={formatCurrency(summaryStats.valorTotal)}>
                {formatCurrencyCompact(summaryStats.valorTotal)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Executado</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" title={formatCurrency(summaryStats.valorExecutado)}>
                {formatCurrencyCompact(summaryStats.valorExecutado)}
              </div>
            </CardContent>
          </Card>
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
                  placeholder="Buscar por número, objeto..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9"
                />
              </div>
              
              <Select 
                value={statusFilter} 
                onValueChange={(value) => {
                  setStatusFilter(value as StatusEmenda | 'todos');
                  setCurrentPage(1);
                }}
              >
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

              <Select 
                value={especialFilter} 
                onValueChange={(value) => {
                  setEspecialFilter(value as 'todos' | 'sim' | 'nao');
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-40">
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

        {/* Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Esfera</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Autoria</TableHead>
                  <TableHead>Forma Repasse</TableHead>
                  <TableHead>Nº Convênio</TableHead>
                  <TableHead>Objeto</TableHead>
                  <TableHead>Função Governo</TableHead>
                  <TableHead className="text-right">Previsto</TableHead>
                  <TableHead className="text-right">Repassado</TableHead>
                  <TableHead className="text-right">Executado</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmendas.length > 0 ? (
                  paginatedEmendas.map((emenda) => {
                    const tipoLabels: Record<string, string> = { parlamentar: 'Individual', comissao: 'Comissão', bancada: 'Bancada', outro: 'Outro' };
                    const formaRepasse = emenda.especial ? 'Transf. Especial' : emenda.numero_convenio ? 'Convênio' : 'Fundo a Fundo';
                    return (
                      <TableRow key={emenda.id}>
                        <TableCell className="font-medium">{emenda.numero || 'Programa'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${emenda.esfera === 'estadual' ? 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300' : 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300'}`}>
                            {emenda.esfera === 'estadual' ? 'Estadual' : 'Federal'}
                          </span>
                        </TableCell>
                        <TableCell>{tipoLabels[emenda.tipo_concedente] || emenda.tipo_concedente}</TableCell>
                        <TableCell className="max-w-[120px] truncate">{emenda.nome_parlamentar || emenda.nome_concedente || '-'}</TableCell>
                        <TableCell>{formaRepasse}</TableCell>
                        <TableCell>{emenda.numero_convenio || '-'}</TableCell>
                        <TableCell className="max-w-[150px] truncate" title={emenda.objeto}>
                          {emenda.objeto}
                        </TableCell>
                        <TableCell className="max-w-[100px] truncate">{emenda.grupo_natureza_despesa || '-'}</TableCell>
                        <TableCell className="text-right">{formatCurrencyCompact(Number(emenda.valor))}</TableCell>
                        <TableCell className="text-right">{formatCurrencyCompact(Number(emenda.valor_repassado || 0))}</TableCell>
                        <TableCell className="text-right">{formatCurrencyCompact(Number(emenda.valor_executado))}</TableCell>
                        <TableCell>
                          <StatusBadge status={emenda.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="py-8 text-center text-muted-foreground">
                      Nenhuma emenda encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredEmendas.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default PrefeituraRelatoriosPublicos;
