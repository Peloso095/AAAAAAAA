-- Migration: Add onboarding, content sources, study plans, and XP logging tables
-- MEDTRACK - Enhanced automation and user guidance

-- 1. User Preferences table (for onboarding)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT, -- 'prova', 'residencia', 'faculdade'
  study_hours_per_week INTEGER,
  preferred_days TEXT[], -- ['monday', 'tuesday', etc]
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- 2. Content Sources table (for imported content)
CREATE TABLE IF NOT EXISTS public.content_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'text', 'pdf', 'url'
  extracted_text TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own content sources" ON public.content_sources FOR ALL USING (auth.uid() = user_id);

-- 3. Study Plans table (weekly schedule)
CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
  start_time TEXT NOT NULL, -- '09:00'
  end_time TEXT NOT NULL, -- '10:00'
  activity_type TEXT NOT NULL, -- 'review', 'study', 'practice'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own study plans" ON public.study_plans FOR ALL USING (auth.uid() = user_id);

-- 4. XP Logs table (for detailed XP tracking)
CREATE TABLE IF NOT EXISTS public.user_xp_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'flashcard_review', 'question_answer', 'session_complete', 'daily_goal'
  reference_id UUID, -- optional reference to the action
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_xp_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own XP logs" ON public.user_xp_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own XP logs" ON public.user_xp_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. User Streak tracking
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own streak" ON public.user_streaks FOR ALL USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON public.flashcards(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_user_xp_logs_created ON public.user_xp_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_content_sources_subject ON public.content_sources(subject_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON public.user_streaks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to add XP and handle leveling
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
  -- Get current XP and level
  SELECT xp_points, level INTO v_current_xp, v_current_level
  FROM public.profiles
  WHERE user_id = p_user_id;

  -- Calculate new XP
  v_new_xp := COALESCE(v_current_xp, 0) + p_xp_amount;
  
  -- Calculate new level (every 1000 XP = 1 level)
  v_new_level := FLOOR(v_new_xp / 1000)::INTEGER + 1;
  IF v_new_level < 1 THEN v_new_level := 1; END IF;

  -- Update profile
  UPDATE public.profiles
  SET xp_points = v_new_xp, level = v_new_level
  WHERE user_id = p_user_id;

  -- Log the XP
  INSERT INTO public.user_xp_logs (user_id, xp_amount, reason, reference_id)
  VALUES (p_user_id, p_xp_amount, p_reason, p_reference_id);
END;
$$;

-- Function to update streak
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
  -- Get or create streak record
  SELECT * INTO v_streak FROM public.user_streaks WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_study_date)
    VALUES (p_user_id, 1, 1, v_today);
    RETURN;
  END IF;

  -- Update streak based on last study date
  IF v_streak.last_study_date = v_today THEN
    -- Already studied today, no change
    RETURN;
  ELSIF v_streak.last_study_date = v_yesterday THEN
    -- Studied yesterday, increment streak
    UPDATE public.user_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak + 1, current_streak + 1),
        last_study_date = v_today,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE public.user_streaks
    SET current_streak = 1,
        last_study_date = v_today,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$;
