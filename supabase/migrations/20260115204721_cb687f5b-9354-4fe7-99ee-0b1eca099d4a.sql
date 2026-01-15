-- Create prefeituras table
CREATE TABLE public.prefeituras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE,
  cnpj text,
  estado text NOT NULL DEFAULT 'MG',
  municipio text NOT NULL,
  logo_url text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prefeituras ENABLE ROW LEVEL SECURITY;

-- Public can view active prefeituras
CREATE POLICY "Prefeituras ativas são públicas"
ON public.prefeituras FOR SELECT
USING (ativo = true);

-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'prefeitura_admin', 'prefeitura_user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  prefeitura_id uuid REFERENCES public.prefeituras(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, prefeitura_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's prefeitura
CREATE OR REPLACE FUNCTION public.get_user_prefeitura(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT prefeitura_id
  FROM public.user_roles
  WHERE user_id = _user_id
    AND prefeitura_id IS NOT NULL
  LIMIT 1
$$;

-- Function to check if user belongs to prefeitura
CREATE OR REPLACE FUNCTION public.user_belongs_to_prefeitura(_user_id uuid, _prefeitura_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (prefeitura_id = _prefeitura_id OR role = 'super_admin')
  )
$$;

-- RLS for user_roles - super admin can see all, others see their own
CREATE POLICY "Super admin pode ver todas roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin') OR user_id = auth.uid());

CREATE POLICY "Super admin pode gerenciar roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Add prefeitura_id to emendas
ALTER TABLE public.emendas ADD COLUMN prefeitura_id uuid REFERENCES public.prefeituras(id);

-- Update emendas RLS policies to be prefeitura-aware
DROP POLICY IF EXISTS "Acesso público para visualização de emendas" ON public.emendas;
DROP POLICY IF EXISTS "Usuários autenticados podem criar emendas" ON public.emendas;
DROP POLICY IF EXISTS "Usuários podem atualizar emendas que criaram" ON public.emendas;
DROP POLICY IF EXISTS "Usuários podem deletar emendas que criaram" ON public.emendas;

-- Public can view all emendas
CREATE POLICY "Acesso público para visualização de emendas"
ON public.emendas FOR SELECT
USING (true);

-- Users can create emendas for their prefeitura
CREATE POLICY "Usuários podem criar emendas da sua prefeitura"
ON public.emendas FOR INSERT
TO authenticated
WITH CHECK (
  public.user_belongs_to_prefeitura(auth.uid(), prefeitura_id)
  AND auth.uid() = created_by
);

-- Users can update emendas from their prefeitura
CREATE POLICY "Usuários podem atualizar emendas da sua prefeitura"
ON public.emendas FOR UPDATE
TO authenticated
USING (public.user_belongs_to_prefeitura(auth.uid(), prefeitura_id));

-- Users can delete emendas from their prefeitura
CREATE POLICY "Usuários podem deletar emendas da sua prefeitura"
ON public.emendas FOR DELETE
TO authenticated
USING (public.user_belongs_to_prefeitura(auth.uid(), prefeitura_id));

-- Super admin can manage all prefeituras
CREATE POLICY "Super admin pode gerenciar prefeituras"
ON public.prefeituras FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Trigger for updated_at on prefeituras
CREATE TRIGGER update_prefeituras_updated_at
BEFORE UPDATE ON public.prefeituras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();