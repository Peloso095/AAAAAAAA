-- =============================================================================
-- CORREÇÃO: Modules devem ter subject_id obrigatório
-- =============================================================================

-- 1. Primeiro, identificar modules órfãos (sem subject_id ou com subject_id inválido)
-- Esses são modules que foram criados sem关联 a uma matéria

-- Verificar quantos modules existem
SELECT COUNT(*) as total_modules FROM public.modules;

-- Verificar modules sem subject_id ou com subject_id inválido
SELECT m.id, m.name, m.subject_id, m.user_id
FROM public.modules m
LEFT JOIN public.subjects s ON m.subject_id = s.id
WHERE m.subject_id IS NULL OR s.id IS NULL;

-- 2. Excluir modules órfãos (opcional - se quiser limpar)
-- DELETE FROM public.modules
-- WHERE subject_id IS NULL 
-- OR subject_id NOT IN (SELECT id FROM public.subjects);

-- 3. Garantir que a constraint NOT NULL está ativa
ALTER TABLE public.modules ALTER COLUMN subject_id SET NOT NULL;

-- 4. Adicionar índice para performance (se não existir)
CREATE INDEX IF NOT EXISTS idx_modules_subject_user ON public.modules(subject_id, user_id);

-- 5. Garantir que a política RLS está correta ( filtrar por user E subject)
DROP POLICY IF EXISTS "Users can manage own modules" ON public.modules;
CREATE POLICY "Users can manage own modules" ON public.modules 
  FOR ALL USING (auth.uid() = user_id AND subject_id IS NOT NULL);

-- Verificar resultado
SELECT COUNT(*) as modules_com_subject FROM public.modules WHERE subject_id IS NOT NULL;
