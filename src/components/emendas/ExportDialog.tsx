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
import { supabase } from '@/integrations/supabase/client';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportDialogProps {
  statusFilter: string;
  concedenteFilter: string;
}

const ExportDialog = ({ statusFilter, concedenteFilter }: ExportDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null);

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(format);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Você precisa estar logado para exportar');
        return;
      }

      const response = await supabase.functions.invoke('export-relatorio', {
        body: {
          format,
          filters: {
            status: statusFilter,
            tipoConcedente: concedenteFilter,
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao exportar');
      }

      const data = response.data;

      if (format === 'csv') {
        // Download CSV file
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-emendas-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Relatório CSV exportado com sucesso!');
      } else {
        // Open PDF (HTML) in new window for printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(data);
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
          const blob = new Blob([data], { type: 'text/html;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `relatorio-emendas-${new Date().toISOString().split('T')[0]}.html`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.error('Popup bloqueado. Baixamos o HTML para imprimir em PDF.');
        }
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao exportar relatório');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Relatório</DialogTitle>
          <DialogDescription>
            Gere um relatório das emendas parlamentares para prestação de contas ao TCE-MG.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="h-20 justify-start gap-4"
            onClick={() => handleExport('csv')}
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
            onClick={() => handleExport('pdf')}
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
            Recomendação MPC-MG nº 01/2025 para prestação de contas ao TCE-MG.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
