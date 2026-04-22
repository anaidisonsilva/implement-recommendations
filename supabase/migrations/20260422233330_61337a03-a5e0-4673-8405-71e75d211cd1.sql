-- Cria enum para forma de repasse
DO $$ BEGIN
  CREATE TYPE public.forma_repasse_emenda AS ENUM ('transferencia_especial', 'convenio', 'fundo_a_fundo');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Adiciona coluna opcional na tabela emendas
ALTER TABLE public.emendas
  ADD COLUMN IF NOT EXISTS forma_repasse public.forma_repasse_emenda;

-- Recria a view emendas_publicas para incluir o novo campo
DROP VIEW IF EXISTS public.emendas_publicas;

CREATE VIEW public.emendas_publicas AS
SELECT
  id, numero, tipo_concedente, nome_concedente, nome_parlamentar,
  tipo_recebedor, nome_recebedor, cnpj_recebedor,
  municipio, estado, data_disponibilizacao, data_inicio_vigencia, data_fim_vigencia,
  gestor_responsavel, objeto, grupo_natureza_despesa,
  valor, valor_executado, contrapartida,
  anuencia_previa_sus, status, especial, programa,
  numero_proposta, numero_plano_acao, numero_convenio,
  prefeitura_id, forma_repasse,
  created_at, updated_at
FROM public.emendas;