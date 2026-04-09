
-- View pública de prefeituras sem dados sensíveis
CREATE OR REPLACE VIEW public.prefeituras_publicas AS
SELECT id, nome, municipio, estado, slug, logo_url, ativo, is_teste, created_at, updated_at
FROM public.prefeituras
WHERE ativo = true;

-- View pública de emendas sem dados bancários
CREATE OR REPLACE VIEW public.emendas_publicas AS
SELECT id, numero, tipo_concedente, nome_concedente, nome_parlamentar,
  tipo_recebedor, nome_recebedor, cnpj_recebedor, municipio, estado,
  data_disponibilizacao, gestor_responsavel, objeto, grupo_natureza_despesa,
  valor, valor_executado, contrapartida, numero_convenio, numero_plano_acao,
  numero_proposta, data_inicio_vigencia, data_fim_vigencia, especial, programa,
  status, prefeitura_id, created_at, updated_at, anuencia_previa_sus
FROM public.emendas;

-- Políticas para o bucket documentos1
CREATE POLICY "Documentos1 são publicamente legíveis"
ON storage.objects FOR SELECT
USING (bucket_id = 'documentos1');

CREATE POLICY "Upload restrito ao dono em documentos1"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documentos1' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Update restrito ao dono em documentos1"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documentos1' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Delete restrito ao dono em documentos1"
ON storage.objects FOR DELETE
USING (bucket_id = 'documentos1' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Adicionar política de UPDATE ao bucket documentos
CREATE POLICY "Update restrito ao dono em documentos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Corrigir INSERT do bucket documentos para validar path
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Upload restrito ao dono em documentos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);
