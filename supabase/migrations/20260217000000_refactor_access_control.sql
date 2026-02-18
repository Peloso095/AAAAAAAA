-- =============================================================================
-- MEDTRACK - Sistema de Controle de Acesso e Assinaturas
-- Refatoração completa para segurança profissional
-- =============================================================================

-- =============================================================================
-- 1. ADICIONAR CAMPO IS_ADMIN NA TABELA PROFILES
-- =============================================================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Criar índice para buscas rápidas por admin
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;

-- =============================================================================
-- 2. ATUALIZAR TABELA SUBSCRIPTIONS (nova estrutura)
-- =============================================================================
-- A tabela subscriptions já existe, mas vamos garantir que está correta

-- Adicionar campos faltantes se não existirem
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix',
ADD COLUMN IF NOT EXISTS is_renewal BOOLEAN DEFAULT FALSE;

-- Criar índice para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
ON public.subscriptions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at 
ON public.subscriptions(expires_at) WHERE status = 'active';

-- =============================================================================
-- 3. CRIAR ENUM PARA STATUS DE ASSINATURA
-- =============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('pending', 'active', 'inactive', 'expired', 'cancelled');
    END IF;
END $$;

-- Atualizar coluna status para usar o enum
ALTER TABLE public.subscriptions 
ALTER COLUMN status TYPE subscription_status USING status::subscription_status;

-- =============================================================================
-- 4. POLÍTICAS RLS (ROW LEVEL SECURITY) SEGURAS
-- =============================================================================

-- Remover políticas antigas problemáticas
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

-- Nova política: usuário só pode ver sua própria assinatura
CREATE POLICY "users_view_own_subscription" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

-- política: usuário NÃO pode inserir/alterar manualmente
-- Apenas via webhook ou service role
CREATE POLICY "service_role_manage_subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (false)
WITH CHECK (false);

-- =============================================================================
-- 5. CRIAR/ATUALIZAR FUNÇÕES DE VERIFICAÇÃO
-- =============================================================================

-- 5.1 Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verifica contra lista de admins permitidos
    -- Email do desenvolvedor principal
    IF LOWER(p_email) = LOWER('rafaelpeloso0909@gmail.com') THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- 5.2 Função para verificar se usuário é admin via user_id
CREATE OR REPLACE FUNCTION public.is_admin_by_id(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_admin BOOLEAN := FALSE;
    v_email TEXT;
BEGIN
    -- Primeiro verifica na tabela profiles
    SELECT p.is_admin INTO v_is_admin
    FROM public.profiles p
    WHERE p.user_id = p_user_id;
    
    IF v_is_admin = TRUE THEN
        RETURN TRUE;
    END IF;
    
    -- Se não encontrou, verifica pelo email
    SELECT u.email INTO v_email
    FROM auth.users u
    WHERE u.id = p_user_id;
    
    RETURN public.is_admin(v_email);
END;
$$;

-- 5.3 Função principal: verificar se usuário tem assinatura válida
CREATE OR REPLACE FUNCTION public.has_valid_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subscription RECORD;
    v_status subscription_status;
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Busca assinatura ativa mais recente do usuário
    SELECT s.status, s.expires_at INTO v_status, v_expires_at
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id 
    AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- Se não encontrou assinatura ativa, retorna FALSE
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Verifica se a assinatura não expirou
    IF v_expires_at IS NOT NULL AND v_expires_at < NOW() THEN
        -- Atualiza status para expired automaticamente
        UPDATE public.subscriptions 
        SET status = 'expired', updated_at = NOW()
        WHERE user_id = p_user_id AND status = 'active' AND expires_at < NOW();
        
        RETURN FALSE;
    END IF;
    
    -- Assinatura válida
    RETURN TRUE;
END;
$$;

-- 5.4 Função principal de verificação de acesso (combina admin + assinatura)
CREATE OR REPLACE FUNCTION public.can_access_content(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- PRIMEIRA VERIFICAÇÃO: é admin? (acesso total, ignora assinatura)
    IF public.is_admin_by_id(p_user_id) THEN
        RETURN TRUE;
    END IF;
    
    -- SEGUNDA VERIFICAÇÃO: tem assinatura ativa válida?
    IF public.has_valid_subscription(p_user_id) THEN
        RETURN TRUE;
    END IF;
    
    -- Acesso negado
    RETURN FALSE;
END;
$$;

-- 5.5 Função para obter status completo da assinatura do usuário
CREATE OR REPLACE FUNCTION public.get_subscription_status(p_user_id UUID)
RETURNS TABLE (
    status subscription_status,
    plan_type TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    days_remaining INTEGER,
    is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subscription RECORD;
BEGIN
    SELECT 
        s.status,
        s.plan_type,
        s.paid_at,
        s.expires_at,
        CASE 
            WHEN s.expires_at IS NOT NULL 
            THEN EXTRACT(DAY FROM (s.expires_at - NOW()))::INTEGER
            ELSE 0
        END AS days_remaining,
        public.has_valid_subscription(p_user_id) AS is_valid
    INTO v_subscription
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            'pending'::subscription_status,
            NULL::TEXT,
            NULL::TIMESTAMP WITH TIME ZONE,
            NULL::TIMESTAMP WITH TIME ZONE,
            0::INTEGER,
            FALSE::BOOLEAN;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT 
        v_subscription.status,
        v_subscription.plan_type,
        v_subscription.paid_at,
        v_subscription.expires_at,
        v_subscription.days_remaining,
        v_subscription.is_valid;
END;
$$;

-- =============================================================================
-- 6. CRIAR FUNÇÃO PARA ATUALIZAR ASSINATURA (chamada por webhooks)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_subscription(
    p_user_id UUID,
    p_status subscription_status,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_plan_type TEXT DEFAULT 'monthly',
    p_stripe_subscription_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subscription_id UUID;
BEGIN
    -- Verifica se já existe assinatura
    SELECT s.id INTO v_subscription_id
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id;
    
    IF FOUND THEN
        -- Atualiza assinatura existente
        UPDATE public.subscriptions
        SET 
            status = p_status,
            expires_at = COALESCE(p_expires_at, expires_at),
            plan_type = COALESCE(p_plan_type, plan_type),
            stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id),
            updated_at = NOW()
        WHERE id = v_subscription_id;
    ELSE
        -- Cria nova assinatura
        INSERT INTO public.subscriptions (user_id, status, plan_type, expires_at, stripe_subscription_id, paid_at)
        VALUES (p_user_id, p_status, p_plan_type, p_expires_at, p_stripe_subscription_id, 
                CASE WHEN p_status = 'active' THEN NOW() ELSE NULL END);
    END IF;
    
    RETURN TRUE;
END;
$$;

-- =============================================================================
-- 7. CRIAR GATILHO PARA CRIAR ASSINATURA PENDENTE NO CADASTRO
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_pending_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Quando um novo usuário é criado em auth.users
    -- Não criamos mais assinatura automaticamente
    -- O usuário deve fazer o pagamento primeiro
    
    RETURN NEW;
END;
$$;

-- Remover gatilho antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =============================================================================
-- 8. CRIAR ÍNDICES PARA PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_expires 
ON public.subscriptions(status, expires_at) 
WHERE status IN ('active', 'pending');

CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
ON public.profiles(user_id);

-- =============================================================================
-- 9. ADMIN - ATUALIZAR/USAR USUÁRIO ESPECIAL
-- =============================================================================
-- Esta função será usada pelo frontend/admin para verificar se deve dar acesso especial
-- O email rafaelfeloso0909@gmail.com terá acesso liberado automaticamente

-- =============================================================================
-- 10. COMMENT E DOCUMENTAÇÃO
-- =============================================================================
COMMENT ON FUNCTION public.is_admin(TEXT) IS 'Verifica se email é de administrador';
COMMENT ON FUNCTION public.is_admin_by_id(UUID) IS 'Verifica se usuário é admin via user_id';
COMMENT ON FUNCTION public.has_valid_subscription(UUID) IS 'Verifica se usuário tem assinatura ativa e válida';
COMMENT ON FUNCTION public.can_access_content(UUID) IS 'Função principal: verifica se usuário pode acessar conteúdo';
COMMENT ON FUNCTION public.get_subscription_status(UUID) IS 'Retorna status completo da assinatura';
COMMENT ON FUNCTION public.update_subscription(UUID, subscription_status, TIMESTAMP WITH TIME ZONE, TEXT, TEXT) IS 'Atualiza/cria assinatura (para webhooks)';

-- =============================================================================
-- FIM DAS MIGRAÇÕES
-- =============================================================================
-- Agora o sistema está configurado para:
-- 1. Usuários normais precisam de assinatura ativa para acessar
-- 2. Usuário admin (rafaelfeloso0909@gmail.com) tem acesso liberado
-- 3. Políticas RLS protegem contra manipulação manual
-- 4. Funções SQL verificam acesso no backend
-- 5. Sistema pronto para integração Stripe/webhooks
-- =============================================================================
