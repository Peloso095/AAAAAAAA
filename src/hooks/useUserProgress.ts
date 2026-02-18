import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProgress {
  level: number;
  xpPoints: number;
  streak: number;
  longestStreak: number;
  onboardingCompleted: boolean;
}

export function useUserProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>({
    level: 1,
    xpPoints: 0,
    streak: 0,
    longestStreak: 0,
    onboardingCompleted: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;
    
    try {
      const [profileRes, streakRes, preferencesRes] = await Promise.all([
        supabase.from('profiles').select('level, xp_points').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_streaks').select('current_streak, longest_streak').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_preferences').select('onboarding_completed').eq('user_id', user.id).maybeSingle(),
      ]);

      setProgress({
        level: profileRes.data?.level || 1,
        xpPoints: profileRes.data?.xp_points || 0,
        streak: streakRes.data?.current_streak || 0,
        longestStreak: streakRes.data?.longest_streak || 0,
        onboardingCompleted: preferencesRes.data?.onboarding_completed === true,
      });
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const addXP = useCallback(async (amount: number, reason: string) => {
    if (!user) return;

    try {
      await supabase.rpc('add_user_xp', {
        p_user_id: user.id,
        p_xp_amount: amount,
        p_reason: reason
      });
      
      // Refresh progress
      await loadProgress();
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  }, [user]);

  const updateStreak = useCallback(async () => {
    if (!user) return;

    try {
      await supabase.rpc('update_user_streak', {
        p_user_id: user.id
      });
      
      // Refresh progress
      await loadProgress();
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }, [user]);

  const xpForNextLevel = progress.level * 1000;
  const xpProgress = (progress.xpPoints % 1000) / 10;

  return {
    progress,
    loading,
    addXP,
    updateStreak,
    xpForNextLevel,
    xpProgress,
    refresh: loadProgress,
  };
}
