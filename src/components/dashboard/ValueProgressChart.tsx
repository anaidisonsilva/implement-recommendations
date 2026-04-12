import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DashboardStats } from '@/types/emenda';
import { useInView } from '@/hooks/useAnimations';
import { cn } from '@/lib/utils';

interface ValueProgressChartProps {
  stats: DashboardStats;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

const ValueProgressChart = ({ stats }: ValueProgressChartProps) => {
  const { ref, isInView } = useInView(0.1);
  const executado = stats.valorExecutado;
  const restante = stats.valorTotal - stats.valorExecutado;
  const percentual = stats.valorTotal > 0 ? (executado / stats.valorTotal) * 100 : 0;

  const data = [
    { name: 'Executado', value: executado },
    { name: 'A Executar', value: restante },
  ];

  const COLORS = ['hsl(155, 60%, 40%)', 'hsl(210, 15%, 88%)'];

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-border bg-card p-5 shadow-sm',
        'transform transition-all duration-600 ease-out',
        isInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      )}
    >
      <h3 className="mb-4 font-semibold text-foreground">Execução Orçamentária</h3>
      
      <div className="flex items-center gap-6">
        <div className="relative h-36 w-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={isInView}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">
              {percentual.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
              <span className="text-sm text-muted-foreground">Executado</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {formatCurrency(executado)}
            </p>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
              <span className="text-sm text-muted-foreground">A Executar</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {formatCurrency(restante)}
            </p>
          </div>

          <div className="pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total Empenhado</span>
            <p className="mt-1 text-lg font-bold text-primary">
              {formatCurrency(stats.valorTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValueProgressChart;
