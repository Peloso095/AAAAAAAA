import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Zap, Clock, Brain, BookOpen, FileText, 
  Play, Pause, RotateCcw, Check, X, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface StudySession {
  flashcardsReviewed: number;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number;
}

export default function CramMode() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [studyTime, setStudyTime] = useState(30); // minutes
  const [isStudying, setIsStudying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [session, setSession] = useState<StudySession>({
    flashcardsReviewed: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    timeSpent: 0,
  });
  const [currentMode, setCurrentMode] = useState<'flashcard' | 'question'>('flashcard');
  const [showAnswer, setShowAnswer] = useState(false);

  // Sample flashcard for demo
  const [currentCard] = useState({
    front: 'Qual é o tratamento de primeira linha para IC com FE reduzida?',
    back: 'Os 4 pilares do tratamento são:\n1. IECA/BRA ou Sacubitril-Valsartana\n2. Beta-bloqueador\n3. Antagonista mineralocorticoide (Espironolactona)\n4. iSGLT2 (Dapagliflozina ou Empagliflozina)',
  });

  // Sample question for demo
  const [currentQuestion] = useState({
    question: 'Paciente de 65 anos, diabético e hipertenso, apresenta dispneia aos esforços progressiva há 2 meses. Ecocardiograma mostra FE de 35%. Qual medicação NÃO faz parte do tratamento otimizado?',
    options: ['Carvedilol', 'Enalapril', 'Espironolactona', 'Anlodipino'],
    correctIndex: 3,
  });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadSubjects();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStudying && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((t) => t - 1);
        setSession((s) => ({ ...s, timeSpent: s.timeSpent + 1 }));
      }, 1000);
    } else if (timeRemaining === 0 && isStudying) {
      setIsStudying(false);
    }
    return () => clearInterval(interval);
  }, [isStudying, isPaused, timeRemaining]);

  const loadSubjects = async () => {
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', user?.id);
    if (data) {
      setSubjects(data);
    }
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const startStudy = () => {
    setTimeRemaining(studyTime * 60);
    setIsStudying(true);
    setIsPaused(false);
    setSession({
      flashcardsReviewed: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      timeSpent: 0,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFlashcardResponse = (quality: number) => {
    setSession((s) => ({
      ...s,
      flashcardsReviewed: s.flashcardsReviewed + 1,
    }));
    setShowAnswer(false);
    // In production, load next card
  };

  const handleQuestionAnswer = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    const isCorrect = optionIndex === currentQuestion.correctIndex;
    setSession((s) => ({
      ...s,
      questionsAnswered: s.questionsAnswered + 1,
      correctAnswers: s.correctAnswers + (isCorrect ? 1 : 0),
    }));
  };

  if (!isStudying) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Zap className="h-8 w-8 text-yellow-500" />
              Modo Revisão Rápida
            </h1>
            <p className="text-muted-foreground mt-1">Estudo otimizado antes de provas</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurar Sessão</CardTitle>
                <CardDescription>Personalize sua revisão intensiva</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Study Time */}
                <div className="space-y-2">
                  <Label>Tempo de Estudo</Label>
                  <div className="flex gap-2">
                    {[15, 30, 45, 60, 90].map((time) => (
                      <Button
                        key={time}
                        variant={studyTime === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStudyTime(time)}
                      >
                        {time}min
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Subject Selection */}
                <div className="space-y-2">
                  <Label>Matérias</Label>
                  {subjects.length > 0 ? (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {subjects.map((subject) => (
                        <label
                          key={subject.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedSubjects.includes(subject.id)
                              ? 'bg-primary/10 border border-primary'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          <Checkbox
                            checked={selectedSubjects.includes(subject.id)}
                            onCheckedChange={() => toggleSubject(subject.id)}
                          />
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="text-sm">{subject.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma matéria cadastrada. Crie matérias primeiro.
                    </p>
                  )}
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={startStudy}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Iniciar Revisão Rápida
                </Button>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">O que o CRAM Mode oferece</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Flashcards Intensivos</h4>
                    <p className="text-sm text-muted-foreground">
                      Cards com maior frequência de erro aparecem mais vezes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Questões Focadas</h4>
                    <p className="text-sm text-muted-foreground">
                      Questões filtradas por tema e dificuldade
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Resumos Compactos</h4>
                    <p className="text-sm text-muted-foreground">
                      Acesso rápido aos pontos-chave de cada tema
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Timer Pomodoro</h4>
                    <p className="text-sm text-muted-foreground">
                      Sessões cronometradas para máximo foco
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Active Study Session
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-mono font-bold ${timeRemaining < 60 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
              {formatTime(timeRemaining)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsStudying(false)}
              >
                Encerrar
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg">{session.flashcardsReviewed}</div>
              <div className="text-muted-foreground">Flashcards</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{session.questionsAnswered}</div>
              <div className="text-muted-foreground">Questões</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">
                {session.questionsAnswered > 0
                  ? Math.round((session.correctAnswers / session.questionsAnswered) * 100)
                  : 0}%
              </div>
              <div className="text-muted-foreground">Acertos</div>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2">
          <Button
            variant={currentMode === 'flashcard' ? 'default' : 'outline'}
            onClick={() => setCurrentMode('flashcard')}
          >
            <Brain className="h-4 w-4 mr-2" />
            Flashcards
          </Button>
          <Button
            variant={currentMode === 'question' ? 'default' : 'outline'}
            onClick={() => setCurrentMode('question')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Questões
          </Button>
        </div>

        {/* Study Content */}
        <AnimatePresence mode="wait">
          {currentMode === 'flashcard' ? (
            <motion.div
              key="flashcard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-8">
                  <div
                    className="min-h-[300px] flex items-center justify-center cursor-pointer"
                    onClick={() => setShowAnswer(!showAnswer)}
                  >
                    <AnimatePresence mode="wait">
                      {!showAnswer ? (
                        <motion.div
                          key="front"
                          initial={{ rotateY: 180 }}
                          animate={{ rotateY: 0 }}
                          exit={{ rotateY: -180 }}
                          className="text-center"
                        >
                          <p className="text-xl">{currentCard.front}</p>
                          <p className="text-sm text-muted-foreground mt-4">
                            Clique para ver a resposta
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="back"
                          initial={{ rotateY: -180 }}
                          animate={{ rotateY: 0 }}
                          exit={{ rotateY: 180 }}
                          className="text-center"
                        >
                          <div className="whitespace-pre-line text-lg">
                            {currentCard.back}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {showAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center gap-4 mt-6"
                    >
                      <Button
                        variant="destructive"
                        onClick={() => handleFlashcardResponse(1)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Não lembrei
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleFlashcardResponse(3)}
                      >
                        Difícil
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleFlashcardResponse(4)}
                      >
                        Bom
                      </Button>
                      <Button
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleFlashcardResponse(5)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Fácil
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-8 space-y-6">
                  <p className="text-lg">{currentQuestion.question}</p>

                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedOption === index;
                      const isCorrect = index === currentQuestion.correctIndex;
                      const showResult = selectedOption !== null;

                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className={`w-full justify-start text-left h-auto py-3 px-4 ${
                            showResult
                              ? isCorrect
                                ? 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-400'
                                : isSelected
                                ? 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-400'
                                : ''
                              : ''
                          }`}
                          onClick={() => !showResult && handleQuestionAnswer(index)}
                          disabled={showResult}
                        >
                          <span className="font-medium mr-3">
                            {String.fromCharCode(65 + index)}
                          </span>
                          {option}
                          {showResult && isCorrect && (
                            <Check className="h-4 w-4 ml-auto text-green-500" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <X className="h-4 w-4 ml-auto text-red-500" />
                          )}
                        </Button>
                      );
                    })}
                  </div>

                  {selectedOption !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Button
                        className="w-full"
                        onClick={() => setSelectedOption(null)}
                      >
                        <ChevronRight className="h-4 w-4 mr-2" />
                        Próxima Questão
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
