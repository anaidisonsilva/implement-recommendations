-- Adicionar coluna especial na tabela emendas
ALTER TABLE public.emendas 
ADD COLUMN especial boolean NOT NULL DEFAULT false;