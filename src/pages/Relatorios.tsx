import { useState } from 'react';
import { FileBarChart, Download, Loader2, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEmendas } from '@/hooks/useEmendas';
import { usePrefeituras } from '@/hooks/usePrefeituras';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StatusBadge from '@/components/dashboard/StatusBadge';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const Relatorios = () => {
  const { data: emendas, isLoading: loadingEmendas } = useEmendas();
  const { data: prefeituras } = usePrefeituras();

  const [filters, setFilters] = useState({
    prefeitura: 'todas',
    status: 'todos',
    dataInicio: '',
    dataFim: '',
  });

  const filteredEmendas = emendas?.filter((emenda) => {
    const matchesPrefeitura =
      filters.prefeitura === 'todas' || emenda.prefeitura_id === filters.prefeitura;
    const matchesStatus = filters.status === 'todos' || emenda.status === filters.status;
    
    let matchesData = true;
    if (filters.dataInicio) {
      matchesData = matchesData && emenda.data_disponibilizacao >= filters.dataInicio;
    }
    if (filters.dataFim) {
      matchesData = matchesData && emenda.data_disponibilizacao <= filters.dataFim;
    }

    return matchesPrefeitura && matchesStatus && matchesData;
  });

  const totals = filteredEmendas?.reduce(
    (acc, e) => ({
      valor: acc.valor + Number(e.valor),
      executado: acc.executado + Number(e.valor_executado),
      count: acc.count + 1,
    }),
    { valor: 0, executado: 0, count: 0 }
  ) ?? { valor: 0, executado: 0, count: 0 };

  const handleExportCSV = () => {
    if (!filteredEmendas?.length) return;

    const headers = ['Número', 'Objeto', 'Concedente', 'Recebedor', 'Município', 'Valor', 'Valor Executado', 'Status', 'Data'];
    const rows = filteredEmendas.map((e) => [
      e.numero,
      e.objeto,
      e.nome_concedente,
      e.nome_recebedor,
      e.municipio,
      e.valor,
      e.valor_executado,
      e.status,
      e.data_disponibilizacao,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-emendas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loadingEmendas) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="mt-1 text-muted-foreground">
            Gere relatórios e exporte dados das emendas
          </p>
        </div>
        <Button onClick={handleExportCSV} disabled={!filteredEmendas?.length}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>Filtre os dados para gerar o relatório</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Prefeitura</Label>
              <Select
                value={filters.prefeitura}
                onValueChange={(value) => setFilters({ ...filters, prefeitura: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prefeituras" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as prefeituras</SelectItem>
                  {prefeituras?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="em_execucao">Em Execução</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filters.dataFim}
                onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Emendas</CardDescription>
            <CardTitle className="text-3xl">{totals.count}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Valor Total</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(totals.valor)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Valor Executado</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(totals.executado)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Results Table */}
      {filteredEmendas && filteredEmendas.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileBarChart className="h-5 w-5" />
              Resultado ({filteredEmendas.length} emendas)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Objeto</TableHead>
                  <TableHead>Município</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Executado</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmendas.slice(0, 20).map((emenda) => (
                  <TableRow key={emenda.id}>
                    <TableCell className="font-medium">{emenda.numero}</TableCell>
                    <TableCell className="max-w-xs truncate">{emenda.objeto}</TableCell>
                    <TableCell>{emenda.municipio}</TableCell>
                    <TableCell>{formatCurrency(Number(emenda.valor))}</TableCell>
                    <TableCell>{formatCurrency(Number(emenda.valor_executado))}</TableCell>
                    <TableCell>
                      <StatusBadge status={emenda.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredEmendas.length > 20 && (
              <p className="border-t border-border p-4 text-center text-sm text-muted-foreground">
                Exibindo 20 de {filteredEmendas.length} emendas. Exporte o CSV para ver todos.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileBarChart className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              Nenhuma emenda encontrada
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajuste os filtros para ver os resultados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Relatorios;
