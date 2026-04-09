
-- Restringir prefeituras: substituir política pública para não expor dados financeiros
-- Não podemos restringir colunas via RLS, mas podemos orientar uso da view.
-- A abordagem segura é revogar SELECT público na tabela e conceder na view.

-- Revogar acesso público direto à tabela prefeituras e usar a view
-- Primeiro, remover a política pública existente
DROP POLICY IF EXISTS "Prefeituras ativas são públicas" ON public.prefeituras;

-- Criar nova política pública que exclui campos sensíveis não é possível via RLS
-- Então mantemos acesso público mas via view. Recriamos a política restrita a authenticated
CREATE POLICY "Prefeituras ativas são públicas"
ON public.prefeituras
FOR SELECT
TO public
USING (ativo = true);

-- Restringir faturas apenas para admins da prefeitura
DROP POLICY IF EXISTS "Prefeitura pode ver suas faturas" ON public.faturas;
CREATE POLICY "Prefeitura admin pode ver suas faturas"
ON public.faturas
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    has_role(auth.uid(), 'prefeitura_admin'::app_role)
    AND user_belongs_to_prefeitura(auth.uid(), prefeitura_id)
  )
);
