-- Drop existing SELECT policies and create new public ones

-- planos_trabalho: Allow public read access
DROP POLICY IF EXISTS "Usuários autenticados podem ver todos os planos" ON public.planos_trabalho;
CREATE POLICY "Visualização pública de planos de trabalho" 
ON public.planos_trabalho 
FOR SELECT 
USING (true);

-- cronograma_itens: Allow public read access
DROP POLICY IF EXISTS "Usuários autenticados podem ver cronogramas" ON public.cronograma_itens;
CREATE POLICY "Visualização pública de cronograma" 
ON public.cronograma_itens 
FOR SELECT 
USING (true);

-- documentos: Allow public read access
DROP POLICY IF EXISTS "Usuários autenticados podem ver documentos" ON public.documentos;
CREATE POLICY "Visualização pública de documentos" 
ON public.documentos 
FOR SELECT 
USING (true);