import { Link } from 'react-router-dom';
import { usePrefeituras } from '@/hooks/usePrefeituras';
import {
  Building2,
  Shield,
  FileText,
  BarChart3,
  LogIn,
  CheckCircle2,
  Users,
  Globe,
  ArrowRight,
  Lock,
  Landmark,
  Zap,
  Clock,
  HeadphonesIcon,
  TrendingUp,
} from 'lucide-react';

const serif = { fontFamily: "'Instrument Serif', serif" };
const sans = { fontFamily: "'Work Sans', sans-serif" };

const LandingPage = () => {
  const { data: prefeituras } = usePrefeituras();
  const activePrefeituras = prefeituras?.filter(p => p.ativo) || [];
  const estados = new Set(activePrefeituras.map(p => p.estado).filter(Boolean));

  const features = [
    { icon: FileText, title: 'Gestão Completa de Emendas', description: 'Controle total do ciclo de vida das emendas parlamentares, do cadastro à prestação de contas.' },
    { icon: Shield, title: 'Conformidade Legal Garantida', description: 'Sistema 100% adequado às exigências do MPC-MG, ADPF 854/DF e demais normativos.' },
    { icon: BarChart3, title: 'Dashboards em Tempo Real', description: 'Painéis interativos com indicadores de desempenho e execução orçamentária.' },
    { icon: Globe, title: 'Portal de Transparência', description: 'Acesso público para consulta cidadã, promovendo accountability e controle social.' },
    { icon: Users, title: 'Gestão Multi-Prefeituras', description: 'Administração centralizada com isolamento de dados e permissões por município.' },
    { icon: Lock, title: 'Segurança de Nível Bancário', description: 'Infraestrutura segura com criptografia, backup automático e auditoria completa.' },
  ];

  const benefits = [
    { icon: Zap, title: 'Implantação Rápida', desc: 'Sistema pronto em poucos dias' },
    { icon: Clock, title: 'Suporte 24/7', desc: 'Equipe técnica sempre disponível' },
    { icon: TrendingUp, title: 'Atualizações Constantes', desc: 'Melhorias contínuas' },
    { icon: HeadphonesIcon, title: 'Treinamento Incluído', desc: 'Capacitação completa' },
  ];

  const compliance = ['MPC-MG nº 01/2025', 'ADPF 854/DF - STF', 'LC 210/2024', 'Lei de Acesso à Informação'];

  return (
    <div className="min-h-screen bg-[#0c2340] text-white selection:bg-[#5cbdb9] selection:text-[#0c2340]" style={sans}>
      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/5">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1a4a6e] border border-[#5cbdb9]/30">
              <Landmark className="h-5 w-5 text-[#5cbdb9]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white">Sistema de Emendas</span>
              <span className="rounded bg-[#1a4a6e] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#5cbdb9] border border-[#5cbdb9]/20">Gov</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/transparencia" className="hidden text-sm text-white/70 hover:text-[#5cbdb9] transition-colors sm:inline">
              Transparência
            </Link>
            <Link to="/auth" className="flex items-center gap-2 rounded-full bg-[#1a4a6e] hover:bg-[#2d8a9e] text-white px-5 py-2.5 border border-white/10 transition-all text-sm font-medium">
              <LogIn className="h-4 w-4" />
              Área Restrita
            </Link>
          </div>
        </div>
      </nav>

      {/* Background grain */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(#5cbdb9 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:px-12 lg:py-28">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2d8a9e]/30 bg-[#1a4a6e]/40 px-3 py-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#5cbdb9]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5cbdb9]">Solução Oficial para Gestão Pública</span>
            </div>

            <h1 className="text-6xl leading-[0.9] text-white md:text-7xl lg:text-[5.5rem]" style={serif}>
              Gestão Inteligente de <span className="italic text-[#5cbdb9]/90">Emendas</span>
            </h1>

            <p className="max-w-lg text-lg font-light leading-relaxed text-[#2d8a9e] md:text-xl">
              Plataforma completa para municípios gerenciarem emendas parlamentares com{' '}
              <span className="font-medium text-white">transparência, eficiência</span> e{' '}
              <span className="font-medium text-white">conformidade legal</span>.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/auth"
                className="group flex items-center gap-3 bg-[#5cbdb9] hover:bg-[#2d8a9e] text-[#0c2340] px-8 py-4 rounded-sm font-semibold transition-all duration-300"
              >
                Acessar Sistema
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/transparencia"
                className="border border-[#1a4a6e] hover:bg-[#1a4a6e]/20 text-white px-8 py-4 rounded-sm font-medium transition-all"
              >
                Portal Público
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-[#1a4a6e]/30 pt-8">
              {compliance.map((c) => (
                <div key={c} className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2d8a9e]/80">
                  <CheckCircle2 className="h-4 w-4 text-[#5cbdb9] shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard */}
          <div className="relative">
            <div className="absolute -inset-20 rounded-full bg-gradient-to-tr from-[#1a4a6e] to-[#5cbdb9] opacity-10 blur-3xl" />

            <div className="relative rounded-xl border border-[#1a4a6e] bg-[#0c2340] p-2 shadow-2xl">
              <div className="rounded-lg border border-[#1a4a6e]/50 bg-[#0c2340] p-6">
                <div className="mb-10 flex items-center justify-between">
                  <div className="flex space-x-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/20" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
                    <div className="h-3 w-3 rounded-full bg-green-500/20" />
                  </div>
                  <div className="font-mono text-[10px] tracking-tighter text-[#2d8a9e]">DASHBOARD_V4.02</div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-[#2d8a9e]/20 bg-gradient-to-br from-[#1a4a6e]/40 to-transparent p-4">
                      <p className="mb-1 text-[10px] font-semibold uppercase text-[#5cbdb9]">Prefeituras Ativas</p>
                      <p className="text-3xl text-white" style={serif}>{activePrefeituras.length || 0}</p>
                    </div>
                    <div className="rounded-lg border border-[#2d8a9e]/20 bg-gradient-to-br from-[#1a4a6e]/40 to-transparent p-4">
                      <p className="mb-1 text-[10px] font-semibold uppercase text-[#5cbdb9]">Estados</p>
                      <p className="text-3xl text-white" style={serif}>{estados.size || 0}</p>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center py-10">
                    <svg className="h-48 w-48 -rotate-90 transform drop-shadow-[0_0_15px_rgba(92,189,185,0.2)]">
                      <circle cx="96" cy="96" r="80" stroke="#1a4a6e" strokeWidth="12" fill="transparent" opacity="0.3" />
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#5cbdb9"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray="502.4"
                        strokeDashoffset="120"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-medium uppercase tracking-widest text-[#2d8a9e]">Execução</span>
                      <span className="text-4xl text-white" style={serif}>76%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a4a6e]/20">
                      <div className="h-full w-3/4 bg-gradient-to-r from-[#2d8a9e] to-[#5cbdb9]" />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase text-[#2d8a9e]">
                      <span>Orçamento Acompanhado</span>
                      <span>Tempo Real</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 -right-10 h-32 w-32 border-b-2 border-r-2 border-[#5cbdb9]/20" />
            <div className="absolute -top-10 -left-10 h-32 w-32 border-l-2 border-t-2 border-[#5cbdb9]/20" />
          </div>
        </div>
      </section>

      {/* Benefits Strip */}
      <section className="border-y border-white/5 bg-[#0c2340]/80">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 lg:grid-cols-4 lg:px-12">
          {benefits.map((b, i) => (
            <div key={b.title} className="flex items-start gap-3">
              <div className="text-2xl font-bold text-[#5cbdb9]" style={serif}>0{i + 1}.</div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-wide text-white">{b.title}</div>
                <div className="text-xs text-[#2d8a9e]/80">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2d8a9e]/30 bg-[#1a4a6e]/40 px-3 py-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5cbdb9]">Funcionalidades</span>
            </div>
            <h2 className="text-5xl leading-[1] text-white md:text-6xl" style={serif}>
              Tudo que seu município <span className="italic text-[#5cbdb9]/90">precisa</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base text-[#2d8a9e]">
              Sistema desenvolvido por especialistas em gestão pública para atender todas as necessidades dos municípios brasileiros.
            </p>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-[#1a4a6e]/30 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="group relative bg-[#0c2340] p-8 transition-colors hover:bg-[#1a4a6e]/20">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-[#5cbdb9]/20 bg-[#1a4a6e]/40">
                  <f.icon className="h-5 w-5 text-[#5cbdb9]" />
                </div>
                <h3 className="mb-3 text-2xl text-white" style={serif}>{f.title}</h3>
                <p className="text-sm leading-relaxed text-[#2d8a9e]">{f.description}</p>
                <div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-[#5cbdb9] to-transparent transition-all duration-500 group-hover:w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parceiros */}
      {activePrefeituras.length > 0 && (
        <section className="border-t border-white/5 bg-gradient-to-b from-[#0c2340] to-[#0a1d36] py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="mb-16 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2d8a9e]/30 bg-[#1a4a6e]/40 px-3 py-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5cbdb9]">Rede de Parceiros</span>
                </div>
                <h2 className="text-5xl leading-[1] text-white md:text-6xl" style={serif}>
                  Municípios que <span className="italic text-[#5cbdb9]/90">confiam</span>
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-6 lg:gap-12">
                <div>
                  <div className="text-5xl text-[#5cbdb9]" style={serif}>{activePrefeituras.length}</div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-[#2d8a9e]">Prefeituras</div>
                </div>
                <div>
                  <div className="text-5xl text-[#5cbdb9]" style={serif}>{estados.size}</div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-[#2d8a9e]">Estados</div>
                </div>
              </div>
            </div>

            <div className="grid gap-px overflow-hidden rounded-xl bg-[#1a4a6e]/30 sm:grid-cols-2 lg:grid-cols-3">
              {activePrefeituras.slice(0, 9).map((p) => (
                <Link
                  key={p.id}
                  to={`/p/${p.slug}`}
                  className="group flex items-center justify-between gap-4 bg-[#0c2340] p-6 transition-colors hover:bg-[#1a4a6e]/20"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.nome} className="h-12 w-12 rounded-lg object-cover ring-1 ring-[#5cbdb9]/20" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#5cbdb9]/20 bg-[#1a4a6e]/40">
                        <Building2 className="h-5 w-5 text-[#5cbdb9]" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate font-medium text-white group-hover:text-[#5cbdb9] transition-colors">{p.nome}</div>
                      <div className="text-xs text-[#2d8a9e]">{p.municipio}/{p.estado}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#2d8a9e] transition-all group-hover:translate-x-1 group-hover:text-[#5cbdb9]" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden border-y border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a4a6e] via-[#0c2340] to-[#0c2340]" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center lg:px-12">
          <h2 className="text-5xl leading-[1] text-white md:text-6xl" style={serif}>
            Transforme a gestão de emendas do <span className="italic text-[#5cbdb9]/90">seu município</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-[#2d8a9e]">
            Acesse a área restrita para gerenciar suas emendas ou visite o portal de transparência para consultas públicas.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/auth" className="group flex items-center gap-3 bg-[#5cbdb9] hover:bg-[#2d8a9e] text-[#0c2340] px-8 py-4 rounded-sm font-semibold transition-all">
              <LogIn className="h-4 w-4" />
              Acessar Área Restrita
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/transparencia" className="flex items-center gap-3 border border-[#1a4a6e] hover:bg-[#1a4a6e]/20 text-white px-8 py-4 rounded-sm font-medium transition-all">
              <Globe className="h-4 w-4" />
              Portal de Transparência
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a1d36]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-3 lg:px-12">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1a4a6e] border border-[#5cbdb9]/30">
                <Landmark className="h-5 w-5 text-[#5cbdb9]" />
              </div>
              <span className="text-base font-semibold text-white">Sistema de Emendas</span>
              <span className="rounded bg-[#1a4a6e] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#5cbdb9] border border-[#5cbdb9]/20">Gov</span>
            </div>
            <p className="mt-5 max-w-xs text-sm text-[#2d8a9e]">
              Plataforma completa para gestão transparente de emendas parlamentares municipais.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[#5cbdb9]">Sistema</h4>
              <ul className="space-y-3 text-sm text-[#2d8a9e]">
                <li><Link to="/auth" className="hover:text-white transition-colors">Área Restrita</Link></li>
                <li><Link to="/transparencia" className="hover:text-white transition-colors">Transparência</Link></li>
                <li><Link to="/transparencia/relatorios" className="hover:text-white transition-colors">Relatórios</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[#5cbdb9]">Conformidade</h4>
              <ul className="space-y-3 text-sm text-[#2d8a9e]">
                <li>MPC-MG nº 01/2025</li>
                <li>ADPF 854/DF</li>
                <li>LC 210/2024</li>
                <li>LAI</li>
              </ul>
            </div>
          </div>

          <div className="lg:text-right">
            <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[#5cbdb9]">Desenvolvido por</h4>
            <div className="text-2xl text-white" style={serif}>Naikis Informática</div>
            <div className="text-xs text-[#2d8a9e] mt-1">Sistemas Inteligentes</div>
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-[#2d8a9e] sm:flex-row lg:px-12">
            <p>© {new Date().getFullYear()} Sistema de Gestão de Emendas Parlamentares. Todos os direitos reservados.</p>
            <p>Desenvolvido por <span className="text-[#5cbdb9]">Naikis Informática</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
