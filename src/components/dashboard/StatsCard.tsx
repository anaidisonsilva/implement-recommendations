import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useInView, useAnimatedCounter } from '@/hooks/useAnimations';

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
  index?: number;
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
  index = 0,
}: StatsCardProps) => {
  const { ref, isInView } = useInView(0.1);
  
  // Check if value is a currency string
  const numericValue = typeof value === 'number' ? value : 
    typeof value === 'string' && value.startsWith('R$') ? 
      parseFloat(value.replace(/[R$\s.]/g, '').replace(',', '.')) : null;

  const isCurrency = typeof value === 'string' && value.startsWith('R$');
  const isNumber = typeof value === 'number';
  
  const { count, start } = useAnimatedCounter(
    numericValue ?? 0,
    1200
  );

  useEffect(() => {
    if (isInView && numericValue !== null) start();
  }, [isInView, start, numericValue]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const displayValue = numericValue !== null && isInView
    ? (isCurrency ? formatCurrency(count) : isNumber ? Math.round(count) : value)
    : value;

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border p-4 shadow-sm min-w-0',
        'transform transition-all duration-500 ease-out',
        'hover:shadow-md hover:scale-[1.02]',
        isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        variantStyles[variant]
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-lg font-bold text-foreground truncate" title={String(value)}>
            {displayValue}
          </p>
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
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-transform duration-300',
            isInView ? 'scale-100' : 'scale-0',
            iconVariantStyles[variant]
          )}
          style={{ transitionDelay: `${index * 80 + 200}ms` }}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
