ALTER TABLE public.empresas_licitacao ALTER COLUMN numero_empenho DROP NOT NULL;
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS numero_empenho text;