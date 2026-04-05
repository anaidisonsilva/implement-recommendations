
-- Add is_teste column to prefeituras
ALTER TABLE public.prefeituras ADD COLUMN IF NOT EXISTS is_teste boolean NOT NULL DEFAULT false;

-- Add valor_plano column to prefeituras for monthly plan value
ALTER TABLE public.prefeituras ADD COLUMN IF NOT EXISTS valor_plano numeric DEFAULT 0;

-- Add asaas_customer_id to prefeituras for Asaas integration
ALTER TABLE public.prefeituras ADD COLUMN IF NOT EXISTS asaas_customer_id text;

-- Create faturas table
CREATE TABLE public.faturas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prefeitura_id uuid NOT NULL REFERENCES public.prefeituras(id) ON DELETE CASCADE,
  asaas_payment_id text,
  valor numeric NOT NULL,
  data_vencimento date NOT NULL,
  data_pagamento date,
  status text NOT NULL DEFAULT 'PENDING',
  mes_referencia text NOT NULL,
  url_boleto text,
  url_boleto_pdf text,
  linha_digitavel text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on faturas
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

-- Super admin can manage all invoices
CREATE POLICY "Super admin pode gerenciar faturas"
  ON public.faturas FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Prefeitura users can view their own invoices
CREATE POLICY "Prefeitura pode ver suas faturas"
  ON public.faturas FOR SELECT
  TO authenticated
  USING (user_belongs_to_prefeitura(auth.uid(), prefeitura_id));
