-- Tabela para empresas vencedoras de licitação
CREATE TABLE public.empresas_licitacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  emenda_id UUID NOT NULL REFERENCES public.emendas(id) ON DELETE CASCADE,
  nome_empresa TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  numero_empenho TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela para pagamentos
CREATE TABLE public.pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas_licitacao(id) ON DELETE CASCADE,
  valor NUMERIC NOT NULL,
  data_pagamento DATE NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.empresas_licitacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- Políticas para empresas_licitacao
CREATE POLICY "Visualização pública de empresas"
ON public.empresas_licitacao
FOR SELECT
USING (true);

CREATE POLICY "Usuários autenticados podem criar empresas"
ON public.empresas_licitacao
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Usuários podem atualizar empresas que criaram"
ON public.empresas_licitacao
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Usuários podem deletar empresas que criaram"
ON public.empresas_licitacao
FOR DELETE
USING (auth.uid() = created_by);

-- Políticas para pagamentos
CREATE POLICY "Visualização pública de pagamentos"
ON public.pagamentos
FOR SELECT
USING (true);

CREATE POLICY "Usuários autenticados podem criar pagamentos"
ON public.pagamentos
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Usuários podem atualizar pagamentos que criaram"
ON public.pagamentos
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Usuários podem deletar pagamentos que criaram"
ON public.pagamentos
FOR DELETE
USING (auth.uid() = created_by);

-- Triggers para updated_at
CREATE TRIGGER update_empresas_licitacao_updated_at
BEFORE UPDATE ON public.empresas_licitacao
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at
BEFORE UPDATE ON public.pagamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();