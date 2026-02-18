import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  ClipboardList, 
  Check, 
  X, 
  Play,
  Trophy,
  BarChart3,
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  subject_id: string | null;
}

interface Subject {
  id: string;
  name: string;
}

export default function Questoes() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, correct: 0 });
  
  // New question form
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);
  const [newExplanation, setNewExplanation] = useState('');
  const [newSubjectId, setNewSubjectId] = useState<string>('none');

  // Exam mode
  const [isExamMode, setIsExamMode] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [examAnswers, setExamAnswers] = useState<{ questionId: string; selected: number; correct: boolean }[]>([]);
  const [examComplete, setExamComplete] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [questionsRes, subjectsRes, attemptsRes] = await Promise.all([
        supabase.from('questions').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
        supabase.from('subjects').select('id, name').eq('user_id', user!.id),
        supabase.from('question_attempts').select('is_correct').eq('user_id', user!.id)
      ]);

      if (questionsRes.error) throw questionsRes.error;
      
      const parsedQuestions = (questionsRes.data || []).map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as unknown as string || '[]')
      }));
      
      setQuestions(parsedQuestions);
      setSubjects(subjectsRes.data || []);
      
      const attempts = attemptsRes.data || [];
      setStats({
        total: attempts.length,
        correct: attempts.filter(a => a.is_correct).length
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar questões');
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async () => {
    if (!newQuestion.trim() || newOptions.filter(o => o.trim()).length < 2) {
      toast.error('Preencha a pergunta e pelo menos 2 opções');
      return;
    }

    try {
      const { error } = await supabase.from('questions').insert({
        user_id: user!.id,
        question: newQuestion.trim(),
        options: newOptions.filter(o => o.trim()),
        correct_answer: newCorrectAnswer,
        explanation: newExplanation.trim() || null,
        subject_id: newSubjectId === 'none' ? null : newSubjectId
      });

      if (error) throw error;

      toast.success('Questão criada!');
      setNewQuestion('');
      setNewOptions(['', '', '', '']);
      setNewCorrectAnswer(0);
      setNewExplanation('');
      setNewSubjectId('none');
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao criar questão');
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Questão removida');
      loadData();
    } catch (error) {
      toast.error('Erro ao remover questão');
    }
  };

  const startExam = () => {
    if (questions.length === 0) {
      toast.info('Adicione questões primeiro');
      return;
    }
    // Shuffle and take up to 10 questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 10);
    setExamQuestions(shuffled);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setExamAnswers([]);
    setExamComplete(false);
    setIsExamMode(true);
  };

  const submitAnswer = async () => {
    if (selectedAnswer === null) {
      toast.error('Selecione uma resposta');
      return;
    }

    const question = examQuestions[currentQuestion];
    const isCorrect = selectedAnswer === question.correct_answer;

    // Save attempt
    try {
      await supabase.from('question_attempts').insert({
        user_id: user!.id,
        question_id: question.id,
        selected_answer: selectedAnswer,
        is_correct: isCorrect
      });
    } catch (error) {
      console.error('Error saving attempt:', error);
    }

    setExamAnswers([...examAnswers, { 
      questionId: question.id, 
      selected: selectedAnswer, 
      correct: isCorrect 
    }]);
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < examQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setExamComplete(true);
    }
  };

  const endExam = () => {
    setIsExamMode(false);
    loadData();
  };

  const correctRate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  if (isExamMode) {
    const question = examQuestions[currentQuestion];
    const currentAnswer = examAnswers.find(a => a.questionId === question?.id);

    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={endExam}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Encerrar
            </Button>
            <span className="text-sm text-muted-foreground">
              Questão {currentQuestion + 1} de {examQuestions.length}
            </span>
          </div>

          <Progress value={((currentQuestion + 1) / examQuestions.length) * 100} className="mb-6" />

          {examComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold font-display mb-2">Simulado Concluído!</h2>
              <p className="text-4xl font-bold text-primary mb-2">
                {examAnswers.filter(a => a.correct).length} / {examQuestions.length}
              </p>
              <p className="text-muted-foreground mb-6">
                {Math.round((examAnswers.filter(a => a.correct).length / examQuestions.length) * 100)}% de acerto
              </p>
              <Button onClick={endExam}>Voltar</Button>
            </motion.div>
          ) : question ? (
            <Card>
              <CardContent className="p-6 space-y-6">
                <p className="text-lg font-medium">{question.question}</p>

                <RadioGroup
                  value={selectedAnswer?.toString()}
                  onValueChange={(v) => !showResult && setSelectedAnswer(parseInt(v))}
                  className="space-y-3"
                >
                  {question.options.map((option, index) => {
                    let optionClass = 'border-border';
                    if (showResult) {
                      if (index === question.correct_answer) {
                        optionClass = 'border-success bg-success/10';
                      } else if (index === selectedAnswer && index !== question.correct_answer) {
                        optionClass = 'border-destructive bg-destructive/10';
                      }
                    }

                    return (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${optionClass} ${
                          !showResult ? 'hover:bg-muted cursor-pointer' : ''
                        }`}
                      >
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={showResult} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                        {showResult && index === question.correct_answer && (
                          <Check className="w-5 h-5 text-success" />
                        )}
                        {showResult && index === selectedAnswer && index !== question.correct_answer && (
                          <X className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>

                {showResult && question.explanation && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Explicação:</p>
                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  {!showResult ? (
                    <Button onClick={submitAnswer}>Confirmar</Button>
                  ) : (
                    <Button onClick={nextQuestion}>
                      {currentQuestion < examQuestions.length - 1 ? 'Próxima' : 'Ver Resultado'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display">Banco de Questões</h1>
            <p className="text-muted-foreground">Pratique com simulados e acompanhe seu desempenho</p>
          </div>
          
          <div className="flex gap-3">
            {questions.length > 0 && (
              <Button onClick={startExam} className="gap-2">
                <Play className="w-4 h-4" />
                Iniciar Simulado
              </Button>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Questão
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Questão</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Matéria (opcional)</Label>
                    <Select value={newSubjectId} onValueChange={setNewSubjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem matéria</SelectItem>
                        {subjects.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Enunciado</Label>
                    <Textarea 
                      placeholder="Digite a pergunta..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Alternativas (marque a correta)</Label>
                    {newOptions.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct"
                          checked={newCorrectAnswer === index}
                          onChange={() => setNewCorrectAnswer(index)}
                          className="w-4 h-4"
                        />
                        <Input 
                          placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                          value={option}
                          onChange={(e) => {
                            const updated = [...newOptions];
                            updated[index] = e.target.value;
                            setNewOptions(updated);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Explicação (opcional)</Label>
                    <Textarea 
                      placeholder="Explique a resposta correta..."
                      value={newExplanation}
                      onChange={(e) => setNewExplanation(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <Button onClick={createQuestion} className="w-full">
                    Criar Questão
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{questions.length}</p>
                <p className="text-sm text-muted-foreground">Questões</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Respondidas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{correctRate}%</p>
                <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : questions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma questão</h3>
              <p className="text-muted-foreground mb-4">Adicione suas questões</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Questão
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card>
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium line-clamp-2">{q.question}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {q.options.length} alternativas
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteQuestion(q.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
