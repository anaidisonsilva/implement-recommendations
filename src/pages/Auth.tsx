import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Mail, Lock, User, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  nomeCompleto: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', nomeCompleto: '' });

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = loginSchema.safeParse(loginData);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }

      const { error } = await signIn(loginData.email, loginData.password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha inválidos');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Login realizado com sucesso!');
        navigate('/');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = signupSchema.safeParse(signupData);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }

      const { error } = await signUp(
        signupData.email,
        signupData.password,
        signupData.nomeCompleto
      );

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este email já está cadastrado');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Conta criada com sucesso! Você já pode fazer login.');
        navigate('/');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-header flex-col items-center justify-center p-12">
        <div className="text-center text-header-foreground">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-header-foreground/10 mx-auto">
            <Building2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold">Portal de Emendas</h1>
          <p className="mt-2 text-lg text-header-foreground/80">
            Transparência e Rastreabilidade
          </p>
          <div className="mt-8 space-y-3 text-left max-w-sm">
            <div className="flex items-center gap-3 text-sm text-header-foreground/70">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>Conformidade com ADPF 854/DF</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-header-foreground/70">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>Atende Recomendação MPC-MG nº 01/2025</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-header-foreground/70">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>Lei Complementar nº 210/2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - auth forms */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto">
              <Building2 className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Portal de Emendas</h1>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="João da Silva"
                      value={signupData.nomeCompleto}
                      onChange={(e) =>
                        setSignupData((prev) => ({ ...prev, nomeCompleto: e.target.value }))
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar conta'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com os termos de uso e política de privacidade.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
