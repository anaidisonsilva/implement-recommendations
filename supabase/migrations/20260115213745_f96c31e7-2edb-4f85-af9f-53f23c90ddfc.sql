-- Add new optional fields to emendas table
ALTER TABLE public.emendas 
  ADD COLUMN IF NOT EXISTS contrapartida numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS numero_convenio text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS numero_plano_acao text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS numero_proposta text DEFAULT NULL;

-- Make banco and conta_corrente nullable (they're filled after approval)
ALTER TABLE public.emendas 
  ALTER COLUMN banco DROP NOT NULL,
  ALTER COLUMN conta_corrente DROP NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.emendas.contrapartida IS 'Valor de contrapartida (opcional)';
COMMENT ON COLUMN public.emendas.numero_convenio IS 'Número do convênio (opcional)';
COMMENT ON COLUMN public.emendas.numero_plano_acao IS 'Número do plano de ação (opcional)';
COMMENT ON COLUMN public.emendas.numero_proposta IS 'Número da proposta (opcional)';