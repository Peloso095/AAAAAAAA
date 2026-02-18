-- =============================================================================
-- MEDTRACK - Script de Migração Completa para Criar Todas as Tabelas
-- Execute este script no Supabase SQL Editor para criar todas as tabelas necessárias
-- =============================================================================

-- Verificar se precisa criar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Função para updated_at automático
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. TABELA PROFILES (usuários)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  university TEXT,
  semester INTEGER,
  level INTEGER NOT NULL DEFAULT 1,
  xp_points INTEGER NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política RLS para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage profiles" ON public.profiles FOR ALL USING (true);

-- Gatilho para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 2. TABELA SUBJECTS (matérias)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own subjects" ON public.subjects;
CREATE POLICY "Users can manage own subjects" ON public.subjects FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 3. TABELA FLASHCARDS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  interval INTEGER NOT NULL DEFAULT 0,
  repetitions INTEGER NOT NULL DEFAULT 0,
  next_review TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own flashcards" ON public.flashcards;
CREATE POLICY "Users can manage own flashcards" ON public.flashcards FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_flashcards_user_next_review ON public.flashcards(user_id, next_review);

-- =============================================================================
-- 4. TABELA QUESTIONS (questões)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own questions" ON public.questions;
CREATE POLICY "Users can manage own questions" ON public.questions FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 5. TABELA QUESTION_ATTEMPTS (tentativas de questões)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.question_attempts (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own question attempts" ON public.question_attempts;
CREATE POLICY "Users can manage own question attempts" ON public.question_attempts FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 6. TABELA SUMMARIES (resumos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.summaries (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own summaries" ON public.summaries;
CREATE POLICY "Users can manage own summaries" ON public.summaries FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 7. TABELA STUDY_SESSIONS (sessões de estudo)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL DEFAULT 'study',
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own study sessions" ON public.study_sessions;
CREATE POLICY "Users can manage own study sessions" ON public.study_sessions FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 8. TABELA MODULES (módulos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own modules" ON public.modules;
CREATE POLICY "Users can manage own modules" ON public.modules FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 9. TABELA EXAMS (provas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own exams" ON public.exams;
CREATE POLICY "Users can manage own exams" ON public.exams FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 10. TABELA CLINICAL_PORTFOLIO (portfólio clínico)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.clinical_portfolio (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  specialty TEXT,
  description TEXT,
  cid_code TEXT,
  learnings TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.clinical_portfolio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own clinical portfolio" ON public.clinical_portfolio;
CREATE POLICY "Users can manage own clinical portfolio" ON public.clinical_portfolio FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 11. TABELA ACHIEVEMENTS (conquistas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own achievements" ON public.achievements;
CREATE POLICY "Users can manage own achievements" ON public.achievements FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 12. TABELA SUBSCRIPTIONS (assinaturas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  plan_type TEXT NOT NULL DEFAULT 'monthly',
  amount REAL NOT NULL DEFAULT 15.90,
  pix_key TEXT,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  payment_method TEXT DEFAULT 'pix',
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- 13. TABELA PAYMENT_CONFIRMATIONS (confirmações de pagamento)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payment_confirmations (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  pix_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.payment_confirmations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON public.payment_confirmations;
DROP POLICY IF EXISTS "Users can create payments" ON public.payment_confirmations;

CREATE POLICY "Users can view own payments" ON public.payment_confirmations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON public.payment_confirmations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 14. TABELA DEV_KEYS (chaves de desenvolvimento)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.dev_keys (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  key_name TEXT NOT NULL UNIQUE,
  key_value TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.dev_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active dev keys" ON public.dev_keys;
CREATE POLICY "Anyone can view active dev keys" ON public.dev_keys FOR SELECT USING (is_active = true);

-- =============================================================================
-- 15. TABELA ACCESS_KEYS (chaves de acesso)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.access_keys (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  access_key TEXT NOT NULL UNIQUE,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.access_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active access keys" ON public.access_keys;
CREATE POLICY "Anyone can view active access keys" ON public.access_keys FOR SELECT USING (is_active = true);

-- =============================================================================
-- 16. TABELA USER_PREFERENCES (preferências do usuário)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT,
  study_hours_per_week INTEGER,
  preferred_days TEXT[],
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD their own preferences" ON public.user_preferences;
CREATE POLICY "Users can CRUD their own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 17. TABELA CONTENT_SOURCES (fontes de conteúdo)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.content_sources (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL,
  extracted_text TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.content_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD their own content sources" ON public.content_sources;
CREATE POLICY "Users can CRUD their own content sources" ON public.content_sources FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 18. TABELA STUDY_PLANS (planos de estudo)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD their own study plans" ON public.study_plans;
CREATE POLICY "Users can CRUD their own study plans" ON public.study_plans FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 19. TABELA USER_XP_LOGS (logs de XP)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_xp_logs (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_xp_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own XP logs" ON public.user_xp_logs;
DROP POLICY IF EXISTS "Users can insert their own XP logs" ON public.user_xp_logs;

CREATE POLICY "Users can view their own XP logs" ON public.user_xp_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own XP logs" ON public.user_xp_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 20. TABELA USER_STREAKS (sequências de estudo)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own streak" ON public.user_streaks;
CREATE POLICY "Users can view their own streak" ON public.user_streaks FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 21. TABELA CLINICAL_CASES (casos clínicos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.clinical_cases (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  symptoms TEXT[] NOT NULL,
  correct_diagnosis TEXT NOT NULL,
  correct_exams TEXT[] NOT NULL,
  correct_treatment TEXT NOT NULL,
  patient_info JSONB NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  specialty TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.clinical_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own clinical cases" ON public.clinical_cases;
CREATE POLICY "Users can manage own clinical cases" ON public.clinical_cases FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- GATILHOS PARA UPDATED_AT
-- =============================================================================
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_summaries_updated_at BEFORE UPDATE ON public.summaries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON public.user_streaks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON public.flashcards(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_user_xp_logs_created ON public.user_xp_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_content_sources_subject ON public.content_sources(subject_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);

-- =============================================================================
-- CRIAR USUÁRIO ADMIN
-- =============================================================================
-- Para dar acesso admin, insira na tabela profiles:
-- UPDATE public.profiles SET is_admin = true WHERE user_id = 'ID_DO_USUARIO';

-- =============================================================================
-- FIM
-- =============================================================================
-- Execute este script no Supabase SQL Editor
-- Todas as tabelas e políticas RLS serão criadas
-- =============================================================================
