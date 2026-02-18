import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Brain, 
  Check, 
  X, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Zap,
  Clock,
  Trash2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject_id: string | null;
  next_review: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

export default function Flashcards() {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newSubjectId, setNewSubjectId] = useState<string>('none');
  
  // Study mode
  const [isStudying, setIsStudying] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [flashcardsRes, subjectsRes] = await Promise.all([
        supabase.from('flashcards').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
        supabase.from('subjects').select('id, name, color').eq('user_id', user!.id)
      ]);

      if (flashcardsRes.error) throw flashcardsRes.error;
      if (subjectsRes.error) throw subjectsRes.error;

      const cards = flashcardsRes.data || [];
      setFlashcards(cards);
      setSubjects(subjectsRes.data || []);

      const now = new Date();
      const due = cards.filter(card => new Date(card.next_review) <= now);
      setDueCards(due);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar flashcards');
    } finally {
      setLoading(false);
    }
  };

  const createFlashcard = async () => {
    if (!newFront.trim() || !newBack.trim()) {
      toast.error('Preencha frente e verso');
      return;
    }

    try {
      const { error } = await supabase.from('flashcards').insert({
        user_id: user!.id,
        front: newFront.trim(),
        back: newBack.trim(),
        subject_id: newSubjectId === 'none' ? null : newSubjectId
      });

      if (error) throw error;

      toast.success('Flashcard criado!');
      setNewFront('');
      setNewBack('');
      setNewSubjectId('none');
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao criar flashcard');
    }
  };

  const deleteFlashcard = async (id: string) => {
    try {
      const { error } = await supabase.from('flashcards').delete().eq('id', id);
      if (error) throw error;
      toast.success('Flashcard removido');
      loadData();
    } catch (error) {
      toast.error('Erro ao remover flashcard');
    }
  };

  // SRS Algorithm (SM-2 based)
  const reviewCard = async (quality: number) => {
    const card = dueCards[currentCardIndex];
    if (!card) return;

    let { ease_factor, interval, repetitions } = card;

    if (quality < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 3;
      } else {
        interval = Math.round(interval * ease_factor);
      }
      repetitions += 1;
    }

    ease_factor = Math.max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    try {
      const { error } = await supabase
        .from('flashcards')
        .update({
          ease_factor,
          interval,
          repetitions,
          next_review: nextReview.toISOString()
        })
        .eq('id', card.id);

      if (error) throw error;

      // Move to next card
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
      } else {
        setStudyComplete(true);
        toast.success('Sessão de estudo concluída! 🎉');
      }
    } catch (error) {
      toast.error('Erro ao atualizar flashcard');
    }
  };

  const startStudy = () => {
    if (dueCards.length === 0) {
      toast.info('Nenhum flashcard para revisar agora');
      return;
    }
    setIsStudying(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyComplete(false);
  };

  const endStudy = () => {
    setIsStudying(false);
    loadData();
  };

  const getSubjectName = (subjectId: string | null) => {
    if (!subjectId) return null;
    return subjects.find(s => s.id === subjectId)?.name || null;
  };

  const currentCard = dueCards[currentCardIndex];

  if (isStudying) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={endStudy}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentCardIndex + 1} / {dueCards.length}
            </span>
          </div>

          {studyComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-success" />
              </div>
              <h2 className="text-2xl font-bold font-display mb-2">Parabéns!</h2>
              <p className="text-muted-foreground mb-6">
                Você revisou todos os {dueCards.length} flashcards de hoje
              </p>
              <Button onClick={endStudy}>Voltar ao Início</Button>
            </motion.div>
          ) : currentCard ? (
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCard.id + (isFlipped ? '-back' : '-front')}
                  initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className="min-h-[300px] cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <CardContent className="flex items-center justify-center h-[300px] p-8">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-4">
                          {isFlipped ? 'Resposta' : 'Pergunta'}
                        </p>
                        <p className="text-xl font-medium">
                          {isFlipped ? currentCard.back : currentCard.front}
                        </p>
                        {!isFlipped && (
                          <p className="text-sm text-muted-foreground mt-6">
                            Clique para ver a resposta
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-center text-sm text-muted-foreground">
                    Como foi sua lembrança?
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-col h-auto py-3 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => reviewCard(1)}
                    >
                      <X className="w-5 h-5 mb-1" />
                      <span className="text-xs">Errei</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-col h-auto py-3 border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                      onClick={() => reviewCard(2)}
                    >
                      <RotateCcw className="w-5 h-5 mb-1" />
                      <span className="text-xs">Difícil</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-col h-auto py-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => reviewCard(4)}
                    >
                      <Check className="w-5 h-5 mb-1" />
                      <span className="text-xs">Bom</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-col h-auto py-3 border-success text-success hover:bg-success hover:text-success-foreground"
                      onClick={() => reviewCard(5)}
                    >
                      <Zap className="w-5 h-5 mb-1" />
                      <span className="text-xs">Fácil</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
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
            <h1 className="text-3xl font-bold font-display">Flashcards</h1>
            <p className="text-muted-foreground">Revisão espaçada para memorização eficiente</p>
          </div>
          
          <div className="flex gap-3">
            {dueCards.length > 0 && (
              <Button onClick={startStudy} className="gap-2 bg-success hover:bg-success/90">
                <Brain className="w-4 h-4" />
                Revisar ({dueCards.length})
              </Button>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Card
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Flashcard</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Matéria (opcional)</Label>
                    <Select value={newSubjectId} onValueChange={setNewSubjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma matéria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem matéria</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Frente (Pergunta)</Label>
                    <Textarea 
                      placeholder="Digite a pergunta..."
                      value={newFront}
                      onChange={(e) => setNewFront(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Verso (Resposta)</Label>
                    <Textarea 
                      placeholder="Digite a resposta..."
                      value={newBack}
                      onChange={(e) => setNewBack(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button onClick={createFlashcard} className="w-full">
                    Criar Flashcard
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{flashcards.length}</p>
                <p className="text-sm text-muted-foreground">Total de Cards</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dueCards.length}</p>
                <p className="text-sm text-muted-foreground">Para Revisar</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{flashcards.length - dueCards.length}</p>
                <p className="text-sm text-muted-foreground">Aprendidos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flashcard List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : flashcards.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum flashcard</h3>
              <p className="text-muted-foreground mb-4">Crie seus primeiros flashcards</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Flashcard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      {card.subject_id && (
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          {getSubjectName(card.subject_id)}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto"
                        onClick={() => deleteFlashcard(card.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="font-medium mb-2 line-clamp-2">{card.front}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{card.back}</p>
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
