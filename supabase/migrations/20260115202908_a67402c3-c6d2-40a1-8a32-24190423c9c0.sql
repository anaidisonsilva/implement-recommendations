-- Criar bucket para documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documentos', 'documentos', false, 10485760, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

-- Políticas de storage para documentos
CREATE POLICY "Usuários autenticados podem fazer upload de documentos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "Usuários autenticados podem ver documentos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documentos');

CREATE POLICY "Usuários podem deletar seus próprios documentos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);