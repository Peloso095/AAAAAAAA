-- =============================================================================
-- SISTEMA DE ACESSO RESTRITO - APENAS 1 USUÁRIO
-- =============================================================================

-- 1. LIMPAR TABELAS DE ACESSO

-- Limpar paid_users (se existir)
DELETE FROM public.paid_users;

-- Limpar subscriptions (se existir)  
DELETE FROM public.subscriptions;

-- Limpar is_premium de todos os profiles
UPDATE public.profiles SET is_premium = false;

-- 2. DEFINIR USUÁRIO ÚNICO (via função)

-- Função de verificação simplificada - apenas email fixo
CREATE OR REPLACE FUNCTION public.can_access(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Apenas este email tem acesso
    IF LOWER(p_email) = LOWER('rafaelpeloso0909@gmail.com') THEN
        RETURN TRUE;
    END IF;
    
    -- Qualquer outro email é bloqueado
    RETURN FALSE;
END;
$$;

-- Função para verificar senha
CREATE OR REPLACE FUNCTION public.verify_password(p_email TEXT, p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Apenas o email autorizado com a senha correta
    IF LOWER(p_email) = LOWER('rafaelpeloso0909@gmail.com') 
    AND p_password = 'Peloso1099824_15' THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- Comentários
COMMENT ON FUNCTION public.can_access(TEXT) IS 'Retorna true apenas para rafaelpeloso0909@gmail.com';
COMMENT ON FUNCTION public.verify_password(TEXT, TEXT) IS 'Verifica email + senha fixa';
