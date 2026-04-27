import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  Database,
  Download,
  FileSpreadsheet,
  FileJson,
  FileCode,
  Table2,
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
  valor_repassado?: number;
  valor_empenhado?: number;
  valor_liquidado?: number;
  valor_pago?: number;
  contrapartida?: number | null;
  status: string;
  data_disponibilizacao: string;
  programa: boolean;
  especial: boolean;
  esfera?: string;
  tipo_concedente: string;
  tipo_recebedor: string;
  grupo_natureza_despesa: string;
  funcao_governo?: string | null;
  data_inicio_vigencia?: string | null;
  data_fim_vigencia?: string | null;
  numero_convenio?: string | null;
  numero_proposta?: string | null;
  numero_plano_acao?: string | null;
  gestor_responsavel?: string;
  banco?: string | null;
  conta_corrente?: string | null;
  anuencia_previa_sus?: boolean | null;
  forma_repasse?: string | null;
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

  const esferaLabels: Record<string, string> = {
    federal: 'Federal',
    estadual: 'Estadual',
    municipal: 'Municipal',
  };

  const buildRows = () =>
    emendas.map((e) => ({
      numero: e.numero || '',
      esfera: esferaLabels[e.esfera || 'federal'] || e.esfera || 'Federal',
      numero_convenio: e.numero_convenio || '',
      numero_proposta: e.numero_proposta || '',
      numero_plano_acao: e.numero_plano_acao || '',
      tipo: e.programa ? 'Programa' : 'Emenda',
      especial_pix: e.especial ? 'Sim' : 'Não',
      forma_repasse: (() => {
        if (e.forma_repasse) {
          const map: Record<string, string> = {
            especial: 'Transferência Especial',
            convenio: 'Convênio',
            fundo_a_fundo: 'Fundo a Fundo',
          };
          return map[e.forma_repasse] || e.forma_repasse;
        }
        if (e.especial) return 'Transferência Especial';
        if (e.numero_convenio) return 'Convênio';
        return 'Fundo a Fundo';
      })(),
      objeto: e.objeto,
      parlamentar: e.nome_parlamentar || '',
      tipo_concedente: tipoConcedenteLabels[e.tipo_concedente] || e.tipo_concedente,
      concedente: e.nome_concedente || '',
      recebedor: e.nome_recebedor,
      cnpj_recebedor: e.cnpj_recebedor,
      tipo_recebedor: tipoRecebedorLabels[e.tipo_recebedor] || e.tipo_recebedor,
      municipio: e.municipio,
      estado: e.estado,
      gestor_responsavel: e.gestor_responsavel || '',
      grupo_natureza_despesa: e.grupo_natureza_despesa,
      funcao_governo: e.funcao_governo || '',
      valor_concedente: Number(e.valor),
      contrapartida: Number(e.contrapartida || 0),
      valor_total: Number(e.valor) + Number(e.contrapartida || 0),
      valor_repassado: Number(e.valor_repassado || 0),
      valor_executado: Number(e.valor_executado),
      valor_empenhado: Number(e.valor_empenhado || 0),
      valor_liquidado: Number(e.valor_liquidado || 0),
      valor_pago: Number(e.valor_pago || 0),
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
      banco: e.banco || '',
      conta_corrente: e.conta_corrente || '',
      anuencia_previa_sus: e.anuencia_previa_sus === true ? 'Sim' : e.anuencia_previa_sus === false ? 'Não' : '',
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
          descricao: 'Dados abertos de emendas parlamentares e convênios',
          data_geracao: new Date().toISOString(),
          total_registros: rows.length,
          licenca: 'Creative Commons Attribution 4.0 (CC BY 4.0)',
          base_legal: 'Lei 12.527/2011, Decreto 8.777/2016, LC 210/2024, Recomendação MPC-MG 01/2025',
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
      xml += '    <base_legal>Lei 12.527/2011, Decreto 8.777/2016, LC 210/2024, Recomendação MPC-MG 01/2025</base_legal>\n';
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

  const handleExportXLSX = () => {
    setIsExporting('xlsx');
    try {
      const rows = buildRows();
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 20 }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dados Abertos');
      XLSX.writeFile(wb, `dados-abertos-emendas-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('XLSX exportado com sucesso!');
    } catch {
      toast.error('Erro ao exportar XLSX');
    } finally {
      setIsExporting(null);
    }
  };

  const datasets = [
    {
      title: 'Emendas Parlamentares e Convênios',
      description: 'Dataset completo com todas as emendas, convênios, valores, repasses, status e informações de vigência.',
      records: emendas.length,
      formats: [
        { label: 'XLSX', icon: Table2, color: 'text-emerald-600', handler: handleExportXLSX, key: 'xlsx' },
        { label: 'CSV', icon: FileSpreadsheet, color: 'text-green-600', handler: handleExportCSV, key: 'csv' },
        { label: 'JSON', icon: FileJson, color: 'text-blue-600', handler: handleExportJSON, key: 'json' },
        { label: 'XML', icon: FileCode, color: 'text-orange-600', handler: handleExportXML, key: 'xml' },
      ],
    },
  ];

  const dictionaryEntries = [
    ['numero', 'Texto', 'Número identificador da emenda parlamentar'],
    ['esfera', 'Texto', 'Esfera de origem do recurso: Federal, Estadual ou Municipal'],
    ['numero_convenio', 'Texto', 'Número do convênio ou instrumento de transferência'],
    ['numero_proposta', 'Texto', 'Número da proposta junto ao concedente'],
    ['numero_plano_acao', 'Texto', 'Número do plano de ação vinculado'],
    ['tipo', 'Texto', 'Classificação: Emenda ou Programa'],
    ['especial_pix', 'Texto', 'Indica se é emenda especial PIX (Sim/Não)'],
    ['objeto', 'Texto', 'Descrição do objeto da emenda ou convênio'],
    ['parlamentar', 'Texto', 'Nome do parlamentar autor da emenda'],
    ['tipo_concedente', 'Texto', 'Tipo do concedente (Parlamentar, Comissão, Bancada, Outro)'],
    ['concedente', 'Texto', 'Nome do órgão/entidade concedente dos recursos'],
    ['recebedor', 'Texto', 'Nome do ente recebedor (convenente)'],
    ['cnpj_recebedor', 'Texto', 'CNPJ do ente recebedor'],
    ['tipo_recebedor', 'Texto', 'Tipo do recebedor (Adm. Pública, Entidade sem Fins Lucrativos, Consórcio Público, PJ Privada, Outro)'],
    ['municipio', 'Texto', 'Município beneficiário dos recursos'],
    ['estado', 'Texto', 'Unidade Federativa (UF) do município'],
    ['gestor_responsavel', 'Texto', 'Nome do gestor responsável pela execução'],
    ['grupo_natureza_despesa', 'Texto', 'Grupo e natureza da despesa conforme classificação orçamentária (1 a 6)'],
    ['funcao_governo', 'Texto', 'Função de Governo conforme Lei 4.320/64 e Portaria MOG nº 42/1999 (ex: 10 - Saúde, 12 - Educação)'],
    ['valor_concedente', 'Numérico (R$)', 'Valor pactuado pelo concedente'],
    ['contrapartida', 'Numérico (R$)', 'Valor de contrapartida do convenente'],
    ['valor_total', 'Numérico (R$)', 'Valor global (concedente + contrapartida)'],
    ['valor_repassado', 'Numérico (R$)', 'Valor efetivamente repassado pelo concedente ao convenente'],
    ['valor_executado', 'Numérico (R$)', 'Valor efetivamente executado/pago nas despesas'],
    ['valor_empenhado', 'Numérico (R$)', 'Valor empenhado conforme execução orçamentária'],
    ['valor_liquidado', 'Numérico (R$)', 'Valor liquidado conforme execução orçamentária'],
    ['valor_pago', 'Numérico (R$)', 'Valor efetivamente pago conforme execução financeira'],
    ['percentual_execucao', 'Numérico (%)', 'Percentual de execução financeira sobre o valor global'],
    ['status', 'Texto', 'Situação atual: Pendente, Aprovado, Em Execução, Concluído ou Cancelado'],
    ['data_disponibilizacao', 'Data (AAAA-MM-DD)', 'Data de disponibilização/publicação do recurso'],
    ['data_inicio_vigencia', 'Data (AAAA-MM-DD)', 'Data de início da vigência do convênio/emenda'],
    ['data_fim_vigencia', 'Data (AAAA-MM-DD)', 'Data de término da vigência do convênio/emenda'],
    ['banco', 'Texto', 'Instituição bancária da conta específica do convênio'],
    ['conta_corrente', 'Texto', 'Número da conta corrente específica'],
    ['anuencia_previa_sus', 'Texto', 'Anuência prévia do SUS, quando aplicável (Sim/Não)'],
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
              Disponibilizamos os dados de emendas parlamentares e convênios em formatos abertos e legíveis por máquina,
              conforme a Lei de Acesso à Informação (Lei 12.527/2011), a Política de Dados Abertos (Decreto 8.777/2016),
              a Lei Complementar 210/2024 e a Recomendação MPC-MG nº 01/2025.
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
          <div className="grid gap-3 p-6 sm:grid-cols-4">
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
          <p className="text-xs text-muted-foreground mt-1">
            Descrição completa de todos os campos disponíveis nos arquivos de dados abertos, conforme exigências da transparência pública.
          </p>
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
              {dictionaryEntries.map(([campo, tipo, desc]) => (
                <tr key={campo}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{campo}</td>
                  <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">{tipo}</td>
                  <td className="px-4 py-2 text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legal */}
      <div className="rounded-xl border border-info/30 bg-info/5 p-4 text-sm text-muted-foreground space-y-2">
        <p>
          <strong className="text-info">Base Legal:</strong> A disponibilização de dados abertos atende à
          Lei de Acesso à Informação (Lei 12.527/2011), ao Decreto 8.777/2016 (Política de Dados Abertos),
          à Lei Complementar 210/2024, à Recomendação MPC-MG nº 01/2025 e às diretrizes do
          Tribunal de Contas do Estado para publicação de transferências voluntárias e convênios.
        </p>
        <p>
          <strong className="text-info">Termos de Uso:</strong> Os dados podem ser livremente utilizados,
          redistribuídos e adaptados para qualquer finalidade, inclusive comercial, desde que seja
          atribuída a fonte original conforme a licença CC BY 4.0.
        </p>
      </div>
    </div>
  );
};

export default DadosAbertosSection;
