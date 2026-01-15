import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  User,
  MapPin,
  CreditCard,
  Edit,
  Download,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { useEmenda } from '@/hooks/useEmendas';
import PlanoTrabalhoSection from '@/components/plano-trabalho/PlanoTrabalhoSection';

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
  const { data: emenda, isLoading } = useEmenda(id || '');

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
  const progressPercent = valor > 0 ? (valorExecutado / valor) * 100 : 0;

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
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground">
                  Emenda Nº {emenda.numero}
                </h1>
                <StatusBadge status={emenda.status} />
              </div>
              <p className="mt-2 text-muted-foreground">{emenda.objeto}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(valor)}
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
              Restante: {formatCurrency(valor - valorExecutado)}
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
