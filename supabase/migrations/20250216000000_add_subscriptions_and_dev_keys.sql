-- Migration: Add subscriptions and dev keys tables
-- MEDTRACK - Payment and access control system

-- 1. Dev keys table (for free access)
CREATE TABLE IF NOT EXISTS public.dev_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_name TEXT NOT NULL UNIQUE,
  key_value TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dev_keys ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view dev keys (but only admin should insert/update)
CREATE POLICY "Anyone can view active dev keys" ON public.dev_keys FOR SELECT USING (is_active = true);
CREATE POLICY "Service role can manage dev keys" ON public.dev_keys FOR ALL USING (true);

-- 2. Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'cancelled', 'expired'
  plan_type TEXT NOT NULL DEFAULT 'monthly', -- 'monthly'
  pix_key TEXT, -- PIX key for reference (not stored securely for simplicity)
  amount DECIMAL(10,2) NOT NULL DEFAULT 15.90,
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscription" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- 3. Payment confirmations table (for manual verification)
CREATE TABLE IF NOT EXISTS public.payment_confirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  pix_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected'
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.payment_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments" ON public.payment_confirmations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON public.payment_confirmations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription RECORD;
BEGIN
  SELECT * INTO v_subscription
  FROM public.subscriptions
  WHERE user_id = p_user_id AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if not expired
  IF v_subscription.expires_at IS NOT NULL AND v_subscription.expires_at < NOW() THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Function to check if user can access (subscription OR dev key)
CREATE OR REPLACE FUNCTION public.can_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has active subscription
  IF public.has_active_subscription(p_user_id) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has dev access (stored in user_preferences or profiles)
  -- For now, we'll check if user is the admin (you)
  -- You can modify this to check against dev_keys table
  
  RETURN FALSE;
END;
$$;

-- Trigger for updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON public.subscriptions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
