-- Add vigência (validity period) fields to emendas table
ALTER TABLE public.emendas 
ADD COLUMN data_inicio_vigencia date,
ADD COLUMN data_fim_vigencia date;

-- Add more system settings for customization
INSERT INTO public.system_settings (key, value) VALUES 
  ('footer_text', 'Portal de Transparência de Emendas Parlamentares • ADPF 854/DF • MPC-MG'),
  ('footer_compliance', 'Em conformidade com a Recomendação MPC-MG nº 01/2025 e Lei Complementar nº 210/2024'),
  ('logo_url', ''),
  ('primary_color', '222 47% 25%'),
  ('header_color', '222 47% 20%')
ON CONFLICT (key) DO NOTHING;