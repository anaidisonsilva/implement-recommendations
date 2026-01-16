import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  trend?: {
    value: number;
    label: string;
  };
}

const variantStyles = {
  default: 'bg-card border-border',
  primary: 'bg-primary/5 border-primary/20',
  success: 'bg-accent/5 border-accent/20',
  warning: 'bg-warning/5 border-warning/20',
  info: 'bg-info/5 border-info/20',
};

const iconVariantStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-accent/10 text-accent',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
};

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
}: StatsCardProps) => {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md min-w-0',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-lg font-bold text-foreground truncate" title={String(value)}>{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 pt-1">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.value >= 0 ? 'text-accent' : 'text-destructive'
                )}
              >
                {trend.value >= 0 ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
            iconVariantStyles[variant]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
