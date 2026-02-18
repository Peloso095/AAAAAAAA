-- =============================================================================
-- LISTA DE TODAS AS FUNÇÕES DO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- =============================================================================

-- =============================================================================
-- 1. Funções de Gatilho (TRIGGER)
-- =============================================================================

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar profile automaticamente ao cadastrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 2. Funções de Verificação de Acesso
-- =============================================================================

-- Verifica se usuário é admin pelo email
CREATE OR REPLACE FUNCTION public.is_admin(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF LOWER(p_email) = LOWER('rafaelpeloso0909@gmail.com') THEN
        RETURN TRUE;
    END IF;
    RETURN FALSE;
END;
$$;

-- Verifica se usuário é admin pelo user_id
CREATE OR REPLACE FUNCTION public.is_admin_by_id(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_admin BOOLEAN := FALSE;
    v_email TEXT;
BEGIN
    SELECT p.is_admin INTO v_is_admin
    FROM public.profiles p
    WHERE p.user_id = p_user_id;
    
    IF v_is_admin = TRUE THEN
        RETURN TRUE;
    END IF;
    
    SELECT u.email INTO v_email
    FROM auth.users u
    WHERE u.id = p_user_id;
    
    RETURN public.is_admin(v_email);
END;
$$;

-- Verifica se usuário tem assinatura válida
CREATE OR REPLACE FUNCTION public.has_valid_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subscription RECORD;
    v_status TEXT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT s.status, s.expires_at INTO v_status, v_expires_at
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id 
    AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    IF v_expires_at IS NOT NULL AND v_expires_at < NOW() THEN
        UPDATE public.subscriptions 
        SET status = 'expired', updated_at = NOW()
        WHERE user_id = p_user_id AND status = 'active' AND expires_at < NOW();
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Função principal: verifica se usuário pode acessar conteúdo
CREATE OR REPLACE FUNCTION public.can_access_content(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF public.is_admin_by_id(p_user_id) THEN
        RETURN TRUE;
    END IF;
    
    IF public.has_valid_subscription(p_user_id) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- Verifica se usuário é pago (simplificado)
CREATE OR REPLACE FUNCTION public.is_paid_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN public.has_valid_subscription(p_user_id);
END;
$$;

-- Verifica se usuário é developer
CREATE OR REPLACE FUNCTION public.is_dev_user(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN public.is_admin(p_email);
END;
$$;

-- Função de acesso simplificada
CREATE OR REPLACE FUNCTION public.can_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN public.can_access_content(p_user_id);
END;
$$;

-- =============================================================================
-- 3. Funções de Assinatura
-- =============================================================================

-- Obtém status completo da assinatura
CREATE OR REPLACE FUNCTION public.get_subscription_status(p_user_id UUID)
RETURNS TABLE (
    status TEXT,
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
            'pending'::TEXT,
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

-- Atualiza/cria assinatura
CREATE OR REPLACE FUNCTION public.update_subscription(
    p_user_id UUID,
    p_status TEXT,
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
    SELECT s.id INTO v_subscription_id
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id;
    
    IF FOUND THEN
        UPDATE public.subscriptions
        SET 
            status = p_status,
            expires_at = COALESCE(p_expires_at, expires_at),
            plan_type = COALESCE(p_plan_type, plan_type),
            stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id),
            updated_at = NOW()
        WHERE id = v_subscription_id;
    ELSE
        INSERT INTO public.subscriptions (user_id, status, plan_type, expires_at, stripe_subscription_id, paid_at)
        VALUES (p_user_id, p_status, p_plan_type, p_expires_at, p_stripe_subscription_id, 
                CASE WHEN p_status = 'active' THEN NOW() ELSE NULL END);
    END IF;
    
    RETURN TRUE;
END;
$$;

-- =============================================================================
-- 4. Funções de XP e Leveling
-- =============================================================================

-- Adiciona XP e atualiza level
CREATE OR REPLACE FUNCTION public.add_user_xp(
    p_user_id UUID,
    p_xp_amount INTEGER,
    p_reason TEXT,
    p_reference_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_xp INTEGER;
    v_current_level INTEGER;
    v_new_xp INTEGER;
    v_new_level INTEGER;
BEGIN
    SELECT xp_points, level INTO v_current_xp, v_current_level
    FROM public.profiles
    WHERE user_id = p_user_id;

    v_new_xp := COALESCE(v_current_xp, 0) + p_xp_amount;
    v_new_level := FLOOR(v_new_xp / 1000)::INTEGER + 1;
    IF v_new_level < 1 THEN v_new_level := 1; END IF;

    UPDATE public.profiles
    SET xp_points = v_new_xp, level = v_new_level
    WHERE user_id = p_user_id;

    INSERT INTO public.user_xp_logs (user_id, xp_amount, reason, reference_id)
    VALUES (p_user_id, p_xp_amount, p_reason, p_reference_id);
END;
$$;

-- =============================================================================
-- 5. Funções de Sequência (Streak)
-- =============================================================================

-- Atualiza sequência de estudo
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_streak RECORD;
    v_today DATE := CURRENT_DATE;
    v_yesterday DATE := CURRENT_DATE - 1;
BEGIN
    SELECT * INTO v_streak FROM public.user_streaks WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_study_date)
        VALUES (p_user_id, 1, 1, v_today);
        RETURN;
    END IF;

    IF v_streak.last_study_date = v_today THEN
        RETURN;
    ELSIF v_streak.last_study_date = v_yesterday THEN
        UPDATE public.user_streaks
        SET current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak + 1, current_streak + 1),
            last_study_date = v_today,
            updated_at = now()
        WHERE user_id = p_user_id;
    ELSE
        UPDATE public.user_streaks
        SET current_streak = 1,
            last_study_date = v_today,
            updated_at = now()
        WHERE user_id = p_user_id;
    END IF;
END;
$$;

-- =============================================================================
-- GATILHOS (TRIGGERS)
-- =============================================================================

-- Criar/recriar gatilhos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subjects_updated_at ON public.subjects;
CREATE TRIGGER update_subjects_updated_at 
  BEFORE UPDATE ON public.subjects 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_summaries_updated_at ON public.summaries;
CREATE TRIGGER update_summaries_updated_at 
  BEFORE UPDATE ON public.summaries 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON public.user_preferences 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON public.user_streaks;
CREATE TRIGGER update_user_streaks_updated_at 
  BEFORE UPDATE ON public.user_streaks 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON public.subscriptions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- FIM
-- =============================================================================
