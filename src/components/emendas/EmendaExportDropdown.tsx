import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileJson, FileSpreadsheet, Table } from 'lucide-react';
import { toast } from 'sonner';

interface EmendaData {
  numero: string;
  objeto: string;
  tipo_concedente: string;
  nome_concedente: string | null;
  nome_parlamentar?: string | null;
  tipo_recebedor: string;
  nome_recebedor: string;
  cnpj_recebedor: string;
  municipio: string;
  estado: string;
  data_disponibilizacao: string;
  gestor_responsavel: string;
  grupo_natureza_despesa: string;
  valor: number;
  valor_executado: number;
  valor_repassado?: number;
  contrapartida?: number | null;
  banco?: string | null;
  conta_corrente?: string | null;
  anuencia_previa_sus?: boolean | null;
  status: string;
  especial?: boolean;
  numero_proposta?: string | null;
  numero_convenio?: string | null;
  numero_plano_acao?: string | null;
  data_inicio_vigencia?: string | null;
  data_fim_vigencia?: string | null;
  esfera?: string;
}

interface EmendaExportDropdownProps {
  emenda: EmendaData;
  onExportPDF: () => void;
  size?: 'sm' | 'default';
}

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  em_execucao: 'Em Execução',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

const tipoConcedenteLabels: Record<string, string> = {
  parlamentar: 'Parlamentar',
  comissao: 'Comissão',
  bancada: 'Bancada',
  outro: 'Outro',
};

const tipoRecebedorLabels: Record<string, string> = {
  administracao_publica: 'Administração Pública',
  entidade_sem_fins_lucrativos: 'Entidade sem Fins Lucrativos',
  consorcio_publico: 'Consórcio Público',
  pessoa_juridica_privada: 'Pessoa Jurídica de Direito Privado',
  outro: 'Outro',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('pt-BR');

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildEmendaObject(emenda: EmendaData) {
  const valor = Number(emenda.valor);
  const contrapartida = Number(emenda.contrapartida || 0);
  const formaRepasse = emenda.especial ? 'Transferência Especial' : emenda.numero_convenio ? 'Convênio' : 'Fundo a Fundo';
  return {
    numero: emenda.numero,
    esfera: (emenda as any).esfera === 'estadual' ? 'Estadual' : 'Federal',
    tipo: tipoConcedenteLabels[emenda.tipo_concedente] || emenda.tipo_concedente,
    autoria: emenda.nome_parlamentar || emenda.nome_concedente || '',
    objeto: emenda.objeto,
    forma_repasse: formaRepasse,
    numero_convenio: emenda.numero_convenio || '',
    funcao_governo: (emenda as any).funcao_governo || emenda.grupo_natureza_despesa,
    grupo_natureza_despesa: emenda.grupo_natureza_despesa,
    status: statusLabels[emenda.status] || emenda.status,
    especial: emenda.especial || false,
    nome_concedente: emenda.nome_concedente || '',
    nome_parlamentar: emenda.nome_parlamentar || '',
    tipo_recebedor: tipoRecebedorLabels[emenda.tipo_recebedor] || emenda.tipo_recebedor,
    nome_recebedor: emenda.nome_recebedor,
    cnpj_recebedor: emenda.cnpj_recebedor,
    municipio: emenda.municipio,
    estado: emenda.estado,
    data_disponibilizacao: emenda.data_disponibilizacao,
    gestor_responsavel: emenda.gestor_responsavel,
    valor_previsto: valor,
    valor_repassado: Number(emenda.valor_repassado || 0),
    contrapartida: contrapartida,
    valor_total: valor + contrapartida,
    valor_executado: Number(emenda.valor_executado),
    banco: emenda.banco || '',
    conta_corrente: emenda.conta_corrente || '',
    anuencia_previa_sus: emenda.anuencia_previa_sus,
    numero_proposta: emenda.numero_proposta || '',
    numero_plano_acao: emenda.numero_plano_acao || '',
    data_inicio_vigencia: emenda.data_inicio_vigencia || '',
    data_fim_vigencia: emenda.data_fim_vigencia || '',
  };
}

function escapeCSV(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const EmendaExportDropdown = ({ emenda, onExportPDF, size = 'default' }: EmendaExportDropdownProps) => {
  const handleExportJSON = () => {
    const data = buildEmendaObject(emenda);
    downloadFile(
      JSON.stringify(data, null, 2),
      `emenda-${emenda.numero || 'programa'}-${new Date().toISOString().split('T')[0]}.json`,
      'application/json;charset=utf-8;'
    );
    toast.success('JSON exportado com sucesso!');
  };

  const handleExportCSV = () => {
    const data = buildEmendaObject(emenda);
    const headers = Object.keys(data);
    const values = Object.values(data).map(v => escapeCSV(v as string | number | boolean | null));
    const csvContent = '\ufeff' + headers.join(';') + '\n' + values.join(';');
    downloadFile(
      csvContent,
      `emenda-${emenda.numero || 'programa'}-${new Date().toISOString().split('T')[0]}.csv`,
      'text/csv;charset=utf-8;'
    );
    toast.success('CSV exportado com sucesso!');
  };

  const handleExportExcel = () => {
    // Generate a simple HTML table that Excel can open
    const data = buildEmendaObject(emenda);
    const valor = Number(emenda.valor);
    const contrapartida = Number(emenda.contrapartida || 0);
    const valorTotal = valor + contrapartida;
    const valorExecutado = Number(emenda.valor_executado);

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><style>td{mso-number-format:"\\@";}</style></head>
      <body>
        <table border="1">
          <tr><th colspan="2" style="background:#1e40af;color:white;font-size:14pt;">Ficha da Emenda Nº ${data.numero}</th></tr>
           <tr><td><b>Objeto</b></td><td>${data.objeto}</td></tr>
          <tr><td><b>Esfera</b></td><td>${data.esfera}</td></tr>
          <tr><td><b>Status</b></td><td>${data.status}${data.especial ? ' ⭐ Especial' : ''}</td></tr>
          <tr><td><b>Forma de Repasse</b></td><td>${data.forma_repasse}</td></tr>
          <tr><td colspan="2" style="background:#e5e7eb;"><b>Concedente</b></td></tr>
          <tr><td><b>Tipo</b></td><td>${data.tipo}</td></tr>
          <tr><td><b>Autoria</b></td><td>${data.autoria}</td></tr>
          <tr><td><b>Órgão Concedente</b></td><td>${data.nome_concedente}</td></tr>
          <tr><td colspan="2" style="background:#e5e7eb;"><b>Recebedor</b></td></tr>
          <tr><td><b>Tipo Recebedor</b></td><td>${data.tipo_recebedor}</td></tr>
          <tr><td><b>Nome Recebedor</b></td><td>${data.nome_recebedor}</td></tr>
          <tr><td><b>CNPJ</b></td><td>${data.cnpj_recebedor}</td></tr>
          <tr><td colspan="2" style="background:#e5e7eb;"><b>Localização</b></td></tr>
          <tr><td><b>Município/Estado</b></td><td>${data.municipio}/${data.estado}</td></tr>
          <tr><td><b>Gestor Responsável</b></td><td>${data.gestor_responsavel}</td></tr>
          <tr><td><b>Data Disponibilização</b></td><td>${formatDate(data.data_disponibilizacao)}</td></tr>
          <tr><td colspan="2" style="background:#e5e7eb;"><b>Valores</b></td></tr>
          <tr><td><b>Valor Previsto</b></td><td>${formatCurrency(valor)}</td></tr>
          <tr><td><b>Valor Repassado</b></td><td>${formatCurrency(data.valor_repassado)}</td></tr>
          <tr><td><b>Contrapartida</b></td><td>${formatCurrency(contrapartida)}</td></tr>
          <tr><td><b>Valor Total</b></td><td>${formatCurrency(valorTotal)}</td></tr>
          <tr><td><b>Valor Executado</b></td><td>${formatCurrency(valorExecutado)}</td></tr>
          <tr><td><b>% Execução</b></td><td>${valorTotal > 0 ? ((valorExecutado / valorTotal) * 100).toFixed(1) : 0}%</td></tr>
          <tr><td colspan="2" style="background:#e5e7eb;"><b>Dados Financeiros</b></td></tr>
          <tr><td><b>Função de Governo</b></td><td>${data.funcao_governo}</td></tr>
          <tr><td><b>Banco</b></td><td>${data.banco}</td></tr>
          <tr><td><b>Conta Corrente</b></td><td>${data.conta_corrente}</td></tr>
          <tr><td><b>Nº Proposta</b></td><td>${data.numero_proposta}</td></tr>
          <tr><td><b>Nº Convênio</b></td><td>${data.numero_convenio}</td></tr>
          <tr><td><b>Nº Plano de Ação</b></td><td>${data.numero_plano_acao}</td></tr>
          <tr><td><b>Anuência SUS</b></td><td>${data.anuencia_previa_sus === null ? 'N/A' : data.anuencia_previa_sus ? 'Sim' : 'Não'}</td></tr>
        </table>
      </body></html>
    `;
    downloadFile(
      html,
      `emenda-${emenda.numero || 'programa'}-${new Date().toISOString().split('T')[0]}.xls`,
      'application/vnd.ms-excel;charset=utf-8;'
    );
    toast.success('Excel exportado com sucesso!');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportPDF}>
          <FileText className="mr-2 h-4 w-4 text-red-600" />
          PDF / Impressão
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson className="mr-2 h-4 w-4 text-blue-600" />
          JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <Table className="mr-2 h-4 w-4 text-green-600" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
          Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmendaExportDropdown;
