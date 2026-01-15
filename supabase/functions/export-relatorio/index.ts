import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Emenda {
  id: string;
  numero: string;
  tipo_concedente: string;
  nome_concedente: string;
  tipo_recebedor: string;
  nome_recebedor: string;
  cnpj_recebedor: string;
  municipio: string;
  estado: string;
  data_disponibilizacao: string;
  gestor_responsavel: string;
  objeto: string;
  grupo_natureza_despesa: string;
  valor: number;
  valor_executado: number;
  contrapartida: number | null;
  banco: string;
  conta_corrente: string;
  anuencia_previa_sus: boolean | null;
  status: string;
  created_at: string;
}

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

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  em_execucao: 'Em Execução',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function escapeCSV(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateCSV(emendas: Emenda[]): string {
  const headers = [
    'Número',
    'Status',
    'Tipo Concedente',
    'Nome Concedente',
    'Tipo Recebedor',
    'Nome Recebedor',
    'CNPJ Recebedor',
    'Município',
    'Estado',
    'Data Disponibilização',
    'Gestor Responsável',
    'Objeto',
    'Grupo Natureza Despesa',
    'Valor Concedente (R$)',
    'Contrapartida (R$)',
    'Valor Total (R$)',
    'Valor Executado (R$)',
    '% Executado',
    'Banco',
    'Conta Corrente',
    'Anuência Prévia SUS',
    'Data Cadastro',
  ];

  const rows = emendas.map((e) => {
    const valorConc = Number(e.valor);
    const valorContra = Number(e.contrapartida || 0);
    const valorTotal = valorConc + valorContra;
    return [
      escapeCSV(e.numero),
      escapeCSV(statusLabels[e.status] || e.status),
      escapeCSV(tipoConcedenteLabels[e.tipo_concedente] || e.tipo_concedente),
      escapeCSV(e.nome_concedente),
      escapeCSV(tipoRecebedorLabels[e.tipo_recebedor] || e.tipo_recebedor),
      escapeCSV(e.nome_recebedor),
      escapeCSV(e.cnpj_recebedor),
      escapeCSV(e.municipio),
      escapeCSV(e.estado),
      escapeCSV(formatDate(e.data_disponibilizacao)),
      escapeCSV(e.gestor_responsavel),
      escapeCSV(e.objeto),
      escapeCSV(e.grupo_natureza_despesa),
      escapeCSV(valorConc.toFixed(2)),
      escapeCSV(valorContra.toFixed(2)),
      escapeCSV(valorTotal.toFixed(2)),
      escapeCSV(Number(e.valor_executado).toFixed(2)),
      escapeCSV(((Number(e.valor_executado) / valorTotal) * 100).toFixed(2) + '%'),
      escapeCSV(e.banco),
      escapeCSV(e.conta_corrente),
      escapeCSV(e.anuencia_previa_sus === null ? 'N/A' : e.anuencia_previa_sus ? 'Sim' : 'Não'),
      escapeCSV(formatDate(e.created_at)),
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function generateHTML(emendas: Emenda[]): string {
  const totalConcedente = emendas.reduce((acc, e) => acc + Number(e.valor), 0);
  const totalContrapartida = emendas.reduce((acc, e) => acc + Number(e.contrapartida || 0), 0);
  const totalValor = totalConcedente + totalContrapartida;
  const totalExecutado = emendas.reduce((acc, e) => acc + Number(e.valor_executado), 0);
  const percentualGeral = totalValor > 0 ? ((totalExecutado / totalValor) * 100).toFixed(2) : '0.00';

  const statusCount = emendas.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tableRows = emendas
    .map((e) => {
      const valorConc = Number(e.valor);
      const valorContra = Number(e.contrapartida || 0);
      const valorTotal = valorConc + valorContra;
      return `
    <tr>
      <td>${e.numero}</td>
      <td><span class="status status-${e.status}">${statusLabels[e.status] || e.status}</span></td>
      <td>${e.nome_concedente}</td>
      <td>${e.nome_recebedor}</td>
      <td>${e.municipio}/${e.estado}</td>
      <td class="text-right">${formatCurrency(valorConc)}</td>
      <td class="text-right">${formatCurrency(valorContra)}</td>
      <td class="text-right">${formatCurrency(valorTotal)}</td>
      <td class="text-right">${formatCurrency(Number(e.valor_executado))}</td>
      <td class="text-right">${((Number(e.valor_executado) / valorTotal) * 100).toFixed(1)}%</td>
    </tr>
  `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Emendas Parlamentares - TCE-MG</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      font-size: 11pt; 
      line-height: 1.5;
      color: #1a1a1a;
      padding: 20mm;
    }
    .header { 
      text-align: center; 
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #1e40af;
    }
    .header h1 { 
      font-size: 18pt; 
      color: #1e40af;
      margin-bottom: 5px;
    }
    .header h2 {
      font-size: 14pt;
      font-weight: normal;
      color: #374151;
      margin-bottom: 10px;
    }
    .header .date { 
      font-size: 10pt; 
      color: #6b7280; 
    }
    .summary {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }
    .summary-card {
      flex: 1;
      min-width: 150px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .summary-card .label {
      font-size: 9pt;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-card .value {
      font-size: 16pt;
      font-weight: bold;
      color: #1e40af;
      margin-top: 5px;
    }
    .summary-card .value.green { color: #059669; }
    .summary-card .value.amber { color: #d97706; }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-top: 20px;
      font-size: 9pt;
    }
    th, td { 
      border: 1px solid #d1d5db; 
      padding: 8px 10px; 
      text-align: left; 
    }
    th { 
      background: #1e40af; 
      color: white;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.5px;
    }
    tr:nth-child(even) { background: #f9fafb; }
    tr:hover { background: #f3f4f6; }
    .text-right { text-align: right; }
    .status {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 600;
    }
    .status-pendente { background: #fef3c7; color: #92400e; }
    .status-aprovado { background: #dbeafe; color: #1e40af; }
    .status-em_execucao { background: #d1fae5; color: #065f46; }
    .status-concluido { background: #c7d2fe; color: #3730a3; }
    .status-cancelado { background: #fee2e2; color: #991b1b; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 9pt;
      color: #6b7280;
    }
    .footer .compliance {
      background: #eff6ff;
      border-left: 4px solid #1e40af;
      padding: 10px 15px;
      margin-bottom: 15px;
    }
    @media print {
      body { padding: 10mm; }
      .summary-card { break-inside: avoid; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Relatório de Emendas Parlamentares</h1>
    <h2>Prestação de Contas - TCE-MG</h2>
    <p class="date">Gerado em ${new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}</p>
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="label">Total de Emendas</div>
      <div class="value">${emendas.length}</div>
    </div>
    <div class="summary-card">
      <div class="label">Valor Total</div>
      <div class="value">${formatCurrency(totalValor)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Concedente</div>
      <div class="value">${formatCurrency(totalConcedente)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Contrapartida</div>
      <div class="value">${formatCurrency(totalContrapartida)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Valor Executado</div>
      <div class="value green">${formatCurrency(totalExecutado)}</div>
    </div>
    <div class="summary-card">
      <div class="label">% Execução</div>
      <div class="value amber">${percentualGeral}%</div>
    </div>
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="label">Pendentes</div>
      <div class="value">${statusCount['pendente'] || 0}</div>
    </div>
    <div class="summary-card">
      <div class="label">Aprovadas</div>
      <div class="value">${statusCount['aprovado'] || 0}</div>
    </div>
    <div class="summary-card">
      <div class="label">Em Execução</div>
      <div class="value">${statusCount['em_execucao'] || 0}</div>
    </div>
    <div class="summary-card">
      <div class="label">Concluídas</div>
      <div class="value">${statusCount['concluido'] || 0}</div>
    </div>
  </div>

  <h3>Detalhamento das Emendas</h3>
  <table>
    <thead>
      <tr>
        <th>Número</th>
        <th>Status</th>
        <th>Concedente</th>
        <th>Recebedor</th>
        <th>Município</th>
        <th class="text-right">Concedente</th>
        <th class="text-right">Contrapartida</th>
        <th class="text-right">Total</th>
        <th class="text-right">Executado</th>
        <th class="text-right">%</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div class="footer">
    <div class="compliance">
      <strong>Conformidade Legal:</strong> Este relatório atende aos requisitos da Recomendação MPC-MG nº 01/2025, 
      Art. 2º, §1º, conforme ADPF 854/DF e Lei Complementar 210/2024, garantindo transparência e rastreabilidade 
      das emendas parlamentares.
    </div>
    <p>Portal de Emendas Parlamentares - Sistema de Gestão e Transparência</p>
  </div>
</body>
</html>
  `;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { format, filters } = await req.json();
    console.log('Export request:', { format, filters });

    // Build query
    let query = supabase.from('emendas').select('*').order('created_at', { ascending: false });

    // Apply filters if provided
    if (filters?.status && filters.status !== 'todos') {
      query = query.eq('status', filters.status);
    }
    if (filters?.tipoConcedente && filters.tipoConcedente !== 'todos') {
      query = query.eq('tipo_concedente', filters.tipoConcedente);
    }

    const { data: emendas, error } = await query;

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Found ${emendas?.length || 0} emendas to export`);

    if (!emendas || emendas.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhuma emenda encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (format === 'csv') {
      const csv = generateCSV(emendas);
      return new Response(csv, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="relatorio-emendas-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'pdf') {
      const html = generateHTML(emendas);
      return new Response(html, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    } else {
      return new Response(JSON.stringify({ error: 'Formato inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
