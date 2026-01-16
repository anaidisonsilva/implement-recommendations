import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  User,
  MapPin,
  CreditCard,
  Download,
  Loader2,
  Trash2,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { useEmenda, useDeleteEmenda } from '@/hooks/useEmendas';
import { useEmpresasByEmenda } from '@/hooks/useEmpresasLicitacao';
import { usePlanoTrabalho, useCronogramaItems } from '@/hooks/usePlanoTrabalho';
import PlanoTrabalhoSection from '@/components/plano-trabalho/PlanoTrabalhoSection';
import EmpresasLicitacaoSection from '@/components/emendas/EmpresasLicitacaoSection';
import EditEmendaDialog from '@/components/emendas/EditEmendaDialog';
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

const EmendaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: emenda, isLoading } = useEmenda(id || '');
  const { data: empresas } = useEmpresasByEmenda(id || '');
  const { data: planoTrabalho } = usePlanoTrabalho(id || '');
  const { data: cronogramaItems } = useCronogramaItems(planoTrabalho?.id || '');
  const deleteEmenda = useDeleteEmenda();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!emenda) return;
    
    try {
      await deleteEmenda.mutateAsync(emenda.id);
      toast.success('Emenda excluída com sucesso');
      navigate('/emendas');
    } catch (error) {
      toast.error('Erro ao excluir emenda');
    }
  };

  const handleExportPDF = () => {
    if (!emenda) return;

    const valor = Number(emenda.valor);
    const valorExecutado = Number(emenda.valor_executado);
    const contrapartida = Number(emenda.contrapartida || 0);
    const valorTotal = valor + contrapartida;
    const progressPercent = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

    const planoTrabalhoHtml = planoTrabalho ? `
      <div class="section" style="margin-top: 20px;">
        <div class="section-title">PLANO DE TRABALHO</div>
        <div style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 8px;">
          <div class="field"><div class="field-label">Objeto</div><div class="field-value">${planoTrabalho.objeto}</div></div>
          <div class="field"><div class="field-label">Finalidade</div><div class="field-value">${planoTrabalho.finalidade}</div></div>
          <div class="field"><div class="field-label">Estimativa de Recursos</div><div class="field-value">${formatCurrency(Number(planoTrabalho.estimativa_recursos))}</div></div>
        </div>
        ${cronogramaItems?.length ? `
          <div style="margin-top: 12px;">
            <div class="field-label">Cronograma</div>
            <table style="width: 100%; font-size: 10px; border-collapse: collapse; margin-top: 6px;">
              <thead><tr style="background: #e2e8f0;"><th style="padding: 4px; text-align: left;">Etapa</th><th style="padding: 4px;">Início</th><th style="padding: 4px;">Fim</th><th style="padding: 4px;">% Conclusão</th></tr></thead>
              <tbody>${cronogramaItems.map(item => `<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 4px;">${item.etapa}</td><td style="padding: 4px; text-align: center;">${new Date(item.data_inicio).toLocaleDateString('pt-BR')}</td><td style="padding: 4px; text-align: center;">${new Date(item.data_fim).toLocaleDateString('pt-BR')}</td><td style="padding: 4px; text-align: center;">${item.percentual_conclusao}%</td></tr>`).join('')}</tbody>
            </table>
          </div>
        ` : ''}
      </div>
    ` : '';

    const empresasHtml = empresas?.length ? `
      <div class="section" style="margin-top: 20px;">
        <div class="section-title">EMPRESAS LICITADAS E PAGAMENTOS</div>
        ${empresas.map(emp => `
          <div style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <div><strong>${emp.nome_empresa}</strong><br><span style="font-size: 10px; color: #666;">CNPJ: ${emp.cnpj} | Empenho: ${emp.numero_empenho}</span></div>
              <div style="text-align: right;"><strong style="color: #1a365d;">${formatCurrency(emp.pagamentos?.reduce((sum, p) => sum + Number(p.valor), 0) || 0)}</strong></div>
            </div>
            ${emp.pagamentos?.length ? `
              <table style="width: 100%; font-size: 10px; border-collapse: collapse;">
                <thead><tr style="background: #e2e8f0;"><th style="padding: 4px; text-align: left;">Data</th><th style="padding: 4px; text-align: right;">Valor</th><th style="padding: 4px; text-align: left;">Descrição</th></tr></thead>
                <tbody>${emp.pagamentos.map(pag => `<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 4px;">${new Date(pag.data_pagamento).toLocaleDateString('pt-BR')}</td><td style="padding: 4px; text-align: right;">${formatCurrency(Number(pag.valor))}</td><td style="padding: 4px;">${pag.descricao || '-'}</td></tr>`).join('')}</tbody>
              </table>
            ` : '<p style="font-size: 10px; color: #666;">Nenhum pagamento registrado</p>'}
          </div>
        `).join('')}
      </div>
    ` : '';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Emenda Nº ${emenda.numero}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; font-size: 11px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1a365d; padding-bottom: 15px; }
          .header h1 { color: #1a365d; font-size: 18px; margin-bottom: 5px; }
          .header p { color: #666; font-size: 10px; }
          .status { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-top: 8px; }
          .status-pendente { background: #fef3c7; color: #92400e; }
          .status-aprovado { background: #d1fae5; color: #065f46; }
          .status-em_execucao { background: #dbeafe; color: #1e40af; }
          .status-concluido { background: #d1fae5; color: #065f46; }
          .status-cancelado { background: #fee2e2; color: #991b1b; }
          .section { margin-bottom: 15px; }
          .section-title { font-size: 12px; font-weight: bold; color: #1a365d; margin-bottom: 8px; padding-bottom: 3px; border-bottom: 1px solid #e2e8f0; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .field { margin-bottom: 6px; }
          .field-label { font-size: 9px; color: #666; text-transform: uppercase; }
          .field-value { font-size: 11px; font-weight: 500; }
          .valores-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; }
          .valor-box { background: #f8fafc; padding: 10px; border-radius: 6px; text-align: center; border: 1px solid #e2e8f0; }
          .valor-label { font-size: 9px; color: #666; }
          .valor-number { font-size: 14px; font-weight: bold; color: #1a365d; }
          .progress-container { margin: 15px 0; }
          .progress-bar { height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; }
          .progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); border-radius: 6px; }
          .progress-text { display: flex; justify-content: space-between; font-size: 10px; margin-top: 5px; color: #666; }
          .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #666; text-align: center; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FICHA DE EMENDA PARLAMENTAR</h1>
          <p>Emenda Nº ${emenda.numero}</p>
          <span class="status status-${emenda.status}">${emenda.status.replace('_', ' ').toUpperCase()}</span>
        </div>

        <div class="section">
          <div class="section-title">OBJETO</div>
          <p>${emenda.objeto}</p>
        </div>

        <div class="valores-grid">
          <div class="valor-box"><div class="valor-label">VALOR CONCEDENTE</div><div class="valor-number">${formatCurrency(valor)}</div></div>
          <div class="valor-box"><div class="valor-label">CONTRAPARTIDA</div><div class="valor-number">${formatCurrency(contrapartida)}</div></div>
          <div class="valor-box"><div class="valor-label">VALOR TOTAL</div><div class="valor-number">${formatCurrency(valorTotal)}</div></div>
          <div class="valor-box"><div class="valor-label">EXECUTADO</div><div class="valor-number">${formatCurrency(valorExecutado)}</div></div>
        </div>

        <div class="progress-container">
          <div class="progress-bar"><div class="progress-fill" style="width: ${progressPercent}%"></div></div>
          <div class="progress-text"><span>Execução: ${progressPercent.toFixed(1)}%</span><span>Restante: ${formatCurrency(valorTotal - valorExecutado)}</span></div>
        </div>

        <div class="grid">
          <div class="section">
            <div class="section-title">CONCEDENTE</div>
            <div class="field"><div class="field-label">Tipo</div><div class="field-value">${tipoConcedenteLabels[emenda.tipo_concedente]}</div></div>
            <div class="field"><div class="field-label">Nome</div><div class="field-value">${emenda.nome_concedente || '-'}</div></div>
          </div>
          <div class="section">
            <div class="section-title">RECEBEDOR</div>
            <div class="field"><div class="field-label">Tipo</div><div class="field-value">${tipoRecebedorLabels[emenda.tipo_recebedor]}</div></div>
            <div class="field"><div class="field-label">Nome</div><div class="field-value">${emenda.nome_recebedor}</div></div>
            <div class="field"><div class="field-label">CNPJ</div><div class="field-value">${emenda.cnpj_recebedor}</div></div>
          </div>
          <div class="section">
            <div class="section-title">LOCALIZAÇÃO E GESTÃO</div>
            <div class="field"><div class="field-label">Município/Estado</div><div class="field-value">${emenda.municipio}/${emenda.estado}</div></div>
            <div class="field"><div class="field-label">Gestor Responsável</div><div class="field-value">${emenda.gestor_responsavel}</div></div>
            <div class="field"><div class="field-label">Data Disponibilização</div><div class="field-value">${formatDate(emenda.data_disponibilizacao)}</div></div>
          </div>
          <div class="section">
            <div class="section-title">DADOS FINANCEIROS</div>
            <div class="field"><div class="field-label">Grupo Natureza Despesa</div><div class="field-value">${emenda.grupo_natureza_despesa}</div></div>
            <div class="field"><div class="field-label">Banco</div><div class="field-value">${emenda.banco || '-'}</div></div>
            <div class="field"><div class="field-label">Conta Corrente</div><div class="field-value">${emenda.conta_corrente || '-'}</div></div>
          </div>
        </div>

        ${planoTrabalhoHtml}
        ${empresasHtml}

        <div class="footer">
          <p><strong>Conformidade:</strong> Esta emenda está registrada em conformidade com o Art. 2º, §1º da Recomendação MPC-MG nº 01/2025</p>
          <p style="margin-top: 5px;">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!emenda) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg font-medium text-muted-foreground">Emenda não encontrada</p>
        <Button asChild className="mt-4">
          <Link to="/emendas">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  const valor = Number(emenda.valor);
  const valorExecutado = Number(emenda.valor_executado);
  const contrapartida = Number(emenda.contrapartida || 0);
  const valorTotal = valor + contrapartida;
  const progressPercent = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Back button and actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/emendas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExportPDF()}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button size="sm" onClick={() => setEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Emenda
          </Button>
          
          {/* Delete Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir Emenda</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir a emenda Nº {emenda.numero}? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deleteEmenda.isPending}
                >
                  {deleteEmenda.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Edit Dialog */}
      {emenda && (
        <EditEmendaDialog
          emenda={emenda}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {/* Título e Status */}
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
          </div>
        </div>

        {/* Objeto - em linha separada */}
        <div className="mt-4">
          <p className="text-muted-foreground break-words whitespace-normal overflow-hidden">{emenda.objeto}</p>
        </div>

        {/* Valores - grid responsivo */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Valor Concedente</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(valor)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Contrapartida</p>
            <p className="text-lg font-semibold text-warning">
              {formatCurrency(contrapartida)}
            </p>
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <p className="text-xs text-muted-foreground">Valor Total</p>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(valorTotal)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Executado</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(valorExecutado)}
            </p>
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
        <PlanoTrabalhoSection emendaId={emenda.id} />
      </div>

      {/* Empresas Licitadas */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <EmpresasLicitacaoSection emendaId={emenda.id} />
      </div>

      {/* Compliance notice */}
      <div className="rounded-xl border border-info/30 bg-info/5 p-4 text-sm">
        <p className="text-muted-foreground">
          <strong className="text-info">Conformidade:</strong> Esta emenda está registrada em 
          conformidade com o Art. 2º, §1º da Recomendação MPC-MG nº 01/2025, contendo todas as 
          informações obrigatórias para transparência e rastreabilidade.
        </p>
      </div>
    </div>
  );
};

export default EmendaDetail;
