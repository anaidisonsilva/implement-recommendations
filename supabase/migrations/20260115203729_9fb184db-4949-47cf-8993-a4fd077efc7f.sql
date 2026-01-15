-- Remover política restritiva de SELECT e criar uma pública
DROP POLICY IF EXISTS "Usuários autenticados podem ver todas as emendas" ON public.emendas;

-- Permitir que QUALQUER pessoa veja as emendas (transparência pública)
CREATE POLICY "Acesso público para visualização de emendas"
ON public.emendas
FOR SELECT
USING (true);

-- Manter as políticas de modificação apenas para usuários autenticados
-- (já existem as políticas de INSERT, UPDATE, DELETE que exigem auth.uid())