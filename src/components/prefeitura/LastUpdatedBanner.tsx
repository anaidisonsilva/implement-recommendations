import { Clock } from 'lucide-react';

interface LastUpdatedBannerProps {
  emendas: { updated_at: string }[] | null | undefined;
}

const LastUpdatedBanner = ({ emendas }: LastUpdatedBannerProps) => {
  if (!emendas || emendas.length === 0) return null;

  const lastUpdate = emendas.reduce((latest, e) => {
    const d = new Date(e.updated_at);
    return d > latest ? d : latest;
  }, new Date(0));

  return (
    <div className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
      <Clock className="h-4 w-4 text-primary" />
      <span>
        Última atualização dos dados:{' '}
        <strong className="text-foreground">
          {lastUpdate.toLocaleDateString('pt-BR')} às{' '}
          {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </strong>
      </span>
    </div>
  );
};

export default LastUpdatedBanner;
