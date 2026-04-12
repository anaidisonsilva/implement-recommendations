import { Skeleton } from '@/components/ui/skeleton';

export const StatsCardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-4 animate-fade-in">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
  </div>
);

export const StatsGridSkeleton = ({ count = 10 }: { count?: number }) => (
  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
    {Array.from({ length: count }).map((_, i) => (
      <StatsCardSkeleton key={i} />
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-fade-in">
    <Skeleton className="h-5 w-40 mb-4" />
    <div className="flex items-center gap-6">
      <Skeleton className="h-36 w-36 rounded-full" />
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-2 pt-2 border-t border-border">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
    </div>
  </div>
);

export const BarChartSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-fade-in">
    <Skeleton className="h-5 w-44 mb-4" />
    <div className="h-64 flex flex-col justify-center gap-4 px-4">
      {[75, 55, 85, 40].map((w, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 rounded" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  </div>
);

export const ChartsGridSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2">
    <ChartSkeleton />
    <BarChartSkeleton />
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="border-b border-border">
    <td className="p-3"><Skeleton className="h-4 w-20" /></td>
    <td className="p-3"><Skeleton className="h-4 w-48" /></td>
    <td className="p-3"><Skeleton className="h-4 w-28" /></td>
    <td className="p-3"><Skeleton className="h-4 w-24" /></td>
    <td className="p-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
    <td className="p-3 text-center"><Skeleton className="h-8 w-8 rounded mx-auto" /></td>
  </tr>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="rounded-xl border border-border bg-card animate-fade-in">
    <table className="w-full">
      <thead>
        <tr className="border-b border-border">
          {['Número', 'Objeto', 'Concedente', 'Valor', 'Status', 'Ações'].map((h) => (
            <th key={h} className="p-3 text-left text-xs font-medium text-muted-foreground">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </tbody>
    </table>
  </div>
);

export const EmendaCardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-sm animate-fade-in">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4 flex-1">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-28" />
      ))}
    </div>
    <div className="mt-4 space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-10" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  </div>
);

export const VigenciaCardsSkeleton = () => (
  <div className="space-y-4 animate-fade-in">
    <Skeleton className="h-6 w-48" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-8 w-12 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  </div>
);

export const PageHeaderSkeleton = () => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
    <div className="space-y-2">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-4 w-64" />
    </div>
    <Skeleton className="h-9 w-32 rounded-md" />
  </div>
);

export const PortalHeaderSkeleton = () => (
  <header className="border-b border-border bg-card animate-fade-in">
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  </header>
);

export const PortalStatsSkeleton = () => (
  <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="rounded-xl border border-border bg-card p-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
        <Skeleton className="h-6 w-20 mt-2" />
      </div>
    ))}
  </div>
);

export const FullDashboardSkeleton = () => (
  <div className="space-y-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton />
    <ChartsGridSkeleton />
    <VigenciaCardsSkeleton />
  </div>
);

export const FullPortalSkeleton = () => (
  <div className="min-h-screen bg-background">
    <PortalHeaderSkeleton />
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <PortalStatsSkeleton />
      <ChartsGridSkeleton />
      <VigenciaCardsSkeleton />
      <TableSkeleton />
    </main>
  </div>
);
