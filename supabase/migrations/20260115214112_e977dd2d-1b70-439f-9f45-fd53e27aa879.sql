-- Add parlamentar field (separate from concedente which is the funding body)
ALTER TABLE public.emendas 
  ADD COLUMN IF NOT EXISTS nome_parlamentar text DEFAULT NULL;

-- Make nome_concedente nullable (both concedente and parlamentar are optional now)
ALTER TABLE public.emendas 
  ALTER COLUMN nome_concedente DROP NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.emendas.nome_concedente IS 'Nome do órgão concedente do recurso (opcional)';
COMMENT ON COLUMN public.emendas.nome_parlamentar IS 'Nome do parlamentar autor da emenda (opcional)';