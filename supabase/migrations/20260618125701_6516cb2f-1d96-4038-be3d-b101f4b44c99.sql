
DROP POLICY IF EXISTS "Usuários podem atualizar pagamentos que criaram" ON public.pagamentos;
DROP POLICY IF EXISTS "Usuários podem deletar pagamentos que criaram" ON public.pagamentos;

CREATE POLICY "Autenticados podem atualizar pagamentos"
ON public.pagamentos FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem deletar pagamentos"
ON public.pagamentos FOR DELETE TO authenticated
USING (auth.uid() IS NOT NULL);
