-- =============================================================================
-- FUNÇÕES DE VERIFICAÇÃO DE ACESSO
-- =============================================================================

-- 1. Verificar se email está na lista de usuários pagos
CREATE OR REPLACE FUNCTION public.is_paid_user(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.paid_users 
        WHERE LOWER(email) = LOWER(p_email)
    );
END;
$$;

-- 2. Verificar se é admin (desenvolvedor)
CREATE OR REPLACE FUNCTION public.is_dev_user(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Lista de emails de desenvolvedores - adicione quantos precisar
    IF LOWER(p_email) = LOWER('rafaelpeloso0909@gmail.com') THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- 3. Verificar acesso completo (pago OU desenvolvedor)
CREATE OR REPLACE FUNCTION public.can_access(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Primeiro verifica se é desenvolvedor
    IF public.is_dev_user(p_email) THEN
        RETURN TRUE;
    END IF;
    
    -- Depois verifica se pagou
    IF public.is_paid_user(p_email) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- Comentários para documentação
COMMENT ON FUNCTION public.is_paid_user(TEXT) IS 'Retorna true se email está na lista de usuários pagos';
COMMENT ON FUNCTION public.is_dev_user(TEXT) IS 'Retorna true se email é de desenvolvedor';
COMMENT ON FUNCTION public.can_access(TEXT) IS 'Retorna true se usuário pode acessar (pago ou devs)';
