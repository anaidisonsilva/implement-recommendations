-- Atualizar o bucket documentos para público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'documentos';