import { Link } from 'react-router-dom';
import { Building2, Calendar, MapPin, User, Banknote } from 'lucide-react';
import { EmendaDB } from '@/hooks/useEmendas';
import StatusBadge from '@/components/dashboard/StatusBadge';
import { Progress } from '@/components/ui/progress';

interface EmendaCardProps {
  emenda: EmendaDB;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const EmendaCard = ({ emenda }: EmendaCardProps) => {
  const valor = Number(emenda.valor);
  const valorExecutado = Number(emenda.valor_executado);
  const progressPercent = valor > 0 ? (valorExecutado / valor) * 100 : 0;

  return (
    <Link
      to={`/emendas/${emenda.id}`}
      className="block rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground line-clamp-2 break-words">
              {emenda.objeto}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Emenda Nº {emenda.numero}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <StatusBadge status={emenda.status} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="truncate">{emenda.nome_concedente}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{emenda.municipio}/{emenda.estado}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(emenda.data_disponibilizacao)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Banknote className="h-4 w-4" />
          <span className="font-medium text-foreground">{formatCurrency(valor)}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Execução</span>
          <span className="font-medium text-foreground">
            {progressPercent.toFixed(1)}%
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Executado: {formatCurrency(valorExecutado)}</span>
          <span>Total: {formatCurrency(valor)}</span>
        </div>
      </div>
    </Link>
  );
};

export default EmendaCard;
