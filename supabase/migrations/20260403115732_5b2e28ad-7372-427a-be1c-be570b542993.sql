
ALTER TABLE public.emendas ADD COLUMN programa boolean NOT NULL DEFAULT false;
ALTER TABLE public.emendas ALTER COLUMN numero DROP NOT NULL;
