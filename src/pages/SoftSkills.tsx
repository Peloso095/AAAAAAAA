import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Users, Brain, FileText, 
  CheckCircle, Play, BookOpen, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  lessons: {
    id: string;
    title: string;
    content: string[];
    tips: string[];
    scenarios?: {
      situation: string;
      goodResponse: string;
      badResponse: string;
    }[];
  }[];
}

const MODULES: Module[] = [
  {
    id: 'communication',
    title: 'Comunicação com o Paciente',
    description: 'Técnicas de comunicação efetiva e empática',
    icon: <MessageSquare className="h-6 w-6" />,
    lessons: [
      {
        id: '1',
        title: 'Escuta Ativa',
        content: [
          'A escuta ativa envolve ouvir com atenção total, sem interromper.',
          'Demonstre interesse através de linguagem corporal: contato visual, acenos.',
          'Parafraseie o que o paciente disse para confirmar entendimento.',
          'Evite julgamentos ou conclusões precipitadas.',
        ],
        tips: [
          'Silencie o celular durante a consulta',
          'Não olhe para o computador enquanto o paciente fala',
          'Use frases como "Entendo..." ou "Continue..."',
        ],
        scenarios: [
          {
            situation: 'Paciente está explicando seus sintomas de forma confusa e desorganizada.',
            goodResponse: '"Deixe-me ver se entendi corretamente: você está sentindo dor de cabeça há 3 dias, que piora à tarde. É isso mesmo?"',
            badResponse: '"Tá, tá... você tem dor de cabeça. Deixa eu prescrever um analgésico."',
          },
        ],
      },
      {
        id: '2',
        title: 'Comunicação de Más Notícias (SPIKES)',
        content: [
          'S - Setting: Prepare o ambiente (privacidade, tempo, acompanhante)',
          'P - Perception: Avalie o que o paciente já sabe',
          'I - Invitation: Pergunte quanto ele quer saber',
          'K - Knowledge: Dê a informação de forma clara e gradual',
          'E - Emotions: Responda às emoções com empatia',
          'S - Strategy: Discuta próximos passos',
        ],
        tips: [
          'Nunca dê más notícias por telefone',
          'Evite jargões médicos',
          'Permita silêncio para processamento',
          'Ofereça lenço de papel se necessário',
        ],
      },
      {
        id: '3',
        title: 'Linguagem Adequada',
        content: [
          'Adapte a linguagem ao nível de compreensão do paciente.',
          'Evite termos técnicos ou explique-os quando necessário.',
          'Use analogias para explicar conceitos complexos.',
          'Confirme a compreensão: "O que você entendeu sobre...?"',
        ],
        tips: [
          'Em vez de "hipertensão", diga "pressão alta"',
          'Use desenhos ou modelos quando possível',
          'Peça para o paciente repetir as orientações',
        ],
      },
    ],
  },
  {
    id: 'reasoning',
    title: 'Raciocínio Clínico',
    description: 'Métodos sistemáticos de pensamento diagnóstico',
    icon: <Brain className="h-6 w-6" />,
    lessons: [
      {
        id: '1',
        title: 'Método Hipotético-Dedutivo',
        content: [
          'Gere hipóteses diagnósticas precoces durante a anamnese.',
          'Busque dados que confirmem ou refutem cada hipótese.',
          'Priorize diagnósticos graves que não podem ser perdidos.',
          'Reavalie hipóteses à medida que novos dados surgem.',
        ],
        tips: [
          'Sempre considere: "O que eu não posso perder?"',
          'Liste mentalmente os diagnósticos mais prováveis',
          'Não se apegue à primeira hipótese',
        ],
      },
      {
        id: '2',
        title: 'Reconhecimento de Padrões',
        content: [
          'Desenvolva "scripts de doença" mentais para condições comuns.',
          'Compare a apresentação do paciente com padrões conhecidos.',
          'Identifique achados-chave que definem cada condição.',
          'Cuidado com vieses: nem tudo que parece pato é pato.',
        ],
        tips: [
          'Estude casos típicos de cada doença',
          'Pratique com casos simulados',
          'Revise diagnósticos que você errou',
        ],
      },
      {
        id: '3',
        title: 'Evitando Vieses Cognitivos',
        content: [
          'Viés de ancoragem: apegar-se à primeira impressão.',
          'Viés de disponibilidade: lembrar mais do que viu recentemente.',
          'Viés de confirmação: buscar só dados que confirmam a hipótese.',
          'Fechamento prematuro: parar de pensar muito cedo.',
        ],
        tips: [
          'Sempre pergunte: "O que mais poderia ser?"',
          'Revise o caso do zero quando algo não bate',
          'Discuta casos difíceis com colegas',
        ],
      },
    ],
  },
  {
    id: 'teamwork',
    title: 'Trabalho em Equipe',
    description: 'Colaboração interprofissional e liderança',
    icon: <Users className="h-6 w-6" />,
    lessons: [
      {
        id: '1',
        title: 'Comunicação em Equipe (SBAR)',
        content: [
          'S - Situation: Identifique-se e diga o motivo do contato.',
          'B - Background: Forneça contexto relevante.',
          'A - Assessment: Dê sua avaliação da situação.',
          'R - Recommendation: Sugira ação ou peça orientação.',
        ],
        tips: [
          'Use SBAR para passagens de plantão',
          'Seja objetivo e organizado',
          'Documente a comunicação',
        ],
        scenarios: [
          {
            situation: 'Você precisa ligar para o plantonista sobre um paciente.',
            goodResponse: '"Dr. Silva, aqui é João, R2 da enfermaria. Ligo sobre o Sr. Antônio, leito 12, 65 anos, internado por PAC, que está apresentando piora da dispneia há 1 hora, SpO2 caiu de 95% para 88%. Acredito que esteja evoluindo com SDRA. Gostaria de discutir a necessidade de transferência para UTI."',
            badResponse: '"Oi doutor, tem um paciente aqui que tá ruim, você pode vir ver?"',
          },
        ],
      },
      {
        id: '2',
        title: 'Liderança em Emergências',
        content: [
          'Assuma claramente o papel de líder.',
          'Delegue tarefas de forma clara e nominalmente.',
          'Solicite feedback após cada ação.',
          'Mantenha a calma e o tom de voz controlado.',
        ],
        tips: [
          'Diga "João, faça a massagem" em vez de "Alguém faça massagem"',
          'Solicite confirmação verbal: "João, entendeu?"',
          'Debriefe após o atendimento',
        ],
      },
    ],
  },
  {
    id: 'documentation',
    title: 'Registro e Documentação',
    description: 'Prontuário médico e evolução clínica',
    icon: <FileText className="h-6 w-6" />,
    lessons: [
      {
        id: '1',
        title: 'Evolução Médica (SOAP)',
        content: [
          'S - Subjetivo: Queixas do paciente, história.',
          'O - Objetivo: Exame físico, sinais vitais, exames.',
          'A - Avaliação: Diagnósticos e raciocínio clínico.',
          'P - Plano: Condutas, exames, medicações.',
        ],
        tips: [
          'Seja objetivo e claro',
          'Evite abreviações não padronizadas',
          'Documente tudo que foi orientado',
          'Nunca altere registros já salvos',
        ],
      },
      {
        id: '2',
        title: 'Princípios Éticos da Documentação',
        content: [
          'O prontuário é documento médico-legal.',
          'Registre apenas o que foi realmente feito/observado.',
          'Documente comunicação com familiares e equipe.',
          'Mantenha sigilo e confidencialidade.',
        ],
        tips: [
          'Corrija erros com traço único, data e assinatura',
          'Nunca deixe espaços em branco',
          'Assine e carimbe todas as anotações',
        ],
      },
    ],
  },
];

export default function SoftSkills() {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  const getModuleProgress = (module: Module) => {
    const completed = module.lessons.filter((l) => completedLessons.has(`${module.id}-${l.id}`)).length;
    return (completed / module.lessons.length) * 100;
  };

  if (!selectedModule) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Soft Skills Médicas</h1>
            <p className="text-muted-foreground mt-1">Desenvolva competências essenciais para a prática médica</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {MODULES.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors h-full"
                  onClick={() => setSelectedModule(module)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        {module.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription className="mt-1">{module.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{module.lessons.length} lições</span>
                        <span className="font-medium">{Math.round(getModuleProgress(module))}% concluído</span>
                      </div>
                      <Progress value={getModuleProgress(module)} />
                      <Button className="w-full" variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Módulo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentLesson = selectedModule.lessons.find((l) => l.id === selectedLesson);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              {selectedModule.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{selectedModule.title}</h1>
              <p className="text-muted-foreground">{selectedModule.description}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => setSelectedModule(null)}>
            Voltar
          </Button>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso do Módulo</span>
              <span className="text-sm text-muted-foreground">
                {selectedModule.lessons.filter((l) => completedLessons.has(`${selectedModule.id}-${l.id}`)).length} / {selectedModule.lessons.length} lições
              </span>
            </div>
            <Progress value={getModuleProgress(selectedModule)} />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lesson List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Lições
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedModule.lessons.map((lesson, index) => {
                  const lessonKey = `${selectedModule.id}-${lesson.id}`;
                  const isCompleted = completedLessons.has(lessonKey);
                  return (
                    <motion.button
                      key={lesson.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedLesson(lesson.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedLesson === lesson.id
                          ? 'bg-primary text-primary-foreground'
                          : isCompleted
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted ? 'bg-green-500 text-white' : 'bg-background'
                        }`}>
                          {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                        </div>
                        <span className="text-sm font-medium">{lesson.title}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-2">
            {currentLesson ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{currentLesson.title}</CardTitle>
                    <Button
                      variant={completedLessons.has(`${selectedModule.id}-${currentLesson.id}`) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleLessonComplete(`${selectedModule.id}-${currentLesson.id}`)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {completedLessons.has(`${selectedModule.id}-${currentLesson.id}`) ? 'Concluída' : 'Marcar como concluída'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Content */}
                  <div className="space-y-3">
                    {currentLesson.content.map((paragraph, i) => (
                      <p key={i} className="text-sm leading-relaxed">{paragraph}</p>
                    ))}
                  </div>

                  {/* Tips */}
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      💡 Dicas Práticas
                    </h4>
                    <ul className="space-y-2">
                      {currentLesson.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Scenarios */}
                  {currentLesson.scenarios && currentLesson.scenarios.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">📝 Cenários Práticos</h4>
                      {currentLesson.scenarios.map((scenario, i) => (
                        <div key={i} className="border rounded-lg overflow-hidden">
                          <div className="p-4 bg-muted">
                            <p className="text-sm font-medium">{scenario.situation}</p>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                              <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                                ✅ Boa Resposta:
                              </div>
                              <p className="text-sm">{scenario.goodResponse}</p>
                            </div>
                            <div className="p-3 bg-red-500/10 rounded-lg">
                              <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                                ❌ Resposta a Evitar:
                              </div>
                              <p className="text-sm">{scenario.badResponse}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[400px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma lição para começar</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
