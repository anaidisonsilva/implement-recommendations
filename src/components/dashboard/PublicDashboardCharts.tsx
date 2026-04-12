import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useInView } from '@/hooks/useAnimations';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalEmendas: number;
  valorTotal: number;
  valorConcedente: number;
  valorContrapartida: number;
  valorExecutado: number;
  emendasPendentes: number;
  emendasAprovadas: number;
  emendasEmExecucao: number;
  emendasConcluidas: number;
}

interface PublicDashboardChartsProps {
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

const PublicDashboardCharts = ({ stats }: PublicDashboardChartsProps) => {
  const { ref: pieRef, isInView: pieInView } = useInView(0.1);
  const { ref: barRef, isInView: barInView } = useInView(0.1);

  const executado = stats.valorExecutado;
  const restante = stats.valorTotal - stats.valorExecutado;
  const percentual = stats.valorTotal > 0 ? (executado / stats.valorTotal) * 100 : 0;

  const pieData = [
    { name: 'Executado', value: executado },
    { name: 'A Executar', value: restante },
  ];

  const barData = [
    { name: 'Pendentes', quantidade: stats.emendasPendentes, fill: 'hsl(45, 90%, 50%)' },
    { name: 'Aprovadas', quantidade: stats.emendasAprovadas, fill: 'hsl(155, 60%, 40%)' },
    { name: 'Em Execução', quantidade: stats.emendasEmExecucao, fill: 'hsl(200, 85%, 45%)' },
    { name: 'Concluídas', quantidade: stats.emendasConcluidas, fill: 'hsl(155, 70%, 30%)' },
  ];

  const PIE_COLORS = ['hsl(155, 60%, 40%)', 'hsl(210, 15%, 88%)'];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div
        ref={pieRef}
        className={cn(
          'rounded-xl border border-border bg-card p-5 shadow-sm',
          'transform transition-all duration-600 ease-out',
          pieInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        )}
      >
        <h3 className="mb-4 font-semibold text-foreground">Execução Orçamentária</h3>
        
        <div className="flex items-center gap-6">
          <div className="relative h-36 w-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                  isAnimationActive={pieInView}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
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
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[0] }} />
                <span className="text-sm text-muted-foreground">Executado</span>
              </div>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(executado)}
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[1] }} />
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

      <div
        ref={barRef}
        className={cn(
          'rounded-xl border border-border bg-card p-5 shadow-sm',
          'transform transition-all duration-600 ease-out',
          barInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        )}
        style={{ transitionDelay: '100ms' }}
      >
        <h3 className="mb-4 font-semibold text-foreground">Distribuição por Status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar
                dataKey="quantidade"
                radius={[0, 4, 4, 0]}
                fill="hsl(var(--primary))"
                isAnimationActive={barInView}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PublicDashboardCharts;
