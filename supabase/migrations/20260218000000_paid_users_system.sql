-- =============================================================================
-- SISTEMA DE ACESSO PAGO - SUPABASE OFFICIAL
-- =============================================================================

-- =============================================================================
-- 1. TABELA PAID_USERS
-- =============================================================================
DROP TABLE IF EXISTS public.paid_users;

CREATE TABLE public.paid_users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================================================
-- 2. ÍNDICES
-- =============================================================================
CREATE INDEX idx_paid_users_user_id ON public.paid_users(user_id);
CREATE UNIQUE INDEX idx_paid_users_email ON public.paid_users(LOWER(email));

-- =============================================================================
-- 3. RLS - ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.paid_users ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem ver apenas seus próprios registros
CREATE POLICY "users_view_own_paid_status" 
ON public.paid_users FOR SELECT 
USING (auth.uid() = user_id);

-- Apenas service_role pode inserir/atualizar/excluir
CREATE POLICY "service_role_manage_paid_users" 
ON public.paid_users FOR ALL 
USING (auth.role() = 'service_role');

-- =============================================================================
-- 4. FUNÇÕES DE VERIFICAÇÃO
-- =============================================================================

-- Verificar se usuário é pago
CREATE OR REPLACE FUNCTION public.is_paid_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.paid_users 
        WHERE user_id = p_user_id
    );
END;
$$;

-- Verificar se é desenvolvedor (lista de emails autorizados)
CREATE OR REPLACE FUNCTION public.is_dev_user(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Adicione seus emails de desenvolvedor aqui
    IF LOWER(p_email) = LOWER('rafaelpeloso0909@gmail.com') THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- Verificar acesso completo
CREATE OR REPLACE FUNCTION public.can_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_email TEXT;
BEGIN
    -- Busca email do usuário
    SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
    
    -- Se é desenvolvedor, tem acesso
    IF public.is_dev_user(v_email) THEN
        RETURN TRUE;
    END IF;
    
    -- Se é pago, tem acesso
    IF public.is_paid_user(p_user_id) THEN
        RETURN TRUE;
    END IF;
    
    -- Acesso negado
    RETURN FALSE;
END;
$$;

-- =============================================================================
-- 5. COMENTÁRIOS
-- =============================================================================
COMMENT ON TABLE public.paid_users IS 'Tabela de usuários pagos';
COMMENT ON FUNCTION public.is_paid_user(UUID) IS 'Retorna true se usuário pagou';
COMMENT ON FUNCTION public.is_dev_user(TEXT) IS 'Retorna true se email é de desenvolvedor';
COMMENT ON FUNCTION public.can_access(UUID) IS 'Verifica se usuário pode acessar';

-- =============================================================================
-- EXEMPLO: Inserir usuário pago (via service role)
-- =============================================================================
/*
-- Para adicionar um usuário pago, execute via service role:
INSERT INTO public.paid_users (user_id, email, paid_at)
SELECT id, email, now()
FROM auth.users 
WHERE email = 'email@do.usuario.com';
*/
