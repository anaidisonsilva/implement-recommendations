
-- Corrigir audit_logs: prefeitura_admin só vê logs da sua prefeitura
DROP POLICY IF EXISTS "Admins podem ver logs de auditoria" ON public.audit_logs;

CREATE POLICY "Super admin pode ver todos logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Prefeitura admin pode ver logs da sua prefeitura"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'prefeitura_admin'::app_role)
  AND EXISTS (
    SELECT 1 FROM user_roles ur1
    WHERE ur1.user_id = auth.uid()
      AND ur1.role = 'prefeitura_admin'::app_role
      AND ur1.prefeitura_id IS NOT NULL
      AND ur1.prefeitura_id IN (
        SELECT ur2.prefeitura_id FROM user_roles ur2
        WHERE ur2.user_id = audit_logs.user_id
      )
  )
);
