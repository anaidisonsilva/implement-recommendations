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
  Scale,
  Eye,
  Lock,
  Landmark,
  TrendingUp,
  Award,
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
  PieChart,
  Pie,
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
      title: 'Gestão Completa',
      description: 'Cadastro e acompanhamento detalhado de todas as emendas parlamentares.',
    },
    {
      icon: Shield,
      title: 'Conformidade Legal',
      description: 'Adequação à Recomendação MPC-MG nº 01/2025 e ADPF 854/DF.',
    },
    {
      icon: BarChart3,
      title: 'Dashboards Inteligentes',
      description: 'Visualização em tempo real com indicadores e gráficos.',
    },
    {
      icon: Globe,
      title: 'Transparência Pública',
      description: 'Portal de acesso cidadão integrado ao sistema.',
    },
    {
      icon: Users,
      title: 'Multiusuário',
      description: 'Gestão de permissões e acessos por município.',
    },
    {
      icon: Lock,
      title: 'Segurança',
      description: 'Dados protegidos com criptografia e auditoria.',
    },
  ];

  const complianceItems = [
    { text: 'Recomendação MPC-MG nº 01/2025', icon: Scale },
    { text: 'ADPF 854/DF - STF', icon: Landmark },
    { text: 'Lei Complementar 210/2024', icon: FileText },
    { text: 'Lei de Acesso à Informação', icon: Eye },
  ];

  const COLORS = ['hsl(215, 65%, 35%)', 'hsl(155, 60%, 40%)', 'hsl(200, 85%, 50%)', 'hsl(45, 90%, 55%)', 'hsl(280, 50%, 50%)'];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b border-border bg-primary">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-primary-foreground/90">
            <Landmark className="h-4 w-4" />
            <span>Sistema Oficial de Gestão de Emendas Parlamentares</span>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <Link to="/transparencia" className="text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground">
              Transparência
            </Link>
            <Button size="sm" variant="secondary" asChild>
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                Acesso Restrito
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        {/* Decorative elements */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                <Award className="h-4 w-4" />
                Plataforma Oficial para Gestão Pública
              </div>
              
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Sistema de Gestão de
                <span className="mt-2 block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Emendas Parlamentares
                </span>
              </h1>
              
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Solução completa e segura para municípios gerenciarem emendas parlamentares 
                com total transparência e conformidade legal. Acompanhe valores, execução 
                e prestação de contas em tempo real.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild className="h-12 gap-2 px-8 text-base shadow-lg shadow-primary/20">
                  <Link to="/auth">
                    <Lock className="h-5 w-5" />
                    Área Restrita
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 gap-2 px-8 text-base">
                  <Link to="/transparencia">
                    <Eye className="h-5 w-5" />
                    Portal de Transparência
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 flex items-center gap-6 border-t border-border pt-8">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-foreground">Dados Seguros</div>
                    <div className="text-muted-foreground">Criptografia end-to-end</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-foreground">Conformidade</div>
                    <div className="text-muted-foreground">100% adequado</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Stats Card */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 blur-2xl" />
              <Card className="relative border-2 shadow-2xl">
                <CardHeader className="border-b border-border bg-muted/30 pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <TrendingUp className="h-5 w-5 text-primary-foreground" />
                    </div>
                    Municípios Atendidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-primary/5 p-4 text-center">
                      <div className="text-4xl font-bold text-primary">{activePrefeituras.length}</div>
                      <div className="mt-1 text-sm text-muted-foreground">Prefeituras</div>
                    </div>
                    <div className="rounded-xl bg-accent/5 p-4 text-center">
                      <div className="text-4xl font-bold text-accent">{chartData.length}</div>
                      <div className="mt-1 text-sm text-muted-foreground">Estados</div>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex h-48 items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  ) : chartData.length > 0 ? (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="quantidade"
                            nameKey="estado"
                          >
                            {chartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                            formatter={(value: number, name: string) => [`${value} prefeituras`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center text-muted-foreground">
                      Aguardando cadastros
                    </div>
                  )}
                  
                  {/* Legend */}
                  {chartData.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      {chartData.slice(0, 4).map((item, index) => (
                        <div key={item.estado} className="flex items-center gap-1.5">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-xs text-muted-foreground">{item.estado}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </header>

      {/* Compliance Section */}
      <section className="border-y border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Scale className="h-5 w-5 text-primary" />
              Em conformidade com:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              {complianceItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              <CheckCircle className="h-4 w-4" />
              Funcionalidades
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tudo que você precisa para
              <span className="block text-primary">gestão eficiente</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Sistema desenvolvido especialmente para atender às necessidades dos municípios brasileiros
            </p>
          </div>
          
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="group relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y-[-8px] rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
                <CardContent className="relative pt-8">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 transition-colors group-hover:from-primary/20">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Prefeituras Section */}
      {activePrefeituras.length > 0 && (
        <section className="border-t border-border bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Building2 className="h-4 w-4" />
                Rede de Municípios
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Prefeituras que confiam
                <span className="block text-primary">no nosso sistema</span>
              </h2>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {/* Chart */}
              <Card className="border-2">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Distribuição por Estado
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} className="text-xs" tickLine={false} axisLine={false} />
                        <YAxis dataKey="estado" type="category" className="text-xs" tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                          formatter={(value: number) => [`${value} prefeituras`, 'Quantidade']}
                        />
                        <Bar dataKey="quantidade" radius={[0, 6, 6, 0]} maxBarSize={40}>
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
              <Card className="border-2">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-primary" />
                    Municípios Atendidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="max-h-72 space-y-3 overflow-y-auto pr-2">
                    {activePrefeituras.map((prefeitura) => (
                      <Link
                        key={prefeitura.id}
                        to={`/p/${prefeitura.slug}`}
                        className="group flex items-center justify-between rounded-xl border-2 border-transparent bg-muted/50 p-4 transition-all hover:border-primary/20 hover:bg-muted"
                      >
                        <div className="flex items-center gap-4">
                          {prefeitura.logo_url ? (
                            <img
                              src={prefeitura.logo_url}
                              alt={prefeitura.nome}
                              className="h-12 w-12 rounded-xl object-cover shadow-sm"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-sm">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-foreground transition-colors group-hover:text-primary">
                              {prefeitura.nome}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {prefeitura.municipio}/{prefeitura.estado}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-primary py-20">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm font-medium text-primary-foreground">
            <Shield className="h-4 w-4" />
            Acesso Seguro
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
            Acesse o Sistema
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            Faça login na área restrita para gerenciar as emendas do seu município 
            ou acesse o portal de transparência para consulta pública.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild className="h-12 gap-2 px-8 text-base shadow-lg">
              <Link to="/auth">
                <LogIn className="h-5 w-5" />
                Acessar Área Restrita
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="h-12 gap-2 border-2 border-primary-foreground/30 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/transparencia">
                <Globe className="h-5 w-5" />
                Portal de Transparência
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Landmark className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">Sistema de Emendas</span>
            </div>
            <div className="max-w-2xl text-sm text-muted-foreground">
              Sistema desenvolvido em conformidade com a Recomendação MPC-MG nº 01/2025, 
              ADPF 854/DF do Supremo Tribunal Federal e Lei Complementar 210/2024.
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link to="/transparencia" className="transition-colors hover:text-foreground">
                Transparência
              </Link>
              <span>•</span>
              <Link to="/auth" className="transition-colors hover:text-foreground">
                Área Restrita
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
