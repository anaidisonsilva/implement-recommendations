import { useState, useMemo, useEffect } from 'react';
import { FileBarChart, Download, Loader2, Calendar, Filter, FileText } from 'lucide-react';
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
import YearFilter from '@/components/dashboard/YearFilter';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { toast } from 'sonner';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  em_execucao: 'Em Execução',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

const Relatorios = () => {
  const { data: emendas, isLoading: loadingEmendas } = useEmendas();
  const { data: prefeituras } = usePrefeituras();

  const [selectedYear, setSelectedYear] = useState<string>('');
  const [filters, setFilters] = useState({
    prefeitura: 'todas',
    status: 'todos',
    dataInicio: '',
    dataFim: '',
  });

  // Calculate available years
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

  // Filter by year first
  const yearFilteredEmendas = useMemo(() => {
    if (!emendas) return [];
    if (selectedYear === 'todos') return emendas;
    return emendas.filter((emenda) => {
      const year = new Date(emenda.data_disponibilizacao).getFullYear();
      return year === parseInt(selectedYear);
    });
  }, [emendas, selectedYear]);

  const filteredEmendas = yearFilteredEmendas?.filter((emenda) => {
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
      valorConcedente: acc.valorConcedente + Number(e.valor),
      executado: acc.executado + Number(e.valor_executado),
      contrapartida: acc.contrapartida + Number(e.contrapartida || 0),
      count: acc.count + 1,
    }),
    { valorConcedente: 0, executado: 0, contrapartida: 0, count: 0 }
  ) ?? { valorConcedente: 0, executado: 0, contrapartida: 0, count: 0 };

  const valorTotal = totals.valorConcedente + totals.contrapartida;

  const handleExportCSV = () => {
    if (!filteredEmendas?.length) return;

    const headers = ['Número', 'Objeto', 'Parlamentar', 'Concedente', 'Recebedor', 'Município', 'Valor Concedente', 'Contrapartida', 'Valor Total', 'Valor Executado', 'Status', 'Data'];
    const rows = filteredEmendas.map((e) => {
      const valorConc = Number(e.valor);
      const valorContra = Number(e.contrapartida || 0);
      return [
        e.numero,
        `"${e.objeto.replace(/"/g, '""')}"`,
        `"${(e.nome_parlamentar || '').replace(/"/g, '""')}"`,
        `"${(e.nome_concedente || '').replace(/"/g, '""')}"`,
        `"${e.nome_recebedor.replace(/"/g, '""')}"`,
        e.municipio,
        valorConc,
        valorContra,
        valorConc + valorContra,
        e.valor_executado,
        statusLabels[e.status] || e.status,
        formatDate(e.data_disponibilizacao),
      ];
    });

    const csvContent = [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-emendas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório CSV exportado com sucesso!');
  };

  const handleExportPDF = () => {
    if (!filteredEmendas?.length) return;

    const tableRows = filteredEmendas
      .map((e) => {
        const valorConc = Number(e.valor);
        const valorContra = Number(e.contrapartida || 0);
        const valorTotalEmenda = valorConc + valorContra;

        return `
          <tr>
            <td>${e.numero}</td>
            <td style="max-width: 120px; overflow: hidden; text-overflow: ellipsis;">${e.objeto}</td>
            <td>${e.nome_parlamentar || '-'}</td>
            <td>${e.nome_recebedor}</td>
            <td>${e.municipio}</td>
            <td class="text-right">${formatCurrency(valorConc)}</td>
            <td class="text-right">${formatCurrency(valorContra)}</td>
            <td class="text-right">${formatCurrency(valorTotalEmenda)}</td>
            <td class="text-right">${formatCurrency(Number(e.valor_executado))}</td>
            <td><span class="status status-${e.status}">${statusLabels[e.status] || e.status}</span></td>
          </tr>
        `;
      })
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Emendas Parlamentares</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      padding: 20px; 
      color: #1a1a1a;
      line-height: 1.5;
    }
    .header { 
      text-align: center; 
      margin-bottom: 30px; 
      padding-bottom: 20px;
      border-bottom: 2px solid #0066cc;
    }
    .header h1 { 
      color: #0066cc; 
      font-size: 24px; 
      margin-bottom: 8px;
    }
    .header p { 
      color: #666; 
      font-size: 14px; 
    }
    .summary {
      display: flex;
      justify-content: space-around;
      margin-bottom: 30px;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;
    }
    .summary-item {
      text-align: center;
    }
    .summary-item .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-item .value {
      font-size: 20px;
      font-weight: bold;
      color: #0066cc;
      margin-top: 4px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      font-size: 11px;
      margin-bottom: 20px;
    }
    th { 
      background: #0066cc; 
      color: white; 
      padding: 10px 6px; 
      text-align: left;
      font-weight: 600;
    }
    td { 
      padding: 8px 6px; 
      border-bottom: 1px solid #e5e5e5;
    }
    tr:nth-child(even) { background: #f9f9f9; }
    tr:hover { background: #f0f7ff; }
    .status {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 500;
    }
    .status-pendente { background: #fef3c7; color: #92400e; }
    .status-aprovado { background: #dbeafe; color: #1e40af; }
    .status-em_execucao { background: #e0e7ff; color: #3730a3; }
    .status-concluido { background: #d1fae5; color: #065f46; }
    .status-cancelado { background: #fee2e2; color: #991b1b; }
    .text-right { text-align: right; }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      font-size: 11px;
      color: #666;
    }
    .compliance {
      background: #e0f2fe;
      border: 1px solid #0284c7;
      border-radius: 6px;
      padding: 12px;
      margin-top: 20px;
      font-size: 11px;
      color: #0369a1;
    }
    @media print {
      body { padding: 10px; }
      .summary { break-inside: avoid; }
      tr { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Relatório de Emendas Parlamentares</h1>
    <p>Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>

  <div class="summary">
    <div class="summary-item">
      <div class="label">Total de Emendas</div>
      <div class="value">${totals.count}</div>
    </div>
    <div class="summary-item">
      <div class="label">Valor Total</div>
      <div class="value">${formatCurrency(valorTotal)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Concedente</div>
      <div class="value">${formatCurrency(totals.valorConcedente)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Contrapartida</div>
      <div class="value">${formatCurrency(totals.contrapartida)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Valor Executado</div>
      <div class="value">${formatCurrency(totals.executado)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Execução</div>
      <div class="value">${valorTotal > 0 ? ((totals.executado / valorTotal) * 100).toFixed(1) : 0}%</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Número</th>
        <th>Objeto</th>
        <th>Parlamentar</th>
        <th>Recebedor</th>
        <th>Município</th>
        <th class="text-right">Concedente</th>
        <th class="text-right">Contrapartida</th>
        <th class="text-right">Total</th>
        <th class="text-right">Executado</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div class="compliance">
    <strong>Conformidade Legal:</strong> Este relatório atende aos requisitos de transparência da 
    Recomendação MPC-MG nº 01/2025, ADPF 854/DF e Lei Complementar 210/2024.
  </div>

  <div class="footer">
    <p>Portal de Emendas Parlamentares - Sistema de Gestão e Transparência</p>
    <p>Em conformidade com a Recomendação MPC-MG nº 01/2025</p>
  </div>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        try {
          printWindow.print();
        } catch {
          // ignore
        }
      };
      toast.success('Relatório aberto para impressão/PDF');
    } else {
      // Fallback: download HTML (usuário pode abrir e imprimir em PDF)
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-emendas-${new Date().toISOString().split('T')[0]}.html`;
      link.click();
      URL.revokeObjectURL(url);
      toast.error('Popup bloqueado. Baixamos o HTML para imprimir em PDF.');
    }
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
        <div className="flex items-center gap-2">
          <YearFilter 
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            availableYears={availableYears}
          />
          <Button variant="outline" onClick={handleExportPDF} disabled={!filteredEmendas?.length}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button onClick={handleExportCSV} disabled={!filteredEmendas?.length}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
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
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total de Emendas</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{totals.count}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Valor Total</CardDescription>
            <CardTitle className="text-base sm:text-lg font-semibold truncate" title={formatCurrency(valorTotal)}>
              {formatCurrency(valorTotal)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Concedente</CardDescription>
            <CardTitle className="text-base sm:text-lg font-semibold truncate" title={formatCurrency(totals.valorConcedente)}>
              {formatCurrency(totals.valorConcedente)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Contrapartida</CardDescription>
            <CardTitle className="text-base sm:text-lg font-semibold truncate" title={formatCurrency(totals.contrapartida)}>
              {formatCurrency(totals.contrapartida)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Valor Executado</CardDescription>
            <CardTitle className="text-base sm:text-lg font-semibold truncate" title={formatCurrency(totals.executado)}>
              {formatCurrency(totals.executado)}
            </CardTitle>
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
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead className="min-w-[150px]">Objeto</TableHead>
                  <TableHead>Parlamentar</TableHead>
                  <TableHead>Concedente</TableHead>
                  <TableHead>Município</TableHead>
                  <TableHead className="text-right">Valor Concedente</TableHead>
                  <TableHead className="text-right">Contrapartida</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Executado</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmendas.slice(0, 20).map((emenda) => {
                  const valorConc = Number(emenda.valor);
                  const valorContra = Number(emenda.contrapartida || 0);
                  const valorTotalEmenda = valorConc + valorContra;
                  return (
                    <TableRow key={emenda.id}>
                      <TableCell className="font-medium">{emenda.numero}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={emenda.objeto}>{emenda.objeto}</TableCell>
                      <TableCell>{emenda.nome_parlamentar || '-'}</TableCell>
                      <TableCell>{emenda.nome_concedente || '-'}</TableCell>
                      <TableCell>{emenda.municipio}</TableCell>
                      <TableCell className="text-right">{formatCurrency(valorConc)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(valorContra)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(valorTotalEmenda)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(emenda.valor_executado))}</TableCell>
                      <TableCell>
                        <StatusBadge status={emenda.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
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
