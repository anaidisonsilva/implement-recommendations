
-- Remover política permissiva antiga que não verifica ownership
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem ver documentos" ON storage.objects;
