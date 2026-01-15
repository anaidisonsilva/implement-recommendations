import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EmendaData {
  id: string;
  numero: string;
  objeto: string;
  nome_concedente: string;
  nome_recebedor: string;
  municipio: string;
  estado: string;
  valor: number;
  valor_executado: number;
  status: string;
  data_disponibilizacao: string;
}

interface PublicExportDialogProps {
  emendas: EmendaData[];
  title?: string;
}

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  em_execucao: 'Em Execução',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const PublicExportDialog = ({ emendas, title = 'Exportar Relatório' }: PublicExportDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null);

  const handleExportCSV = () => {
    setIsExporting('csv');

    try {
      const headers = ['Número', 'Objeto', 'Concedente', 'Recebedor', 'Município/UF', 'Valor', 'Valor Executado', 'Status', 'Data Disponibilização'];
      const rows = emendas.map((e) => [
        e.numero,
        `"${e.objeto.replace(/"/g, '""')}"`,
        `"${e.nome_concedente.replace(/"/g, '""')}"`,
        `"${e.nome_recebedor.replace(/"/g, '""')}"`,
        `${e.municipio}/${e.estado}`,
        e.valor,
        e.valor_executado,
        statusLabels[e.status] || e.status,
        formatDate(e.data_disponibilizacao),
      ]);

      const csvContent = [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-emendas-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Relatório CSV exportado com sucesso!');
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar relatório');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPDF = () => {
    setIsExporting('pdf');

    try {
      const totals = emendas.reduce(
        (acc, e) => ({
          valor: acc.valor + Number(e.valor),
          executado: acc.executado + Number(e.valor_executado),
        }),
        { valor: 0, executado: 0 }
      );

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
    <p>Portal de Transparência - Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>

  <div class="summary">
    <div class="summary-item">
      <div class="label">Total de Emendas</div>
      <div class="value">${emendas.length}</div>
    </div>
    <div class="summary-item">
      <div class="label">Valor Total</div>
      <div class="value">${formatCurrency(totals.valor)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Valor Executado</div>
      <div class="value">${formatCurrency(totals.executado)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Execução</div>
      <div class="value">${totals.valor > 0 ? ((totals.executado / totals.valor) * 100).toFixed(1) : 0}%</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Número</th>
        <th>Objeto</th>
        <th>Concedente</th>
        <th>Recebedor</th>
        <th>Município</th>
        <th class="text-right">Valor</th>
        <th class="text-right">Executado</th>
        <th>Status</th>
        <th>Data</th>
      </tr>
    </thead>
    <tbody>
      ${emendas.map((e) => `
        <tr>
          <td>${e.numero}</td>
          <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis;">${e.objeto}</td>
          <td>${e.nome_concedente}</td>
          <td>${e.nome_recebedor}</td>
          <td>${e.municipio}/${e.estado}</td>
          <td class="text-right">${formatCurrency(Number(e.valor))}</td>
          <td class="text-right">${formatCurrency(Number(e.valor_executado))}</td>
          <td><span class="status status-${e.status}">${statusLabels[e.status] || e.status}</span></td>
          <td>${formatDate(e.data_disponibilizacao)}</td>
        </tr>
      `).join('')}
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
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
        toast.success('Relatório aberto para impressão/PDF');
      } else {
        toast.error('Popup bloqueado. Permita popups para exportar PDF.');
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar relatório');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={emendas.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Exporte os dados das emendas parlamentares em diferentes formatos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="h-20 justify-start gap-4"
            onClick={handleExportCSV}
            disabled={isExporting !== null}
          >
            {isExporting === 'csv' ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
            )}
            <div className="text-left">
              <p className="font-semibold">Excel / CSV</p>
              <p className="text-sm text-muted-foreground">
                Planilha com todos os dados para análise
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-20 justify-start gap-4"
            onClick={handleExportPDF}
            disabled={isExporting !== null}
          >
            {isExporting === 'pdf' ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <FileText className="h-8 w-8 text-red-600" />
            )}
            <div className="text-left">
              <p className="font-semibold">PDF / Impressão</p>
              <p className="text-sm text-muted-foreground">
                Relatório formatado para impressão
              </p>
            </div>
          </Button>
        </div>

        <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          <p>
            <strong>Conformidade:</strong> Os relatórios gerados atendem aos requisitos da 
            Recomendação MPC-MG nº 01/2025 para prestação de contas.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PublicExportDialog;