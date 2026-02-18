import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  BookOpen, 
  ClipboardList, 
  Trophy, 
  Calendar, 
  TrendingUp,
  Clock,
  Target,
  Flame,
  ChevronRight,
  Play,
  Zap,
  Wand2,
  Rocket
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { getUserState, calculateNextBestAction, getActionIcon } from '@/lib/nextBestAction';
import { NextBestAction } from '@/integrations/supabase/types';
import { getOrCreateProfile } from '@/lib/profileUtils';

interface DashboardStats {
  flashcardsDue: number;
  totalFlashcards: number;
  questionsAnswered: number;
  correctRate: number;
  studyStreak: number;
  xpPoints: number;
  level: number;
  subjectsCount: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    flashcardsDue: 0,
    totalFlashcards: 0,
    questionsAnswered: 0,
    correctRate: 0,
    studyStreak: 7,
    xpPoints: 0,
    level: 1,
    subjectsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [nextAction, setNextAction] = useState<NextBestAction | null>(null);
  const [hasOnboarding, setHasOnboarding] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      // Ensure profile exists before loading stats
      await getOrCreateProfile(user!.id);
      
      const [flashcardsRes, subjectsRes, profileRes, attemptsRes, preferencesRes] = await Promise.all([
        supabase.from('flashcards').select('id, next_review').eq('user_id', user!.id),
        supabase.from('subjects').select('id').eq('user_id', user!.id),
        supabase.from('profiles').select('xp_points, level').eq('user_id', user!.id).maybeSingle(),
        supabase.from('question_attempts').select('is_correct').eq('user_id', user!.id),
        supabase.from('user_preferences').select('onboarding_completed').eq('user_id', user!.id).maybeSingle(),
      ]);

      const now = new Date();
      const dueFlashcards = flashcardsRes.data?.filter(
        f => new Date(f.next_review) <= now
      ).length || 0;

      const correctAnswers = attemptsRes.data?.filter(a => a.is_correct).length || 0;
      const totalAnswers = attemptsRes.data?.length || 0;

      const hasOnboardingData = preferencesRes.data?.onboarding_completed === true;
      setHasOnboarding(hasOnboardingData);

      setStats({
        flashcardsDue: dueFlashcards,
        totalFlashcards: flashcardsRes.data?.length || 0,
        questionsAnswered: totalAnswers,
        correctRate: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
        studyStreak: 7,
        xpPoints: profileRes.data?.xp_points || 0,
        level: profileRes.data?.level || 1,
        subjectsCount: subjectsRes.data?.length || 0,
      });

      // Calculate Next Best Action
      if (user) {
        const userState = await getUserState(user.id);
        const action = calculateNextBestAction(userState);
        setNextAction(action);

        // Redirect to onboarding if not completed
        if (!hasOnboardingData && userState.subjectsCount === 0) {
          // Don't auto-redirect, show CTA instead
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextAction = () => {
    if (nextAction) {
      navigate(nextAction.path);
    }
  };

  const xpForNextLevel = stats.level * 1000;
  const xpProgress = (stats.xpPoints % 1000) / 10;

  const statCards = [
    { 
      icon: Brain, 
      label: 'Flashcards Pendentes', 
      value: stats.flashcardsDue,
      subtext: `de ${stats.totalFlashcards} total`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      link: '/flashcards'
    },
    { 
      icon: ClipboardList, 
      label: 'Questões Respondidas', 
      value: stats.questionsAnswered,
      subtext: `${stats.correctRate}% de acerto`,
      color: 'text-success',
      bgColor: 'bg-success/10',
      link: '/questoes'
    },
    { 
      icon: Flame, 
      label: 'Sequência de Estudo', 
      value: `${stats.studyStreak} dias`,
      subtext: 'Continue assim!',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      link: '/conquistas'
    },
    { 
      icon: BookOpen, 
      label: 'Matérias', 
      value: stats.subjectsCount,
      subtext: 'cadastradas',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      link: '/materias'
    },
  ];

  const quickActions = [
    { icon: Brain, label: 'Revisar Flashcards', path: '/flashcards', color: 'bg-primary' },
    { icon: ClipboardList, label: 'Fazer Simulado', path: '/questoes', color: 'bg-success' },
    { icon: Wand2, label: 'Importar Conteúdo', path: '/importar', color: 'bg-accent' },
    { icon: Calendar, label: 'Ver Agenda', path: '/agenda', color: 'bg-warning' },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold font-display">
              Olá, {user?.user_metadata?.full_name?.split(' ')[0] || 'Estudante'}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Vamos continuar sua jornada de aprendizado
            </p>
          </div>

          {/* XP & Level */}
          <Card className="w-full sm:w-auto">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
                {stats.level}
              </div>
              <div className="flex-1 min-w-[120px]">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">Nível {stats.level}</span>
                  <span className="text-muted-foreground">{stats.xpPoints} XP</span>
                </div>
                <Progress value={xpProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {xpForNextLevel - (stats.xpPoints % 1000)} XP para o próximo nível
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold font-display mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <Link key={action.path} to={action.path}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="group cursor-pointer"
                >
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Next Best Action - Smart Recommendation */}
        {nextAction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">
                      {getActionIcon(nextAction.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary uppercase tracking-wide">Próximo Passo</span>
                        <span className="text-xs text-muted-foreground">• {nextAction.estimatedMinutes} min</span>
                        <span className="text-xs text-success font-medium">+{nextAction.xpReward} XP</span>
                      </div>
                      <h3 className="text-lg font-semibold font-display">{nextAction.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{nextAction.description}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleNextAction}
                    className="gap-2 shrink-0"
                    size="lg"
                  >
                    {nextAction.cta}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold font-display mb-4">Seu Progresso</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
              <Link key={stat.label} to={stat.link}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                >
                  <Card className="stat-card cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="mt-4">
                        <p className="text-2xl font-bold font-display">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Daily Review CTA */}
        {stats.flashcardsDue > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground overflow-hidden">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
                    <Brain className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display">
                      {stats.flashcardsDue} flashcards para revisar hoje
                    </h3>
                    <p className="text-primary-foreground/80">
                      Complete sua revisão diária para manter o progresso
                    </p>
                  </div>
                </div>
                <Link to="/flashcards">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Play className="w-5 h-5" />
                    Começar Revisão
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Study Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Target className="w-5 h-5 text-primary" />
                Dica do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                💡 <strong>Técnica de Revisão Espaçada:</strong> Estudar um pouco todos os dias 
                é mais eficiente do que estudar muito em um só dia. O MEDTRACK usa algoritmos 
                de repetição espaçada para otimizar sua memorização!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
