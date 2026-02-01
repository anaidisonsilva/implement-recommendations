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
  Zap,
  Clock,
  HeadphonesIcon,
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
      description: 'Controle total do ciclo de vida das emendas parlamentares, desde o cadastro até a prestação de contas.',
    },
    {
      icon: Shield,
      title: 'Conformidade Legal Garantida',
      description: 'Sistema 100% adequado às exigências legais vigentes, incluindo MPC-MG e ADPF 854/DF.',
    },
    {
      icon: BarChart3,
      title: 'Dashboards em Tempo Real',
      description: 'Painéis interativos com indicadores de desempenho e acompanhamento da execução orçamentária.',
    },
    {
      icon: Globe,
      title: 'Portal de Transparência',
      description: 'Acesso público integrado para consulta cidadã, promovendo accountability e controle social.',
    },
    {
      icon: Users,
      title: 'Gestão Multi-Prefeituras',
      description: 'Administração centralizada com isolamento de dados e permissões por município.',
    },
    {
      icon: Lock,
      title: 'Segurança de Nível Bancário',
      description: 'Infraestrutura segura com criptografia, backup automático e auditoria completa.',
    },
  ];

  const benefits = [
    { icon: Zap, title: 'Implantação Rápida', description: 'Sistema pronto para uso em poucos dias' },
    { icon: Clock, title: 'Suporte 24/7', description: 'Equipe técnica sempre disponível' },
    { icon: TrendingUp, title: 'Atualizações Constantes', description: 'Melhorias contínuas e novas funcionalidades' },
    { icon: HeadphonesIcon, title: 'Treinamento Incluído', description: 'Capacitação completa para sua equipe' },
  ];

  const complianceItems = [
    'Recomendação MPC-MG nº 01/2025',
    'ADPF 854/DF - STF',
    'Lei Complementar 210/2024',
    'Lei de Acesso à Informação',
  ];

  const COLORS = ['hsl(215, 65%, 35%)', 'hsl(155, 60%, 40%)', 'hsl(200, 85%, 50%)', 'hsl(45, 90%, 55%)', 'hsl(280, 50%, 50%)'];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <Landmark className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">Sistema de Emendas</span>
              <span className="ml-2 hidden rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary sm:inline">
                Gov
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/transparencia">
                <Eye className="mr-2 h-4 w-4" />
                Transparência
              </Link>
            </Button>
            <Button asChild className="shadow-lg shadow-primary/20">
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                Área Restrita
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent">
                <Award className="h-4 w-4" />
                Solução Oficial para Gestão Pública
              </div>
              
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Gestão Inteligente de
                <span className="relative mt-2 block">
                  <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                    Emendas Parlamentares
                  </span>
                  <svg className="absolute -bottom-2 left-0 h-3 w-full text-primary/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                </span>
              </h1>
              
              <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                Plataforma completa para municípios gerenciarem emendas parlamentares com 
                <strong className="text-foreground"> transparência</strong>, 
                <strong className="text-foreground"> eficiência</strong> e 
                <strong className="text-foreground"> conformidade legal</strong>.
              </p>

              {/* CTA */}
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Button size="lg" asChild className="h-14 gap-3 px-8 text-base shadow-2xl shadow-primary/30 transition-all hover:shadow-primary/40">
                  <Link to="/auth">
                    <Lock className="h-5 w-5" />
                    Acessar Sistema
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-14 gap-2 px-8 text-base">
                  <Link to="/transparencia">
                    <Globe className="h-5 w-5" />
                    Portal Público
                  </Link>
                </Button>
              </div>

              {/* Compliance Badges */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                {complianceItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-accent" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-2xl" />
              <Card className="relative overflow-hidden border-0 bg-card/80 shadow-2xl backdrop-blur">
                <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y-[-16px] rounded-full bg-primary/10 blur-2xl" />
                <CardHeader className="relative border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent pb-6">
                  <CardTitle className="flex items-center gap-4 text-xl">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                      <TrendingUp className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <span className="block text-foreground">Rede de Municípios</span>
                      <span className="text-sm font-normal text-muted-foreground">Prefeituras ativas no sistema</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative pt-6">
                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-5 text-center">
                      <div className="text-5xl font-bold text-primary">{activePrefeituras.length}</div>
                      <div className="mt-2 text-sm font-medium text-muted-foreground">Prefeituras</div>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 p-5 text-center">
                      <div className="text-5xl font-bold text-accent">{chartData.length}</div>
                      <div className="mt-2 text-sm font-medium text-muted-foreground">Estados</div>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex h-52 items-center justify-center">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  ) : chartData.length > 0 ? (
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={4}
                            dataKey="quantidade"
                            nameKey="estado"
                            strokeWidth={0}
                          >
                            {chartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '12px',
                              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                            }}
                            formatter={(value: number, name: string) => [`${value} prefeituras`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex h-52 flex-col items-center justify-center text-muted-foreground">
                      <Building2 className="mb-3 h-12 w-12 opacity-50" />
                      <span>Aguardando cadastros</span>
                    </div>
                  )}
                  
                  {chartData.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-4">
                      {chartData.slice(0, 4).map((item, index) => (
                        <div key={item.estado} className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-sm font-medium text-muted-foreground">{item.estado}</span>
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

      {/* Benefits Bar */}
      <section className="border-y border-border bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{benefit.title}</div>
                  <div className="text-sm text-muted-foreground">{benefit.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary">
              <Zap className="h-4 w-4" />
              Funcionalidades Completas
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Tudo que seu município precisa
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Sistema desenvolvido por especialistas em gestão pública para atender 
              todas as necessidades dos municípios brasileiros
            </p>
          </div>
          
          <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-0 bg-gradient-to-b from-muted/50 to-transparent shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <CardContent className="relative p-8">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                    <feature.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Prefeituras Section */}
      {activePrefeituras.length > 0 && (
        <section className="border-t border-border bg-gradient-to-b from-muted/30 to-background py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-5 py-2 text-sm font-semibold text-accent">
                <Building2 className="h-4 w-4" />
                Rede de Parceiros
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Municípios que confiam em nós
              </h2>
              <p className="mt-5 text-lg text-muted-foreground">
                Prefeituras de todo o Brasil utilizando nossa solução para gestão transparente de emendas
              </p>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-2">
              {/* Chart */}
              <Card className="overflow-hidden border-0 shadow-xl">
                <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/80 to-transparent">
                  <CardTitle className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    Distribuição por Estado
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} className="text-xs" />
                        <YAxis dataKey="estado" type="category" tickLine={false} axisLine={false} className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                          }}
                          formatter={(value: number) => [`${value} prefeituras`, 'Quantidade']}
                        />
                        <Bar dataKey="quantidade" radius={[0, 8, 8, 0]} maxBarSize={45}>
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
              <Card className="overflow-hidden border-0 shadow-xl">
                <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/80 to-transparent">
                  <CardTitle className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Landmark className="h-5 w-5 text-primary" />
                    </div>
                    Municípios Atendidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-80 divide-y divide-border/50 overflow-y-auto">
                    {activePrefeituras.map((prefeitura) => (
                      <Link
                        key={prefeitura.id}
                        to={`/p/${prefeitura.slug}`}
                        className="group flex items-center justify-between p-5 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          {prefeitura.logo_url ? (
                            <img
                              src={prefeitura.logo_url}
                              alt={prefeitura.nome}
                              className="h-12 w-12 rounded-xl object-cover shadow-md ring-2 ring-border"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-md">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-foreground transition-colors group-hover:text-primary">
                              {prefeitura.nome}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Scale className="h-3.5 w-3.5" />
                              {prefeitura.municipio}/{prefeitura.estado}
                            </div>
                          </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                        </div>
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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-primary-foreground backdrop-blur">
            <Shield className="h-4 w-4" />
            Comece Agora
          </div>
          <h2 className="text-4xl font-bold text-primary-foreground sm:text-5xl">
            Transforme a gestão de emendas do seu município
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-primary-foreground/80">
            Acesse a área restrita para gerenciar suas emendas ou visite o portal de transparência para consultas públicas
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Button size="lg" variant="secondary" asChild className="h-14 gap-3 px-10 text-base shadow-2xl">
              <Link to="/auth">
                <LogIn className="h-5 w-5" />
                Acessar Área Restrita
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="h-14 gap-2 border-2 border-white/30 bg-white/5 px-10 text-base text-primary-foreground backdrop-blur hover:bg-white/10"
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
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                  <Landmark className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-xl font-bold text-foreground">Sistema de Emendas</span>
                  <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Gov</span>
                </div>
              </div>
              <p className="mt-4 max-w-xs text-muted-foreground">
                Plataforma completa para gestão transparente de emendas parlamentares municipais.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="mb-4 font-semibold text-foreground">Sistema</h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li>
                    <Link to="/auth" className="transition-colors hover:text-foreground">Área Restrita</Link>
                  </li>
                  <li>
                    <Link to="/transparencia" className="transition-colors hover:text-foreground">Transparência</Link>
                  </li>
                  <li>
                    <Link to="/transparencia/relatorios" className="transition-colors hover:text-foreground">Relatórios</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-semibold text-foreground">Conformidade</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>MPC-MG nº 01/2025</li>
                  <li>ADPF 854/DF</li>
                  <li>LC 210/2024</li>
                  <li>LAI</li>
                </ul>
              </div>
            </div>

            {/* Developer */}
            <div className="text-right lg:text-right">
              <h4 className="mb-4 font-semibold text-foreground">Desenvolvido por</h4>
              <div className="inline-flex flex-col items-end gap-2">
                <span className="text-lg font-bold text-primary">Naikis Informática</span>
                <span className="text-muted-foreground">Sistemas Inteligentes</span>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Sistema de Gestão de Emendas Parlamentares. Todos os direitos reservados.
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              Desenvolvido com ❤️ por <span className="text-primary">Naikis Informática</span> - Sistemas Inteligentes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
