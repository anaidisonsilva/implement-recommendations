import { Link } from 'react-router-dom';
import { usePrefeituras } from '@/hooks/usePrefeituras';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  Shield,
  FileText,
  BarChart3,
  LogIn,
  CheckCircle,
  Users,
  Globe,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const LandingPage = () => {
  const { data: prefeituras, isLoading } = usePrefeituras();

  const activePrefeituras = prefeituras?.filter(p => p.ativo) || [];

  // Prepare chart data - group by estado
  const chartData = activePrefeituras.reduce((acc, prefeitura) => {
    const estado = prefeitura.estado || 'Outros';
    const existing = acc.find(item => item.estado === estado);
    if (existing) {
      existing.quantidade += 1;
    } else {
      acc.push({ estado, quantidade: 1 });
    }
    return acc;
  }, [] as { estado: string; quantidade: number }[]).sort((a, b) => b.quantidade - a.quantidade);

  const features = [
    {
      icon: FileText,
      title: 'Gestão Completa de Emendas',
      description: 'Cadastro, acompanhamento e controle de emendas parlamentares com todos os detalhes necessários.',
    },
    {
      icon: Shield,
      title: 'Conformidade Legal',
      description: 'Atende aos requisitos da Recomendação MPC-MG nº 01/2025, ADPF 854/DF e Lei Complementar 210/2024.',
    },
    {
      icon: BarChart3,
      title: 'Relatórios e Dashboards',
      description: 'Visualização em tempo real do andamento das emendas com gráficos e indicadores.',
    },
    {
      icon: Globe,
      title: 'Portal de Transparência',
      description: 'Portal público para consulta cidadã com acesso às informações de emendas.',
    },
    {
      icon: Users,
      title: 'Multi-Prefeituras',
      description: 'Gestão centralizada com acesso individualizado para cada município.',
    },
    {
      icon: CheckCircle,
      title: 'Plano de Trabalho',
      description: 'Gerenciamento de cronogramas, documentos e acompanhamento de execução.',
    },
  ];

  const COLORS = ['hsl(215, 65%, 25%)', 'hsl(155, 60%, 35%)', 'hsl(200, 85%, 45%)', 'hsl(45, 90%, 50%)', 'hsl(280, 60%, 45%)'];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" />
              Sistema de Gestão de Emendas Parlamentares
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Gestão de Emendas
              <span className="block text-primary">para Municípios</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Sistema completo para gestão e transparência de emendas parlamentares. 
              Atenda aos requisitos legais e ofereça acesso público às informações de forma simples e eficiente.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link to="/auth">
                  <LogIn className="h-5 w-5" />
                  Área Restrita
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2">
                <Link to="/transparencia">
                  <Globe className="h-5 w-5" />
                  Portal de Transparência
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="border-b border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{activePrefeituras.length}</div>
              <div className="mt-1 text-muted-foreground">Prefeituras Cadastradas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent">{chartData.length}</div>
              <div className="mt-1 text-muted-foreground">Estados Atendidos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-info">100%</div>
              <div className="mt-1 text-muted-foreground">Conformidade Legal</div>
            </div>
          </div>
        </div>
      </section>

      {/* Prefeituras Chart Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground">Prefeituras que Utilizam o Sistema</h2>
            <p className="mt-3 text-muted-foreground">
              Municípios que confiam em nossa solução para gestão de emendas parlamentares
            </p>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : activePrefeituras.length > 0 ? (
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Distribuição por Estado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" allowDecimals={false} className="text-xs" />
                        <YAxis dataKey="estado" type="category" className="text-xs" width={50} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Bar dataKey="quantidade" name="Prefeituras" radius={[0, 4, 4, 0]}>
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Prefeituras List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Municípios Atendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
                    {activePrefeituras.map((prefeitura) => (
                      <div
                        key={prefeitura.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {prefeitura.logo_url ? (
                            <img
                              src={prefeitura.logo_url}
                              alt={prefeitura.nome}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-foreground">{prefeitura.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              {prefeitura.municipio}/{prefeitura.estado}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/p/${prefeitura.slug}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="mx-auto max-w-md">
              <CardContent className="py-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  Nenhuma prefeitura cadastrada ainda.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground">Funcionalidades do Sistema</h2>
            <p className="mt-3 text-muted-foreground">
              Tudo o que você precisa para gerenciar emendas parlamentares
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-foreground">
            Pronto para começar?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
            Acesse a área restrita para gerenciar as emendas do seu município ou consulte o portal de transparência.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild className="gap-2">
              <Link to="/auth">
                <LogIn className="h-5 w-5" />
                Acessar Área Restrita
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="gap-2 border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/transparencia">
                <Globe className="h-5 w-5" />
                Ver Transparência
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            Sistema de Gestão de Emendas Parlamentares
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Em conformidade com a Recomendação MPC-MG nº 01/2025, ADPF 854/DF e Lei Complementar 210/2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
