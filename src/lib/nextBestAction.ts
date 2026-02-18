/**
 * Next Best Action Engine
 * 
 * Determines the most appropriate action for the user based on their current state.
 * Prioritizes actions that maintain engagement and optimize learning.
 */

import { NextBestAction, NextBestActionType } from '@/integrations/supabase/types';
import { TIME_ESTIMATES, XP_CONFIG } from './contentGenerator';
import { supabase } from '@/integrations/supabase/client';

interface UserState {
  hasOnboarding: boolean;
  subjectsCount: number;
  flashcardsDue: number;
  totalFlashcards: number;
  questionsAnsweredToday: number;
  lastStudyDate: Date | null;
  hasContentSources: boolean;
  contentWithoutGeneration: number;
}

export async function getUserState(userId: string): Promise<UserState> {
  // Fetch all needed data in parallel
  const [
    preferencesRes,
    subjectsRes,
    flashcardsRes,
    questionAttemptsRes,
    contentSourcesRes
  ] = await Promise.all([
    supabase.from('user_preferences').select('onboarding_completed').eq('user_id', userId).maybeSingle(),
    supabase.from('subjects').select('id').eq('user_id', userId),
    supabase.from('flashcards').select('id, next_review').eq('user_id', userId),
    supabase.from('question_attempts')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date().toISOString().split('T')[0]),
    supabase.from('content_sources').select('id').eq('user_id', userId)
  ]);

  const now = new Date();
  const flashcards = flashcardsRes.data || [];
  const dueCards = flashcards.filter((f: { next_review: string }) => new Date(f.next_review) <= now).length;

  // Check last study from profile or sessions
  const sessionsRes = await supabase
    .from('study_sessions')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  const lastStudyDate = sessionsRes.data?.[0]?.created_at
    ? new Date(sessionsRes.data[0].created_at)
    : null;

  return {
    hasOnboarding: preferencesRes.data?.onboarding_completed === true,
    subjectsCount: subjectsRes.data?.length || 0,
    flashcardsDue: dueCards,
    totalFlashcards: flashcards.length,
    questionsAnsweredToday: questionAttemptsRes.data?.length || 0,
    lastStudyDate,
    hasContentSources: (contentSourcesRes.data?.length || 0) > 0,
    contentWithoutGeneration: 0 // Simplified - could track generated vs pending
  };
}

export function calculateNextBestAction(state: UserState): NextBestAction {
  const actions: NextBestAction[] = [];

  // 1. Onboarding - highest priority for new users
  if (!state.hasOnboarding) {
    actions.push({
      type: 'onboarding',
      title: 'Configure seu plano de estudos',
      description: 'Em 2 minutos, vamos personalizar sua experiência',
      cta: 'Começar Onboarding',
      path: '/onboarding',
      priority: 100,
      estimatedMinutes: 2,
      xpReward: XP_CONFIG.onboarding_complete
    });
  }

  // 2. Review flashcards if any due
  if (state.flashcardsDue > 0) {
    const estimatedTime = Math.min(state.flashcardsDue * TIME_ESTIMATES.flashcard_review, 30);
    actions.push({
      type: 'review_flashcards',
      title: `${state.flashcardsDue} flashcards para revisar`,
      description: `Mantenha sua sequência de estudo! Leva cerca de ${estimatedTime} min`,
      cta: 'Revisar Agora',
      path: '/flashcards',
      priority: 80,
      estimatedMinutes: estimatedTime,
      xpReward: state.flashcardsDue * XP_CONFIG.flashcard_review
    });
  }

  // 3. Quick quiz if hasn't done today
  if (state.questionsAnsweredToday === 0 && state.totalFlashcards > 0) {
    actions.push({
      type: 'do_quiz',
      title: 'Faça um simulado rápido',
      description: '10 questões para testar seu conhecimento',
      cta: 'Iniciar Simulado',
      path: '/questoes',
      priority: 60,
      estimatedMinutes: 20,
      xpReward: 10 * XP_CONFIG.question_correct
    });
  }

  // 4. Generate content if has sources
  if (state.hasContentSources && state.contentWithoutGeneration > 0) {
    actions.push({
      type: 'generate_content',
      title: 'Gere flashcards e questões',
      description: 'Transforme seu conteúdo em material de estudo',
      cta: 'Gerar Conteúdo',
      path: '/importar',
      priority: 50,
      estimatedMinutes: TIME_ESTIMATES.content_generation,
      xpReward: XP_CONFIG.content_generated
    });
  }

  // 5. Quick session if streak at risk
  if (state.lastStudyDate) {
    const hoursSinceLastStudy = (Date.now() - state.lastStudyDate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastStudy > 20 && hoursSinceLastStudy < 48) {
      actions.push({
        type: 'quick_session',
        title: 'Mantenha sua sequência! ⏰',
        description: 'Estude 5 min para não perder seu streak',
        cta: 'Sessão Rápida',
        path: '/flashcards',
        priority: 90,
        estimatedMinutes: TIME_ESTIMATES.quick_session,
        xpReward: XP_CONFIG.session_complete
      });
    }
  }

  // 6. Continue studying if active
  if (state.subjectsCount > 0 && state.flashcardsDue === 0 && state.questionsAnsweredToday > 0) {
    actions.push({
      type: 'continue_studying',
      title: 'Continue aprendendo',
      description: 'Explore novas matérias ou aprofunde seus conhecimentos',
      cta: 'Ver Matérias',
      path: '/materias',
      priority: 30,
      estimatedMinutes: 15,
      xpReward: XP_CONFIG.session_complete
    });
  }

  // Sort by priority and return top action
  actions.sort((a, b) => b.priority - a.priority);

  // If no actions, suggest adding subjects
  if (actions.length === 0) {
    actions.push({
      type: 'onboarding',
      title: 'Comece sua jornada',
      description: 'Adicione suas primeiras matérias para estudar',
      cta: 'Adicionar Matérias',
      path: '/materias',
      priority: 100,
      estimatedMinutes: 5,
      xpReward: 0
    });
  }

  return actions[0];
}

export function getActionIcon(type: NextBestActionType): string {
  const icons: Record<NextBestActionType, string> = {
    onboarding: '🚀',
    review_flashcards: '🧠',
    do_quiz: '📝',
    generate_content: '⚡',
    quick_session: '🔥',
    continue_studying: '📚'
  };
  return icons[type];
}
