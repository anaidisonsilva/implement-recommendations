import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Building2,
  Loader2,
  Eye,
  FileText,
  Handshake,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StatusBadge from '@/components/dashboard/StatusBadge';
import LastUpdatedBanner from '@/components/prefeitura/LastUpdatedBanner';
import { usePrefeituraBySlug } from '@/hooks/usePrefeituras';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const PrefeituraConvenios = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: prefeitura, isLoading: loadingPrefeitura, error } = usePrefeituraBySlug(slug ?? '');

  const { data: emendas, isLoading: loadingEmendas } = useQuery({
    queryKey: ['emendas', 'prefeitura', prefeitura?.id, 'convenios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emendas')
        .select('*')
        .eq('prefeitura_id', prefeitura!.id)
        .not('numero_convenio', 'is', null)
        .neq('numero_convenio', '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!prefeitura?.id,
  });

  const stats = useMemo(() => {
    if (!emendas || emendas.length === 0) return { total: 0, valorTotal: 0, executado: 0 };
    const emendasComValor = emendas.filter(e => e.status !== 'pendente' && e.status !== 'cancelado');
    return {
      total: emendas.length,
      valorTotal: emendasComValor.reduce((acc, e) => acc + Number(e.valor) + Number(e.contrapartida || 0), 0),
      executado: emendasComValor.reduce((acc, e) => acc + Number(e.valor_executado), 0),
    };
  }, [emendas]);

  if (loadingPrefeitura) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !prefeitura) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Prefeitura não encontrada</h1>
        <Button asChild className="mt-6">
          <Link to="/">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {prefeitura.logo_url ? (
                <img
                  src={prefeitura.logo_url}
                  alt={prefeitura.nome}
                  className="h-12 w-12 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-foreground">{prefeitura.nome}</h1>
                <p className="text-sm text-muted-foreground">
                  Portal de Transparência • Convênios
                </p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to={`/p/${slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Portal
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <LastUpdatedBanner emendas={emendas} />

        {/* Stats */}
        <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Total de Convênios</p>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-lg font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Valor Total</p>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-lg font-bold text-foreground">{formatCurrency(stats.valorTotal)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Valor Executado</p>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-lg font-bold text-foreground">{formatCurrency(stats.executado)}</p>
          </div>
        </div>

        {/* Table */}
        {loadingEmendas ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : emendas && emendas.length > 0 ? (
          <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Convênio</TableHead>
                  <TableHead>Nº Emenda</TableHead>
                  <TableHead>Objeto</TableHead>
                  <TableHead>Concedente</TableHead>
                  <TableHead>Parlamentar</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emendas.map((emenda) => (
                  <TableRow key={emenda.id}>
                    <TableCell className="font-medium">{emenda.numero_convenio}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-foreground border border-border">
                          {emenda.programa ? '📋 Programa' : '📄 Emenda'} Nº {emenda.numero || '-'}
                        </span>
                        {emenda.especial && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
                            <Zap className="h-3 w-3" /> PIX
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{emenda.objeto}</TableCell>
                    <TableCell>{emenda.nome_concedente}</TableCell>
                    <TableCell>{emenda.nome_parlamentar || '-'}</TableCell>
                    <TableCell>{formatCurrency(Number(emenda.valor))}</TableCell>
                    <TableCell>
                      <StatusBadge status={emenda.status as any} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/p/${slug}/emenda/${emenda.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <Handshake className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              Nenhum convênio cadastrado
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Emendas com número de convênio aparecerão aqui
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PrefeituraConvenios;
