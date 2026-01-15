import { Link } from 'react-router-dom';
import { ArrowRight, Building2, User } from 'lucide-react';
import { EmendaDB } from '@/hooks/useEmendas';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/button';

interface RecentEmendasProps {
  emendas: EmendaDB[];
  basePath?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const RecentEmendas = ({ emendas, basePath = '' }: RecentEmendasProps) => {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-semibold text-foreground">Emendas Recentes</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link to={`${basePath}/emendas`} className="text-primary hover:text-primary/80">
            Ver todas
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="divide-y divide-border">
        {emendas.slice(0, 5).map((emenda) => (
          <Link
            key={emenda.id}
            to={`${basePath}/emendas/${emenda.id}`}
            className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground line-clamp-1">
                    {emenda.objeto}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Nº {emenda.numero} • {emenda.municipio}
                  </p>
                </div>
                <StatusBadge status={emenda.status} size="sm" />
              </div>

              <div className="mt-2 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span>{emenda.nome_concedente || emenda.nome_parlamentar || '-'}</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatCurrency(Number(emenda.valor) + Number(emenda.contrapartida || 0))}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentEmendas;
