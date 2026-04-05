import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Database,
  Download,
  FileSpreadsheet,
  FileJson,
  FileCode,
  Loader2,
  Info,
  Calendar,
  BarChart3,
  Shield,
} from 'lucide-react';

interface EmendaData {
  id: string;
  numero: string | null;
  objeto: string;
  nome_concedente: string | null;
  nome_parlamentar?: string | null;
  nome_recebedor: string;
  cnpj_recebedor: string;
  municipio: string;
  estado: string;
  valor: number;
  valor_executado: number;
  contrapartida?: number | null;
  status: string;
  data_disponibilizacao: string;
  programa: boolean;
  especial: boolean;
  tipo_concedente: string;
  tipo_recebedor: string;
  grupo_natureza_despesa: string;
  data_inicio_vigencia?: string | null;
  data_fim_vigencia?: string | null;
}

interface DadosAbertosSectionProps {
  emendas: EmendaData[];
  prefeituraName?: string;
  lastUpdated?: string;
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
  pessoa_juridica_privada: 'Pessoa Jurídica Privada',
  outro: 'Outro',
};

const DadosAbertosSection = ({ emendas, prefeituraName, lastUpdated }: DadosAbertosSectionProps) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const buildRows = () =>
    emendas.map((e) => ({
      numero: e.numero || '',
      tipo: e.programa ? 'Programa' : 'Emenda',
      especial_pix: e.especial ? 'Sim' : 'Não',
      objeto: e.objeto,
      parlamentar: e.nome_parlamentar || '',
      tipo_concedente: tipoConcedenteLabels[e.tipo_concedente] || e.tipo_concedente,
      concedente: e.nome_concedente || '',
      recebedor: e.nome_recebedor,
      cnpj_recebedor: e.cnpj_recebedor,
      tipo_recebedor: tipoRecebedorLabels[e.tipo_recebedor] || e.tipo_recebedor,
      municipio: e.municipio,
      estado: e.estado,
      grupo_natureza_despesa: e.grupo_natureza_despesa,
      valor_concedente: Number(e.valor),
      contrapartida: Number(e.contrapartida || 0),
      valor_total: Number(e.valor) + Number(e.contrapartida || 0),
      valor_executado: Number(e.valor_executado),
      percentual_execucao:
        Number(e.valor) + Number(e.contrapartida || 0) > 0
          ? (
              (Number(e.valor_executado) / (Number(e.valor) + Number(e.contrapartida || 0))) *
              100
            ).toFixed(2)
          : '0.00',
      status: statusLabels[e.status] || e.status,
      data_disponibilizacao: e.data_disponibilizacao,
      data_inicio_vigencia: e.data_inicio_vigencia || '',
      data_fim_vigencia: e.data_fim_vigencia || '',
    }));

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    setIsExporting('csv');
    try {
      const rows = buildRows();
      const headers = Object.keys(rows[0] || {});
      const csvRows = rows.map((r) =>
        headers
          .map((h) => {
            const val = String((r as any)[h]);
            return val.includes(';') || val.includes('"') || val.includes('\n')
              ? `"${val.replace(/"/g, '""')}"`
              : val;
          })
          .join(';')
      );
      const csv = [headers.join(';'), ...csvRows].join('\n');
      downloadFile('\ufeff' + csv, `dados-abertos-emendas-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
      toast.success('CSV exportado com sucesso!');
    } catch {
      toast.error('Erro ao exportar CSV');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportJSON = () => {
    setIsExporting('json');
    try {
      const rows = buildRows();
      const output = {
        metadata: {
          fonte: prefeituraName || 'Portal de Transparência',
          descricao: 'Dados abertos de emendas parlamentares',
          data_geracao: new Date().toISOString(),
          total_registros: rows.length,
          licenca: 'Creative Commons Attribution 4.0 (CC BY 4.0)',
        },
        dados: rows,
      };
      downloadFile(JSON.stringify(output, null, 2), `dados-abertos-emendas-${new Date().toISOString().split('T')[0]}.json`, 'application/json;charset=utf-8;');
      toast.success('JSON exportado com sucesso!');
    } catch {
      toast.error('Erro ao exportar JSON');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportXML = () => {
    setIsExporting('xml');
    try {
      const rows = buildRows();
      const escapeXml = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<dados_abertos>\n';
      xml += '  <metadata>\n';
      xml += `    <fonte>${escapeXml(prefeituraName || 'Portal de Transparência')}</fonte>\n`;
      xml += `    <data_geracao>${new Date().toISOString()}</data_geracao>\n`;
      xml += `    <total_registros>${rows.length}</total_registros>\n`;
      xml += '    <licenca>Creative Commons Attribution 4.0 (CC BY 4.0)</licenca>\n';
      xml += '  </metadata>\n';
      xml += '  <emendas>\n';
      rows.forEach((r) => {
        xml += '    <emenda>\n';
        Object.entries(r).forEach(([k, v]) => {
          xml += `      <${k}>${escapeXml(String(v))}</${k}>\n`;
        });
        xml += '    </emenda>\n';
      });
      xml += '  </emendas>\n';
      xml += '</dados_abertos>';
      downloadFile(xml, `dados-abertos-emendas-${new Date().toISOString().split('T')[0]}.xml`, 'application/xml;charset=utf-8;');
      toast.success('XML exportado com sucesso!');
    } catch {
      toast.error('Erro ao exportar XML');
    } finally {
      setIsExporting(null);
    }
  };

  const datasets = [
    {
      title: 'Emendas Parlamentares',
      description: 'Dataset completo com todas as emendas, valores, status e informações de vigência.',
      records: emendas.length,
      formats: [
        { label: 'CSV', icon: FileSpreadsheet, color: 'text-green-600', handler: handleExportCSV, key: 'csv' },
        { label: 'JSON', icon: FileJson, color: 'text-blue-600', handler: handleExportJSON, key: 'json' },
        { label: 'XML', icon: FileCode, color: 'text-orange-600', handler: handleExportXML, key: 'xml' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Dados Abertos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Disponibilizamos os dados de emendas parlamentares em formatos abertos e legíveis por máquina,
              conforme a Lei de Acesso à Informação (Lei 12.527/2011) e a Política de Dados Abertos do Governo Federal.
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Licença Aberta</p>
            <p className="text-xs text-muted-foreground">
              CC BY 4.0 — Livre para uso, compartilhamento e adaptação com atribuição.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <Calendar className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Atualização</p>
            <p className="text-xs text-muted-foreground">
              Dados atualizados em tempo real conforme o cadastro no sistema.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Formatos</p>
            <p className="text-xs text-muted-foreground">
              CSV, JSON e XML — compatíveis com ferramentas de análise de dados.
            </p>
          </div>
        </div>
      </div>

      {/* Datasets */}
      {datasets.map((ds) => (
        <div key={ds.title} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{ds.title}</h3>
                <p className="text-sm text-muted-foreground">{ds.description}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {ds.records} registros
              </span>
            </div>
          </div>
          <div className="grid gap-3 p-6 sm:grid-cols-3">
            {ds.formats.map((fmt) => (
              <Button
                key={fmt.key}
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={fmt.handler}
                disabled={isExporting !== null || emendas.length === 0}
              >
                {isExporting === fmt.key ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <fmt.icon className={`h-8 w-8 ${fmt.color}`} />
                )}
                <div className="text-center">
                  <p className="font-semibold">{fmt.label}</p>
                  <p className="text-[10px] text-muted-foreground">Baixar {fmt.label}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      ))}

      {/* Schema / Data Dictionary */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-muted/30 px-6 py-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Info className="h-4 w-4" />
            Dicionário de Dados
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-2 text-left font-medium text-foreground">Campo</th>
                <th className="px-4 py-2 text-left font-medium text-foreground">Tipo</th>
                <th className="px-4 py-2 text-left font-medium text-foreground">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ['numero', 'Texto', 'Número identificador da emenda'],
                ['tipo', 'Texto', 'Emenda ou Programa'],
                ['especial_pix', 'Texto', 'Se é emenda especial PIX (Sim/Não)'],
                ['objeto', 'Texto', 'Descrição do objeto da emenda'],
                ['parlamentar', 'Texto', 'Nome do parlamentar autor'],
                ['tipo_concedente', 'Texto', 'Tipo do concedente (Parlamentar, Comissão, Bancada, Outro)'],
                ['concedente', 'Texto', 'Nome do órgão concedente'],
                ['recebedor', 'Texto', 'Nome do ente recebedor'],
                ['cnpj_recebedor', 'Texto', 'CNPJ do recebedor'],
                ['tipo_recebedor', 'Texto', 'Tipo do recebedor'],
                ['municipio', 'Texto', 'Município beneficiário'],
                ['estado', 'Texto', 'UF do município'],
                ['grupo_natureza_despesa', 'Texto', 'Grupo/natureza da despesa'],
                ['valor_concedente', 'Numérico', 'Valor repassado pelo concedente (R$)'],
                ['contrapartida', 'Numérico', 'Valor de contrapartida (R$)'],
                ['valor_total', 'Numérico', 'Valor total (concedente + contrapartida)'],
                ['valor_executado', 'Numérico', 'Valor efetivamente executado (R$)'],
                ['percentual_execucao', 'Numérico', 'Percentual de execução (%)'],
                ['status', 'Texto', 'Status atual (Pendente, Aprovado, Em Execução, Concluído, Cancelado)'],
                ['data_disponibilizacao', 'Data', 'Data de disponibilização do recurso'],
                ['data_inicio_vigencia', 'Data', 'Início da vigência'],
                ['data_fim_vigencia', 'Data', 'Fim da vigência'],
              ].map(([campo, tipo, desc]) => (
                <tr key={campo}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{campo}</td>
                  <td className="px-4 py-2 text-muted-foreground">{tipo}</td>
                  <td className="px-4 py-2 text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legal */}
      <div className="rounded-xl border border-info/30 bg-info/5 p-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-info">Base Legal:</strong> A disponibilização de dados abertos atende à 
          Lei de Acesso à Informação (Lei 12.527/2011), ao Decreto 8.777/2016 (Política de Dados Abertos), 
          à Recomendação MPC-MG nº 01/2025 e à Lei Complementar 210/2024.
        </p>
      </div>
    </div>
  );
};

export default DadosAbertosSection;
