import { Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LastUpdatedBannerProps {
  emendas: { updated_at: string }[] | null | undefined;
  esferaFilter?: 'todos' | 'federal' | 'estadual';
  onEsferaChange?: (value: 'todos' | 'federal' | 'estadual') => void;
}

const LastUpdatedBanner = ({ emendas, esferaFilter = 'todos', onEsferaChange }: LastUpdatedBannerProps) => {
  if (!emendas || emendas.length === 0) return null;

  const lastUpdate = emendas.reduce((latest, e) => {
    const d = new Date(e.updated_at);
    return d > latest ? d : latest;
  }, new Date(0));

  return (
    <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        <span>
          Última atualização dos dados:{' '}
          <strong className="text-foreground">
            {lastUpdate.toLocaleDateString('pt-BR')} às{' '}
            {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </strong>
        </span>
      </div>
      {onEsferaChange && (
        <Select value={esferaFilter} onValueChange={onEsferaChange}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue placeholder="Esfera" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as Esferas</SelectItem>
            <SelectItem value="federal">Federal</SelectItem>
            <SelectItem value="estadual">Estadual</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default LastUpdatedBanner;
