-- Criar tipos ENUM para status e tipos
CREATE TYPE public.tipo_concedente AS ENUM ('parlamentar', 'comissao', 'bancada', 'outro');
CREATE TYPE public.status_emenda AS ENUM ('pendente', 'aprovado', 'em_execucao', 'concluido', 'cancelado');
CREATE TYPE public.tipo_recebedor AS ENUM ('administracao_publica', 'entidade_sem_fins_lucrativos', 'consorcio_publico', 'pessoa_juridica_privada', 'outro');

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  cargo TEXT,
  orgao_setor TEXT,
  telefone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de emendas parlamentares
CREATE TABLE public.emendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  tipo_concedente public.tipo_concedente NOT NULL,
  nome_concedente TEXT NOT NULL,
  tipo_recebedor public.tipo_recebedor NOT NULL,
  nome_recebedor TEXT NOT NULL,
  cnpj_recebedor TEXT NOT NULL,
  municipio TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'MG',
  data_disponibilizacao DATE NOT NULL,
  gestor_responsavel TEXT NOT NULL,
  objeto TEXT NOT NULL,
  grupo_natureza_despesa TEXT NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  valor_executado DECIMAL(15,2) NOT NULL DEFAULT 0,
  banco TEXT NOT NULL,
  conta_corrente TEXT NOT NULL,
  anuencia_previa_sus BOOLEAN,
  status public.status_emenda NOT NULL DEFAULT 'pendente',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de planos de trabalho
CREATE TABLE public.planos_trabalho (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emenda_id UUID NOT NULL REFERENCES public.emendas(id) ON DELETE CASCADE,
  objeto TEXT NOT NULL,
  finalidade TEXT NOT NULL,
  estimativa_recursos DECIMAL(15,2) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de itens do cronograma
CREATE TABLE public.cronograma_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_trabalho_id UUID NOT NULL REFERENCES public.planos_trabalho(id) ON DELETE CASCADE,
  etapa TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  percentual_conclusao INTEGER NOT NULL DEFAULT 0 CHECK (percentual_conclusao >= 0 AND percentual_conclusao <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de documentos
CREATE TABLE public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_trabalho_id UUID REFERENCES public.planos_trabalho(id) ON DELETE CASCADE,
  emenda_id UUID REFERENCES public.emendas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_trabalho ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cronograma_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver todos os perfis" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários podem criar seu próprio perfil" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Políticas para emendas (todos autenticados podem ler, apenas quem criou pode editar)
CREATE POLICY "Usuários autenticados podem ver todas as emendas" ON public.emendas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem criar emendas" ON public.emendas
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Usuários podem atualizar emendas que criaram" ON public.emendas
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Usuários podem deletar emendas que criaram" ON public.emendas
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Políticas para planos_trabalho
CREATE POLICY "Usuários autenticados podem ver todos os planos" ON public.planos_trabalho
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem criar planos" ON public.planos_trabalho
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Usuários podem atualizar planos que criaram" ON public.planos_trabalho
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Usuários podem deletar planos que criaram" ON public.planos_trabalho
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Políticas para cronograma_itens
CREATE POLICY "Usuários autenticados podem ver cronogramas" ON public.cronograma_itens
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários podem gerenciar cronogramas dos seus planos" ON public.cronograma_itens
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.planos_trabalho pt 
      WHERE pt.id = cronograma_itens.plano_trabalho_id 
      AND pt.created_by = auth.uid()
    )
  );

-- Políticas para documentos
CREATE POLICY "Usuários autenticados podem ver documentos" ON public.documentos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem criar documentos" ON public.documentos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Usuários podem deletar documentos que fizeram upload" ON public.documentos
  FOR DELETE TO authenticated USING (auth.uid() = uploaded_by);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emendas_updated_at
  BEFORE UPDATE ON public.emendas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planos_trabalho_updated_at
  BEFORE UPDATE ON public.planos_trabalho
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cronograma_itens_updated_at
  BEFORE UPDATE ON public.cronograma_itens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome_completo)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para criar perfil quando usuário se registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Índices para performance
CREATE INDEX idx_emendas_status ON public.emendas(status);
CREATE INDEX idx_emendas_municipio ON public.emendas(municipio);
CREATE INDEX idx_emendas_created_by ON public.emendas(created_by);
CREATE INDEX idx_planos_trabalho_emenda ON public.planos_trabalho(emenda_id);
CREATE INDEX idx_documentos_emenda ON public.documentos(emenda_id);
CREATE INDEX idx_documentos_plano ON public.documentos(plano_trabalho_id);