import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DashboardStats } from '@/types/emenda';

interface ExecutionChartProps {
  stats: DashboardStats;
}

const ExecutionChart = ({ stats }: ExecutionChartProps) => {
  const data = [
    { name: 'Pendentes', quantidade: stats.emendasPendentes, fill: 'hsl(45, 90%, 50%)' },
    { name: 'Aprovadas', quantidade: stats.emendasAprovadas, fill: 'hsl(155, 60%, 40%)' },
    { name: 'Em Execução', quantidade: stats.emendasEmExecucao, fill: 'hsl(200, 85%, 45%)' },
    { name: 'Concluídas', quantidade: stats.emendasConcluidas, fill: 'hsl(155, 70%, 30%)' },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-foreground">Distribuição por Status</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
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
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExecutionChart;
