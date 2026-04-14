
ALTER TABLE public.emendas 
  ADD COLUMN IF NOT EXISTS valor_empenhado numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_liquidado numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_pago numeric NOT NULL DEFAULT 0;
