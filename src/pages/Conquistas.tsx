import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Star, Flame, Target, BookOpen, Brain,
  Zap, Calendar, Award, Lock, Check, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'study' | 'streak' | 'mastery' | 'special';
  requirement: number;
  currentProgress: number;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface UserStats {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  flashcardsReviewed: number;
  questionsAnswered: number;
  summariesCreated: number;
  studyHours: number;
}

export default function Conquistas() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    flashcardsReviewed: 0,
    questionsAnswered: 0,
    summariesCreated: 0,
    studyHours: 0,
  });

  const achievements: Achievement[] = [
    // Study achievements
    {
      id: 'first_flashcard',
      name: 'Primeiro Passo',
      description: 'Revise seu primeiro flashcard',
      icon: <BookOpen className="h-6 w-6" />,
      category: 'study',
      requirement: 1,
      currentProgress: stats.flashcardsReviewed,
      xpReward: 10,
      unlocked: stats.flashcardsReviewed >= 1,
    },
    {
      id: 'flashcard_100',
      name: 'Estudante Dedicado',
      description: 'Revise 100 flashcards',
      icon: <BookOpen className="h-6 w-6" />,
      category: 'study',
      requirement: 100,
      currentProgress: stats.flashcardsReviewed,
      xpReward: 100,
      unlocked: stats.flashcardsReviewed >= 100,
    },
    {
      id: 'flashcard_500',
      name: 'Mestre dos Cards',
      description: 'Revise 500 flashcards',
      icon: <BookOpen className="h-6 w-6" />,
      category: 'study',
      requirement: 500,
      currentProgress: stats.flashcardsReviewed,
      xpReward: 500,
      unlocked: stats.flashcardsReviewed >= 500,
    },
    {
      id: 'question_50',
      name: 'Questionador',
      description: 'Responda 50 questões',
      icon: <Target className="h-6 w-6" />,
      category: 'study',
      requirement: 50,
      currentProgress: stats.questionsAnswered,
      xpReward: 50,
      unlocked: stats.questionsAnswered >= 50,
    },
    {
      id: 'question_200',
      name: 'Expert em Questões',
      description: 'Responda 200 questões',
      icon: <Target className="h-6 w-6" />,
      category: 'study',
      requirement: 200,
      currentProgress: stats.questionsAnswered,
      xpReward: 200,
      unlocked: stats.questionsAnswered >= 200,
    },

    // Streak achievements
    {
      id: 'streak_3',
      name: 'Consistência',
      description: 'Mantenha uma sequência de 3 dias',
      icon: <Flame className="h-6 w-6" />,
      category: 'streak',
      requirement: 3,
      currentProgress: stats.currentStreak,
      xpReward: 30,
      unlocked: stats.longestStreak >= 3,
    },
    {
      id: 'streak_7',
      name: 'Semana Perfeita',
      description: 'Estude por 7 dias seguidos',
      icon: <Flame className="h-6 w-6" />,
      category: 'streak',
      requirement: 7,
      currentProgress: stats.currentStreak,
      xpReward: 70,
      unlocked: stats.longestStreak >= 7,
    },
    {
      id: 'streak_30',
      name: 'Mês de Ferro',
      description: 'Mantenha uma sequência de 30 dias',
      icon: <Flame className="h-6 w-6" />,
      category: 'streak',
      requirement: 30,
      currentProgress: stats.currentStreak,
      xpReward: 300,
      unlocked: stats.longestStreak >= 30,
    },

    // Mastery achievements
    {
      id: 'level_5',
      name: 'Estudante Aplicado',
      description: 'Alcance o nível 5',
      icon: <Star className="h-6 w-6" />,
      category: 'mastery',
      requirement: 5,
      currentProgress: stats.level,
      xpReward: 100,
      unlocked: stats.level >= 5,
    },
    {
      id: 'level_10',
      name: 'Acadêmico',
      description: 'Alcance o nível 10',
      icon: <Star className="h-6 w-6" />,
      category: 'mastery',
      requirement: 10,
      currentProgress: stats.level,
      xpReward: 200,
      unlocked: stats.level >= 10,
    },
    {
      id: 'xp_1000',
      name: 'Mil Pontos',
      description: 'Acumule 1000 XP',
      icon: <Zap className="h-6 w-6" />,
      category: 'mastery',
      requirement: 1000,
      currentProgress: stats.totalXP,
      xpReward: 100,
      unlocked: stats.totalXP >= 1000,
    },

    // Special achievements
    {
      id: 'summary_10',
      name: 'Escritor',
      description: 'Crie 10 resumos',
      icon: <Brain className="h-6 w-6" />,
      category: 'special',
      requirement: 10,
      currentProgress: stats.summariesCreated,
      xpReward: 100,
      unlocked: stats.summariesCreated >= 10,
    },
    {
      id: 'early_bird',
      name: 'Madrugador',
      description: 'Estude antes das 7h da manhã',
      icon: <Calendar className="h-6 w-6" />,
      category: 'special',
      requirement: 1,
      currentProgress: 0,
      xpReward: 50,
      unlocked: false,
    },
  ];

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    // Load profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp_points, level')
      .eq('user_id', user?.id)
      .single();

    // Load flashcard count
    const { count: flashcardCount } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id);

    // Load question attempts
    const { count: questionCount } = await supabase
      .from('question_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id);

    // Load summaries
    const { count: summaryCount } = await supabase
      .from('summaries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id);

    setStats({
      totalXP: profile?.xp_points || 0,
      level: profile?.level || 1,
      currentStreak: 0,
      longestStreak: 0,
      flashcardsReviewed: flashcardCount || 0,
      questionsAnswered: questionCount || 0,
      summariesCreated: summaryCount || 0,
      studyHours: 0,
    });
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXPFromAchievements = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);

  const categoryLabels = {
    study: 'Estudo',
    streak: 'Sequência',
    mastery: 'Maestria',
    special: 'Especiais',
  };

  const categoryIcons = {
    study: <BookOpen className="h-4 w-4" />,
    streak: <Flame className="h-4 w-4" />,
    mastery: <Star className="h-4 w-4" />,
    special: <Award className="h-4 w-4" />,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Conquistas
          </h1>
          <p className="text-muted-foreground mt-1">Acompanhe seu progresso e desbloqueie recompensas</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                <div className="text-2xl font-bold">{unlockedCount}/{achievements.length}</div>
                <div className="text-sm text-muted-foreground">Conquistas</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold">{stats.totalXP}</div>
                <div className="text-sm text-muted-foreground">XP Total</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Star className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-bold">{stats.level}</div>
                <div className="text-sm text-muted-foreground">Nível</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Flame className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <div className="text-2xl font-bold">{stats.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Dias seguidos</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  Nível {stats.level}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {stats.totalXP} XP
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                Próximo nível: {(stats.level + 1) * 100} XP
              </span>
            </div>
            <Progress value={(stats.totalXP % 100)} />
          </CardContent>
        </Card>

        {/* Achievements by Category */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="study">{categoryLabels.study}</TabsTrigger>
            <TabsTrigger value="streak">{categoryLabels.streak}</TabsTrigger>
            <TabsTrigger value="mastery">{categoryLabels.mastery}</TabsTrigger>
            <TabsTrigger value="special">{categoryLabels.special}</TabsTrigger>
          </TabsList>

          {['all', 'study', 'streak', 'mastery', 'special'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements
                  .filter((a) => tab === 'all' || a.category === tab)
                  .map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={achievement.unlocked ? 'border-yellow-500/50 bg-yellow-500/5' : 'opacity-75'}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${
                              achievement.unlocked
                                ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {achievement.unlocked ? achievement.icon : <Lock className="h-6 w-6" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{achievement.name}</h3>
                                {achievement.unlocked && (
                                  <Check className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {achievement.description}
                              </p>
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span>
                                    {Math.min(achievement.currentProgress, achievement.requirement)} / {achievement.requirement}
                                  </span>
                                  <Badge variant="secondary" className="text-xs">
                                    +{achievement.xpReward} XP
                                  </Badge>
                                </div>
                                <Progress
                                  value={(achievement.currentProgress / achievement.requirement) * 100}
                                  className="h-2"
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
