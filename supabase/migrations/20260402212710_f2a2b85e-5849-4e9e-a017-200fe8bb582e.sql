
-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id uuid,
  old_data jsonb,
  new_data jsonb,
  changed_fields text[],
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs (table_name, record_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs (user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super_admin and prefeitura_admin can view audit logs
CREATE POLICY "Admins podem ver logs de auditoria"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) 
    OR has_role(auth.uid(), 'prefeitura_admin'::app_role)
  );

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_old_data jsonb;
  v_new_data jsonb;
  v_changed text[];
  v_user_id uuid;
  k text;
BEGIN
  v_user_id := auth.uid();

  IF TG_OP = 'INSERT' THEN
    v_new_data := to_jsonb(NEW);
    INSERT INTO public.audit_logs (table_name, record_id, action, user_id, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', v_user_id, v_new_data);
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    -- Find changed fields
    FOR k IN SELECT jsonb_object_keys(v_new_data)
    LOOP
      IF v_old_data->k IS DISTINCT FROM v_new_data->k AND k NOT IN ('updated_at') THEN
        v_changed := array_append(v_changed, k);
      END IF;
    END LOOP;
    -- Only log if something actually changed
    IF array_length(v_changed, 1) > 0 THEN
      INSERT INTO public.audit_logs (table_name, record_id, action, user_id, old_data, new_data, changed_fields)
      VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', v_user_id, v_old_data, v_new_data, v_changed);
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    v_old_data := to_jsonb(OLD);
    INSERT INTO public.audit_logs (table_name, record_id, action, user_id, old_data)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', v_user_id, v_old_data);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- Attach triggers to main tables
CREATE TRIGGER audit_emendas
  AFTER INSERT OR UPDATE OR DELETE ON public.emendas
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_empresas_licitacao
  AFTER INSERT OR UPDATE OR DELETE ON public.empresas_licitacao
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_pagamentos
  AFTER INSERT OR UPDATE OR DELETE ON public.pagamentos
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_planos_trabalho
  AFTER INSERT OR UPDATE OR DELETE ON public.planos_trabalho
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_documentos
  AFTER INSERT OR UPDATE OR DELETE ON public.documentos
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
