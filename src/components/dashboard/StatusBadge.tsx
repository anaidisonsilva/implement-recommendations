import { cn } from '@/lib/utils';
import { StatusEmenda } from '@/types/emenda';

interface StatusBadgeProps {
  status: StatusEmenda;
  size?: 'sm' | 'md';
}

const statusConfig: Record<StatusEmenda, { label: string; className: string }> = {
  pendente: {
    label: 'Pendente',
    className: 'bg-status-pendente/15 text-status-pendente border-status-pendente/30',
  },
  aprovado: {
    label: 'Aprovado',
    className: 'bg-status-aprovado/15 text-status-aprovado border-status-aprovado/30',
  },
  em_execucao: {
    label: 'Em Execução',
    className: 'bg-status-execucao/15 text-status-execucao border-status-execucao/30',
  },
  concluido: {
    label: 'Concluído',
    className: 'bg-status-concluido/15 text-status-concluido border-status-concluido/30',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-status-cancelado/15 text-status-cancelado border-status-cancelado/30',
  },
};

const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      <span
        className={cn(
          'mr-1.5 h-1.5 w-1.5 rounded-full',
          status === 'pendente' && 'bg-status-pendente',
          status === 'aprovado' && 'bg-status-aprovado',
          status === 'em_execucao' && 'bg-status-execucao',
          status === 'concluido' && 'bg-status-concluido',
          status === 'cancelado' && 'bg-status-cancelado'
        )}
      />
      {config.label}
    </span>
  );
};

export default StatusBadge;
