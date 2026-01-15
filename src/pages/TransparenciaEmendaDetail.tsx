import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  User,
  MapPin,
  CreditCard,
  Loader2,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { useEmenda } from '@/hooks/useEmendas';
import { useEmpresasByEmenda } from '@/hooks/useEmpresasLicitacao';
import { usePlanoTrabalho, useCronogramaItems } from '@/hooks/usePlanoTrabalho';
import EmpresasLicitacaoSection from '@/components/emendas/EmpresasLicitacaoSection';
import PlanoTrabalhoPublicSection from '@/components/plano-trabalho/PlanoTrabalhoPublicSection';
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

const tipoConcedenteLabels = {
  parlamentar: 'Parlamentar',
  comissao: 'Comissão',
  bancada: 'Bancada',
  outro: 'Outro',
};

const tipoRecebedorLabels = {
  administracao_publica: 'Administração Pública',
  entidade_sem_fins_lucrativos: 'Entidade sem Fins Lucrativos',
  consorcio_publico: 'Consórcio Público',
  pessoa_juridica_privada: 'Pessoa Jurídica de Direito Privado',
  outro: 'Outro',
};

const TransparenciaEmendaDetail = () => {
  const { id } = useParams();
  const { data: emenda, isLoading } = useEmenda(id || '');
  const { data: empresas } = useEmpresasByEmenda(id || '');
  const { data: planoTrabalho } = usePlanoTrabalho(id || '');
  const { data: cronogramaItems } = useCronogramaItems(planoTrabalho?.id || '');

  const handleExportPDF = () => {
    if (!emenda) return;

    const valor = Number(emenda.valor);
    const contrapartida = Number(emenda.contrapartida || 0);
    const valorTotal = valor + contrapartida;
    const valorExecutado = Number(emenda.valor_executado);
    const progressPercent = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

    const planoTrabalhoHtml = planoTrabalho ? `
      <h2 style="margin-top: 30px; color: #0066cc; font-size: 18px; border-bottom: 1px solid #e5e5e5; padding-bottom: 8px;">Plano de Trabalho</h2>
      <div style="margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 8px;">
        <div style="margin-bottom: 10px;">
          <strong style="color: #333;">Objeto:</strong><br>
          <span>${planoTrabalho.objeto}</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong style="color: #333;">Finalidade:</strong><br>
          <span>${planoTrabalho.finalidade}</span>
        </div>
        <div>
          <strong style="color: #333;">Estimativa de Recursos:</strong> ${formatCurrency(Number(planoTrabalho.estimativa_recursos))}
        </div>
        ${cronogramaItems?.length ? `
          <h3 style="margin-top: 15px; color: #0066cc; font-size: 14px;">Cronograma</h3>
          <table style="width: 100%; font-size: 11px; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background: #e5e5e5;">
                <th style="padding: 6px; text-align: left;">Etapa</th>
                <th style="padding: 6px; text-align: center;">Início</th>
                <th style="padding: 6px; text-align: center;">Fim</th>
                <th style="padding: 6px; text-align: center;">% Conclusão</th>
              </tr>
            </thead>
            <tbody>
              ${cronogramaItems.map(item => `
                <tr style="border-bottom: 1px solid #e5e5e5;">
                  <td style="padding: 6px;">${item.etapa}</td>
                  <td style="padding: 6px; text-align: center;">${new Date(item.data_inicio).toLocaleDateString('pt-BR')}</td>
                  <td style="padding: 6px; text-align: center;">${new Date(item.data_fim).toLocaleDateString('pt-BR')}</td>
                  <td style="padding: 6px; text-align: center;">${item.percentual_conclusao}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </div>
    ` : '';

    const empresasHtml = empresas?.length ? `
      <h2 style="margin-top: 30px; color: #0066cc; font-size: 18px; border-bottom: 1px solid #e5e5e5; padding-bottom: 8px;">Empresas Licitadas e Pagamentos</h2>
      ${empresas.map(emp => `
        <div style="margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div>
              <strong>${emp.nome_empresa}</strong><br>
              <span style="color: #666; font-size: 12px;">CNPJ: ${emp.cnpj} | Empenho: ${emp.numero_empenho}</span>
            </div>
            <div style="text-align: right;">
              <strong style="color: #0066cc;">${formatCurrency(emp.pagamentos?.reduce((sum, p) => sum + Number(p.valor), 0) || 0)}</strong><br>
              <span style="color: #666; font-size: 12px;">${emp.pagamentos?.length || 0} pagamento(s)</span>
            </div>
          </div>
          ${emp.pagamentos?.length ? `
            <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
              <thead>
                <tr style="background: #e5e5e5;">
                  <th style="padding: 6px; text-align: left;">Data</th>
                  <th style="padding: 6px; text-align: right;">Valor</th>
                  <th style="padding: 6px; text-align: left;">Descrição</th>
                </tr>
              </thead>
              <tbody>
                ${emp.pagamentos.map(pag => `
                  <tr style="border-bottom: 1px solid #e5e5e5;">
                    <td style="padding: 6px;">${new Date(pag.data_pagamento).toLocaleDateString('pt-BR')}</td>
                    <td style="padding: 6px; text-align: right;">${formatCurrency(Number(pag.valor))}</td>
                    <td style="padding: 6px;">${pag.descricao || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="color: #666; font-size: 12px; margin-top: 10px;">Nenhum pagamento registrado</p>'}
        </div>
      `).join('')}
    ` : '';

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Emenda Nº ${emenda.numero}</title>
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
    <h1>Emenda Nº ${emenda.numero}</h1>
    ${(emenda.numero_proposta || emenda.numero_convenio || emenda.numero_plano_acao) ? `
      <p style="font-size: 12px; margin: 5px 0;">
        ${emenda.numero_proposta ? `Proposta: <strong>${emenda.numero_proposta}</strong>` : ''}
        ${emenda.numero_proposta && (emenda.numero_convenio || emenda.numero_plano_acao) ? ' | ' : ''}
        ${emenda.numero_convenio ? `Convênio: <strong>${emenda.numero_convenio}</strong>` : ''}
        ${emenda.numero_convenio && emenda.numero_plano_acao ? ' | ' : ''}
        ${emenda.numero_plano_acao ? `Plano de Ação: <strong>${emenda.numero_plano_acao}</strong>` : ''}
      </p>
    ` : ''}
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
      <div class="field"><div class="label">Tipo</div><div class="value">${tipoConcedenteLabels[emenda.tipo_concedente]}</div></div>
      <div class="field"><div class="label">Nome</div><div class="value">${emenda.nome_concedente}</div></div>
    </div>
    <div class="card">
      <h3>Recebedor</h3>
      <div class="field"><div class="label">Tipo</div><div class="value">${tipoRecebedorLabels[emenda.tipo_recebedor]}</div></div>
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
      <div class="field"><div class="label">Banco</div><div class="value">${emenda.banco}</div></div>
      <div class="field"><div class="label">Conta Corrente</div><div class="value">${emenda.conta_corrente}</div></div>
    </div>
  </div>

  ${planoTrabalhoHtml}

  ${empresasHtml}

  <div class="compliance">
    <strong>Conformidade:</strong> Esta emenda está registrada em conformidade com o Art. 2º, §1º da Recomendação MPC-MG nº 01/2025.
  </div>

  <div class="footer">
    <p>Portal de Emendas Parlamentares - Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
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

  const statusLabels: Record<string, string> = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    em_execucao: 'Em Execução',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!emenda) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="text-lg font-medium text-muted-foreground">Emenda não encontrada</p>
        <Button asChild className="mt-4">
          <Link to="/transparencia">Voltar ao portal</Link>
        </Button>
      </div>
    );
  }

  const valor = Number(emenda.valor);
  const contrapartida = Number(emenda.contrapartida || 0);
  const valorTotal = valor + contrapartida;
  const valorExecutado = Number(emenda.valor_executado);
  const progressPercent = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Portal de Transparência
              </h1>
              <p className="mt-1 text-muted-foreground">
                Detalhes da Emenda
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
              <Button variant="outline" asChild>
                <Link to="/transparencia">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao portal
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
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
                      Emenda Nº {emenda.numero}
                    </h1>
                    <StatusBadge status={emenda.status} />
                  </div>
                  {/* Números de identificação - apenas se cadastrados */}
                  {(emenda.numero_proposta || emenda.numero_convenio || emenda.numero_plano_acao) && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
                  )}
                  <p className="mt-2 text-muted-foreground break-words whitespace-normal overflow-hidden">{emenda.objeto}</p>
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
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(valorTotal)}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Execução Orçamentária</span>
                <span className="font-medium text-foreground">{progressPercent.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Executado: {formatCurrency(valorExecutado)}
                </span>
                <span className="text-muted-foreground">
                  Restante: {formatCurrency(valorTotal - valorExecutado)}
                </span>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Concedente */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <User className="h-5 w-5 text-primary" />
                Concedente
              </h3>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium text-foreground">
                    {tipoConcedenteLabels[emenda.tipo_concedente]}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium text-foreground">{emenda.nome_concedente}</p>
                </div>
              </div>
            </div>

            {/* Recebedor */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <Building2 className="h-5 w-5 text-primary" />
                Recebedor
              </h3>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium text-foreground">
                    {tipoRecebedorLabels[emenda.tipo_recebedor]}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium text-foreground">{emenda.nome_recebedor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CNPJ</p>
                  <p className="font-medium text-foreground">{emenda.cnpj_recebedor}</p>
                </div>
              </div>
            </div>

            {/* Localização e Gestor */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                Localização e Gestão
              </h3>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Município/Estado</p>
                  <p className="font-medium text-foreground">
                    {emenda.municipio}/{emenda.estado}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gestor Responsável</p>
                  <p className="font-medium text-foreground">{emenda.gestor_responsavel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Disponibilização</p>
                  <p className="font-medium text-foreground">
                    {formatDate(emenda.data_disponibilizacao)}
                  </p>
                </div>
              </div>
            </div>

            {/* Dados Financeiros */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <CreditCard className="h-5 w-5 text-primary" />
                Dados Financeiros
              </h3>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Grupo Natureza de Despesa</p>
                  <p className="font-medium text-foreground">{emenda.grupo_natureza_despesa}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Banco</p>
                  <p className="font-medium text-foreground">{emenda.banco}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conta Corrente</p>
                  <p className="font-medium text-foreground">{emenda.conta_corrente}</p>
                </div>
                {emenda.anuencia_previa_sus !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Anuência Prévia SUS</p>
                    <p className="font-medium text-foreground">
                      {emenda.anuencia_previa_sus ? 'Sim' : 'Não'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Plano de Trabalho */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <PlanoTrabalhoPublicSection emendaId={emenda.id} />
          </div>

          {/* Empresas Licitadas */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <EmpresasLicitacaoSection emendaId={emenda.id} readOnly />
          </div>
          <div className="rounded-xl border border-info/30 bg-info/5 p-4 text-sm">
            <p className="text-muted-foreground">
              <strong className="text-info">Conformidade:</strong> Esta emenda está registrada em 
              conformidade com o Art. 2º, §1º da Recomendação MPC-MG nº 01/2025, contendo todas as 
              informações obrigatórias para transparência e rastreabilidade.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>
            Portal de Emendas Parlamentares - Sistema de Gestão e Transparência
          </p>
          <p className="mt-1">
            Em conformidade com a Recomendação MPC-MG nº 01/2025
          </p>
        </footer>
      </main>
    </div>
  );
};

export default TransparenciaEmendaDetail;