
-- Fix profiles SELECT policy: restrict to own profile + admins for their prefeitura users
DROP POLICY IF EXISTS "Usuários podem ver todos os perfis" ON public.profiles;

-- Users can see their own profile
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Super admins can see all profiles
CREATE POLICY "Super admin pode ver todos os perfis"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Prefeitura admins can see profiles of users in their prefeitura
CREATE POLICY "Admin prefeitura pode ver perfis da sua prefeitura"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur1
    WHERE ur1.user_id = auth.uid()
      AND ur1.role = 'prefeitura_admin'
      AND ur1.prefeitura_id IN (
        SELECT ur2.prefeitura_id FROM public.user_roles ur2
        WHERE ur2.user_id = profiles.user_id
      )
  )
);
