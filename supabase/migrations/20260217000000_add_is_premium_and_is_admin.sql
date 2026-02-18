-- =============================================================================
-- MIGRAÇÃO SIMPLES: Adicionar campo is_premium
-- O campo is_admin já existe na tabela profiles
-- =============================================================================

-- 1. Adicionar campo is_premium na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Criar índice para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles(is_premium) WHERE is_premium = TRUE;

-- =============================================================================
-- RESUMO: Campo adicionado
-- - is_premium: boolean (default false) - indica se usuário pagou
-- - is_admin: boolean (já existia) - indica se é desenvolvedor
-- =============================================================================
