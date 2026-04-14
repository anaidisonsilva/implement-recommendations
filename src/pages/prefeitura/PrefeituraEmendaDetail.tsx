import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  User,
  MapPin,
  CreditCard,
  Loader2,
  Download,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import EmendaExportDropdown from '@/components/emendas/EmendaExportDropdown';
import LastUpdatedBanner from '@/components/prefeitura/LastUpdatedBanner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { useEmenda } from '@/hooks/useEmendas';
import { usePrefeituraBySlug } from '@/hooks/usePrefeituras';
import { useEmpresasByEmenda } from '@/hooks/useEmpresasLicitacao';
import { usePlanoTrabalho, useCronogramaItems } from '@/hooks/usePlanoTrabalho';
import EmpresasLicitacaoSection from '@/components/emendas/EmpresasLicitacaoSection';
import PlanoTrabalhoPublicSection from '@/components/plano-trabalho/PlanoTrabalhoPublicSection';
import PortalBreadcrumb from '@/components/prefeitura/PortalBreadcrumb';
import { toast } from 'sonner';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
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

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  em_execucao: 'Em Execução',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

const PrefeituraEmendaDetail = () => {
  const navigate = useNavigate();
  const { slug, id } = useParams();
  const { data: prefeitura, isLoading: loadingPrefeitura } = usePrefeituraBySlug(slug ?? '');
  const { data: emenda, isLoading: loadingEmenda } = useEmenda(id || '');
  const { data: empresas } = useEmpresasByEmenda(id || '');
  const { data: planoTrabalho } = usePlanoTrabalho(id || '');
  const { data: cronogramaItems } = useCronogramaItems(planoTrabalho?.id || '');

  const handleExportPDF = () => {
    if (!emenda) return;

    const valor = Number(emenda.valor);
    const contrapartida = Number(emenda.contrapartida || 0);
    const valorTotal = valor + contrapartida;
    const valorExecutado = Number(emenda.valor_executado);
    const valorRepassado = Number((emenda as any).valor_repassado || 0);
    const progressPercent = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

    // Generate Plano de Trabalho section
    let planoTrabalhoHtml = '';
    if (planoTrabalho) {
      let cronogramaHtml = '';
      if (cronogramaItems && cronogramaItems.length > 0) {
        cronogramaHtml = `
          <div style="margin-top: 15px;">
            <h4 style="font-size: 12px; color: #0066cc; margin-bottom: 10px;">Cronograma de Execução</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #f0f0f0;">
                  <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">Etapa</th>
                  <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">Início</th>
                  <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">Fim</th>
                  <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">Conclusão</th>
                </tr>
              </thead>
              <tbody>
                ${cronogramaItems.map(item => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 6px;">${item.etapa}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${new Date(item.data_inicio).toLocaleDateString('pt-BR')}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${new Date(item.data_fim).toLocaleDateString('pt-BR')}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${item.percentual_conclusao}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      planoTrabalhoHtml = `
        <div class="card" style="grid-column: span 2; margin-top: 20px;">
          <h3>Plano de Trabalho</h3>
          <div class="field"><div class="label">Objeto</div><div class="value">${planoTrabalho.objeto}</div></div>
          <div class="field"><div class="label">Finalidade</div><div class="value">${planoTrabalho.finalidade}</div></div>
          <div class="field"><div class="label">Estimativa de Recursos</div><div class="value">${formatCurrency(Number(planoTrabalho.estimativa_recursos))}</div></div>
          ${cronogramaHtml}
        </div>
      `;
    }

    // Generate Empresas e Pagamentos section
    let empresasPagamentosHtml = '';
    if (empresas && empresas.length > 0) {
      const empresasHtml = empresas.map(empresa => {
        let pagamentosHtml = '';
        if (empresa.pagamentos && empresa.pagamentos.length > 0) {
          pagamentosHtml = `
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px;">
              <thead>
                <tr style="background: #f0f0f0;">
                  <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">Data</th>
                  <th style="border: 1px solid #ddd; padding: 6px; text-align: right;">Valor</th>
                  <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">Descrição</th>
                </tr>
              </thead>
              <tbody>
                ${empresa.pagamentos.map(pag => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 6px;">${new Date(pag.data_pagamento).toLocaleDateString('pt-BR')}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${formatCurrency(Number(pag.valor))}</td>
                    <td style="border: 1px solid #ddd; padding: 6px;">${pag.descricao || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }

        return `
          <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 6px; padding: 12px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <div>
                <strong>${empresa.nome_empresa}</strong>
                <div style="font-size: 11px; color: #666;">CNPJ: ${empresa.cnpj}</div>
              </div>
              <div style="text-align: right; font-size: 11px; color: #666;">
                Empenho: ${empresa.numero_empenho}
              </div>
            </div>
            ${pagamentosHtml}
          </div>
        `;
      }).join('');

      empresasPagamentosHtml = `
        <div class="card" style="grid-column: span 2; margin-top: 20px;">
          <h3>Empresas Contratadas e Pagamentos</h3>
          ${empresasHtml}
        </div>
      `;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${emenda.numero ? `Emenda Nº ${emenda.numero}` : 'Emenda de Programa'} - ${prefeitura?.nome || ''}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; color: #1a1a1a; line-height: 1.5; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #0066cc; }
    .header h1 { color: #0066cc; font-size: 22px; margin-bottom: 8px; }
    .header p { color: #666; font-size: 14px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-pendente { background: #fef3c7; color: #92400e; }
    .status-aprovado { background: #dbeafe; color: #1e40af; }
    .status-em_execucao { background: #e0e7ff; color: #3730a3; }
    .status-concluido { background: #d1fae5; color: #065f46; }
    .status-cancelado { background: #fee2e2; color: #991b1b; }
    .progress-bar { background: #e5e5e5; border-radius: 4px; height: 12px; margin: 10px 0; }
    .progress-fill { background: #0066cc; height: 100%; border-radius: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
    .card { background: #f9f9f9; border-radius: 8px; padding: 15px; }
    .card h3 { color: #0066cc; font-size: 14px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e5e5; }
    .field { margin-bottom: 8px; }
    .field .label { font-size: 11px; color: #666; text-transform: uppercase; }
    .field .value { font-size: 13px; font-weight: 500; }
    .summary { background: #e0f2fe; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center; }
    .summary-item .label { font-size: 11px; color: #0369a1; }
    .summary-item .value { font-size: 18px; font-weight: bold; color: #0066cc; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; font-size: 11px; color: #666; }
    .compliance { background: #e0f2fe; border: 1px solid #0284c7; border-radius: 6px; padding: 12px; margin-top: 20px; font-size: 11px; color: #0369a1; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${emenda.numero ? `Emenda Nº ${emenda.numero}` : 'Emenda de Programa'}</h1>
    <h2 style="font-size: 16px; color: #666; margin-bottom: 10px;">${prefeitura?.nome || ''}</h2>
    <p>${emenda.objeto}</p>
    <span class="status status-${emenda.status}">${statusLabels[emenda.status]}</span>
  </div>

  <div class="summary">
    <div class="summary-grid">
      <div class="summary-item">
        <div class="label">Valor Concedente</div>
        <div class="value">${formatCurrency(valor)}</div>
      </div>
      <div class="summary-item">
        <div class="label">Contrapartida</div>
        <div class="value">${formatCurrency(contrapartida)}</div>
      </div>
      <div class="summary-item">
        <div class="label">Valor Total</div>
        <div class="value">${formatCurrency(valorTotal)}</div>
      </div>
      <div class="summary-item">
        <div class="label">Repassado</div>
        <div class="value">${formatCurrency(valorRepassado)}</div>
      </div>
      <div class="summary-item">
        <div class="label">Executado</div>
        <div class="value">${formatCurrency(valorExecutado)}</div>
      </div>
    </div>
    <div style="margin-top: 10px; display: flex; justify-content: space-between; font-size: 12px;">
      <span>Restante: ${formatCurrency(valorTotal - valorExecutado)}</span>
      <span>Execução: ${progressPercent.toFixed(1)}%</span>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width: ${progressPercent}%"></div></div>
  </div>

  <div class="grid">
    <div class="card">
      <h3>Concedente</h3>
      <div class="field"><div class="label">Tipo</div><div class="value">${tipoConcedenteLabels[emenda.tipo_concedente] || emenda.tipo_concedente}</div></div>
      <div class="field"><div class="label">Nome</div><div class="value">${emenda.nome_concedente || '-'}</div></div>
    </div>
    <div class="card">
      <h3>Recebedor</h3>
      <div class="field"><div class="label">Tipo</div><div class="value">${tipoRecebedorLabels[emenda.tipo_recebedor] || emenda.tipo_recebedor}</div></div>
      <div class="field"><div class="label">Nome</div><div class="value">${emenda.nome_recebedor}</div></div>
      <div class="field"><div class="label">CNPJ</div><div class="value">${emenda.cnpj_recebedor}</div></div>
    </div>
    <div class="card">
      <h3>Localização e Gestão</h3>
      <div class="field"><div class="label">Município/Estado</div><div class="value">${emenda.municipio}/${emenda.estado}</div></div>
      <div class="field"><div class="label">Gestor Responsável</div><div class="value">${emenda.gestor_responsavel}</div></div>
      <div class="field"><div class="label">Data Disponibilização</div><div class="value">${formatDate(emenda.data_disponibilizacao)}</div></div>
    </div>
    <div class="card">
      <h3>Dados Financeiros</h3>
      <div class="field"><div class="label">Grupo Natureza Despesa</div><div class="value">${emenda.grupo_natureza_despesa}</div></div>
      <div class="field"><div class="label">Função de Governo</div><div class="value">${(emenda as any).funcao_governo || '-'}</div></div>
      <div class="field"><div class="label">Banco</div><div class="value">${emenda.banco || '-'}</div></div>
      <div class="field"><div class="label">Conta Corrente</div><div class="value">${emenda.conta_corrente || '-'}</div></div>
    </div>
    ${planoTrabalhoHtml}
    ${empresasPagamentosHtml}
  </div>

  <div class="compliance">
    <strong>Conformidade:</strong> Esta emenda está registrada em conformidade com o Art. 2º, §1º da Recomendação MPC-MG nº 01/2025.
  </div>

  <div class="footer">
    <p>${prefeitura?.nome || 'Portal de Emendas Parlamentares'} - Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
      toast.success('Relatório aberto para impressão/PDF');
    } else {
      toast.error('Popup bloqueado. Permita popups para exportar PDF.');
    }
  };

  const isLoading = loadingPrefeitura || loadingEmenda;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!prefeitura) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Prefeitura não encontrada</h1>
        <Button asChild className="mt-6">
          <Link to="/">Voltar ao Portal Principal</Link>
        </Button>
      </div>
    );
  }

  if (!emenda) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="text-lg font-medium text-muted-foreground">Emenda não encontrada</p>
        <Button asChild className="mt-4">
          <Link to={`/p/${slug}`}>Voltar ao portal</Link>
        </Button>
      </div>
    );
  }

  const valor = Number(emenda.valor);
  const contrapartida = Number(emenda.contrapartida || 0);
  const valorTotal = valor + contrapartida;
  const valorExecutado = Number(emenda.valor_executado);
  const valorRepassado = Number((emenda as any).valor_repassado || 0);
  const valorEmpenhado = Number(emenda.valor_empenhado || 0);
  const valorLiquidado = Number(emenda.valor_liquidado || 0);
  const valorPago = Number(emenda.valor_pago || 0);
  const progressPercent = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
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
                <h1 className="text-2xl font-bold text-foreground">
                  {prefeitura.nome}
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Detalhes da Emenda
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <EmendaExportDropdown emenda={emenda} onExportPDF={handleExportPDF} />
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PortalBreadcrumb
          slug={slug!}
          items={[
            ...(emenda.numero_convenio
              ? [{ label: 'Convênios', href: `/p/${slug}/convenios` }]
              : []),
            { label: emenda.numero_convenio ? `Convênio ${emenda.numero_convenio}` : `Emenda ${emenda.numero || emenda.id.slice(0, 8)}` },
          ]}
        />
        <LastUpdatedBanner emendas={emenda ? [emenda] : null} />
        <div className="space-y-6">
          {/* PIX Banner */}
          {emenda.especial && (
            <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-5 shadow-sm dark:border-amber-600 dark:bg-amber-950/30">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400/20">
                  <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Emenda Especial — Emenda PIX
                  </h3>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    Esta é uma <strong>Emenda Especial (PIX)</strong>, transferência de recurso com execução direta ao ente federativo.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Sujeita a fiscalização e prestação de contas conforme Art. 2º, §1º da Recomendação MPC-MG nº 01/2025</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-xl font-bold text-foreground">
                      {emenda.numero ? `Emenda Nº ${emenda.numero}` : 'Emenda de Programa'}
                    </h1>
                    <StatusBadge status={emenda.status} />
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${(emenda as any).esfera === 'estadual' ? 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300' : (emenda as any).esfera === 'municipal' ? 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300' : 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300'}`}>
                      {(emenda as any).esfera === 'estadual' ? 'Estadual' : (emenda as any).esfera === 'municipal' ? 'Municipal' : 'Federal'}
                    </span>
                    {emenda.especial && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        <Zap className="h-3 w-3" /> Emenda PIX
                      </span>
                    )}
                    {(emenda as any).programa && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Programa
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>Tipo: <strong className="text-foreground">{tipoConcedenteLabels[emenda.tipo_concedente] || emenda.tipo_concedente}</strong></span>
                    <span>Forma de Repasse: <strong className="text-foreground">{emenda.especial ? 'Transferência Especial' : emenda.numero_convenio ? 'Convênio' : 'Fundo a Fundo'}</strong></span>
                    {emenda.numero_proposta && (
                      <span>Proposta: <strong className="text-foreground">{emenda.numero_proposta}</strong></span>
                    )}
                    {emenda.numero_convenio && (
                      <span>Convênio: <strong className="text-foreground">{emenda.numero_convenio}</strong></span>
                    )}
                    {emenda.numero_plano_acao && (
                      <span>Plano de Ação: <strong className="text-foreground">{emenda.numero_plano_acao}</strong></span>
                    )}
                  </div>
                  <p className="mt-2 text-muted-foreground break-words whitespace-normal overflow-hidden">{emenda.objeto}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Função de Governo: <strong className="text-foreground">{(emenda as any).funcao_governo || '-'}</strong>
                  </p>
                </div>
              </div>
              <div className="flex gap-6 text-right">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Concedente</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(valor)}
                  </p>
                </div>
                {contrapartida > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contrapartida</p>
                    <p className="text-lg font-semibold text-amber-600">
                      {formatCurrency(contrapartida)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Repassado</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(valorRepassado)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(valorTotal)}
                  </p>
                </div>
              </div>
            </div>
          </div>

           {/* Progress Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Execução Financeira</h3>
              <span className="text-sm text-muted-foreground">
                {progressPercent.toFixed(1)}% executado
              </span>
            </div>
            <Progress value={progressPercent} className="h-3 mb-3" />
            <div className="flex justify-between text-sm mb-4">
              <span className="text-muted-foreground">
                Executado: <strong className="text-success">{formatCurrency(valorExecutado)}</strong>
              </span>
              <span className="text-muted-foreground">
                Restante: <strong className="text-foreground">{formatCurrency(valorTotal - valorExecutado)}</strong>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Empenhado</p>
                <p className="text-base font-semibold text-blue-700 dark:text-blue-300">{formatCurrency(valorEmpenhado)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Liquidado</p>
                <p className="text-base font-semibold text-amber-700 dark:text-amber-300">{formatCurrency(valorLiquidado)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Pago</p>
                <p className="text-base font-semibold text-green-700 dark:text-green-300">{formatCurrency(valorPago)}</p>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Concedente */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Concedente</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Tipo:</span>{' '}
                  <span className="font-medium">{tipoConcedenteLabels[emenda.tipo_concedente] || emenda.tipo_concedente}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Nome:</span>{' '}
                  <span className="font-medium">{emenda.nome_concedente || '-'}</span>
                </div>
                {emenda.nome_parlamentar && (
                  <div>
                    <span className="text-muted-foreground">Parlamentar:</span>{' '}
                    <span className="font-medium">{emenda.nome_parlamentar}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recebedor */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Recebedor</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Tipo:</span>{' '}
                  <span className="font-medium">{tipoRecebedorLabels[emenda.tipo_recebedor] || emenda.tipo_recebedor}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Nome:</span>{' '}
                  <span className="font-medium">{emenda.nome_recebedor}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">CNPJ:</span>{' '}
                  <span className="font-medium">{emenda.cnpj_recebedor}</span>
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Localização e Gestão</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Município/UF:</span>{' '}
                  <span className="font-medium">{emenda.municipio}/{emenda.estado}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Gestor Responsável:</span>{' '}
                  <span className="font-medium">{emenda.gestor_responsavel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Data Disponibilização:</span>{' '}
                  <span className="font-medium">{formatDate(emenda.data_disponibilizacao)}</span>
                </div>
                {emenda.data_inicio_vigencia && (
                  <div>
                    <span className="text-muted-foreground">Vigência:</span>{' '}
                    <span className="font-medium">
                      {formatDate(emenda.data_inicio_vigencia)} até {emenda.data_fim_vigencia ? formatDate(emenda.data_fim_vigencia) : 'Não definido'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Dados Financeiros */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Dados Financeiros</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Grupo Natureza Despesa:</span>{' '}
                  <span className="font-medium">{emenda.grupo_natureza_despesa}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Função de Governo:</span>{' '}
                  <span className="font-medium">{(emenda as any).funcao_governo || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Banco:</span>{' '}
                  <span className="font-medium">{emenda.banco || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Conta Corrente:</span>{' '}
                  <span className="font-medium">{emenda.conta_corrente || '-'}</span>
                </div>
                {emenda.anuencia_previa_sus !== null && (
                  <div>
                    <span className="text-muted-foreground">Anuência Prévia SUS:</span>{' '}
                    <span className="font-medium">{emenda.anuencia_previa_sus ? 'Sim' : 'Não'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Plano de Trabalho */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <PlanoTrabalhoPublicSection emendaId={emenda.id} />
          </div>

          {/* Empresas Licitação */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <EmpresasLicitacaoSection emendaId={emenda.id} readOnly={true} />
          </div>

          {/* Compliance Banner */}
          <div className="rounded-xl border border-info/30 bg-info/5 p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-info">Conformidade Legal:</strong> Esta emenda está registrada em 
              conformidade com o Art. 2º, §1º da Recomendação MPC-MG nº 01/2025, ADPF 854/DF e 
              Lei Complementar 210/2024.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrefeituraEmendaDetail;
