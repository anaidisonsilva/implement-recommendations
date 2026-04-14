import { Link, useParams, useNavigate } from 'react-router-dom';
import PortalBreadcrumb from '@/components/prefeitura/PortalBreadcrumb';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePrefeituraBySlug } from '@/hooks/usePrefeituras';
import DadosAbertosSection from '@/components/dados-abertos/DadosAbertosSection';
import { Button } from '@/components/ui/button';
import { Loader2, Building2, ArrowLeft, BarChart3, Zap } from 'lucide-react';
import LastUpdatedBanner from '@/components/prefeitura/LastUpdatedBanner';

const PrefeturaDadosAbertos = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { data: prefeitura, isLoading: loadingPrefeitura, error } = usePrefeituraBySlug(slug ?? '');

  const { data: emendas, isLoading: loadingEmendas } = useQuery({
    queryKey: ['emendas', 'prefeitura', prefeitura?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emendas')
        .select('*')
        .eq('prefeitura_id', prefeitura!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!prefeitura?.id,
  });

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

  const mappedEmendas = (emendas || []).map((e) => ({
    id: e.id,
    numero: e.numero,
    objeto: e.objeto,
    nome_concedente: e.nome_concedente,
    nome_parlamentar: e.nome_parlamentar,
    nome_recebedor: e.nome_recebedor,
    cnpj_recebedor: e.cnpj_recebedor,
    municipio: e.municipio,
    estado: e.estado,
    valor: Number(e.valor),
    valor_executado: Number(e.valor_executado),
    valor_repassado: Number(e.valor_repassado),
    valor_empenhado: Number((e as any).valor_empenhado || 0),
    valor_liquidado: Number((e as any).valor_liquidado || 0),
    valor_pago: Number((e as any).valor_pago || 0),
    contrapartida: e.contrapartida ? Number(e.contrapartida) : null,
    status: e.status,
    data_disponibilizacao: e.data_disponibilizacao,
    programa: e.programa,
    especial: e.especial,
    esfera: e.esfera || 'federal',
    tipo_concedente: e.tipo_concedente,
    tipo_recebedor: e.tipo_recebedor,
    grupo_natureza_despesa: e.grupo_natureza_despesa,
    funcao_governo: (e as any).funcao_governo,
    data_inicio_vigencia: e.data_inicio_vigencia,
    data_fim_vigencia: e.data_fim_vigencia,
    numero_convenio: e.numero_convenio,
    numero_proposta: e.numero_proposta,
    numero_plano_acao: e.numero_plano_acao,
    gestor_responsavel: e.gestor_responsavel,
    banco: e.banco,
    conta_corrente: e.conta_corrente,
    anuencia_previa_sus: e.anuencia_previa_sus,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {prefeitura.logo_url ? (
                <img src={prefeitura.logo_url} alt={prefeitura.nome} className="h-12 w-12 rounded-lg object-contain" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-foreground">{prefeitura.nome}</h1>
                <p className="text-sm text-muted-foreground">Dados Abertos • Emendas Parlamentares</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/p/${slug}/pix`}>
                  <Zap className="mr-2 h-4 w-4" />
                  Dashboard PIX
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/p/${slug}/relatorios`}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Relatórios
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PortalBreadcrumb slug={slug!} items={[{ label: 'Dados Abertos' }]} />
        <LastUpdatedBanner emendas={emendas} />
        {loadingEmendas ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DadosAbertosSection emendas={mappedEmendas} prefeituraName={prefeitura.nome} />
        )}
      </main>
    </div>
  );
};

export default PrefeturaDadosAbertos;
