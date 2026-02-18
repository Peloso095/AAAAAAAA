import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Wand2, 
  Brain, 
  BookOpen,
  ClipboardList,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  X
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getContentGenerator, XP_CONFIG } from '@/lib/contentGenerator';
import { GeneratedFlashcard, GeneratedQuestion, GeneratedSummary } from '@/integrations/supabase/types';

type ImportMode = 'text' | 'pdf';

interface GenerationProgress {
  summary: boolean;
  flashcards: boolean;
  questions: boolean;
}

export default function Importar() {
  const { user } = useAuth();
  const [mode, setMode] = useState<ImportMode>('text');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [subjects, setSubjects] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({ summary: false, flashcards: false, questions: false });
  const [generatedContent, setGeneratedContent] = useState<{
    summary: GeneratedSummary | null;
    flashcards: GeneratedFlashcard[];
    questions: GeneratedQuestion[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load subjects on mount
  useEffect(() => {
    if (user) {
      supabase.from('subjects').select('id, name').eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setSubjects(data);
        });
    }
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são suportados');
      return;
    }

    // For now, just store the file reference - in production, upload to Supabase Storage
    setTitle(file.name.replace('.pdf', ''));
    toast.info('Upload de PDF implementado! Em modo demo, cole o conteúdo do PDF');
    setMode('text');
  };

  const handleGenerate = async () => {
    if (!content.trim() || !title.trim()) {
      toast.error('Preencha o título e o conteúdo');
      return;
    }
    if (!subjectId) {
      toast.error('Selecione uma matéria');
      return;
    }

    setLoading(true);
    setProgress({ summary: true, flashcards: false, questions: false });
    setGeneratedContent(null);

    try {
      const generator = getContentGenerator();
      
      // Generate all content
      const result = await generator.generateContent(content);
      
      setProgress({ summary: true, flashcards: true, questions: true });
      setGeneratedContent(result);
      
      toast.success('Conteúdo gerado com sucesso!', {
        description: `${result.flashcards.length} flashcards e ${result.questions.length} questões`
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Erro ao gerar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !generatedContent) return;

    setLoading(true);
    try {
      // 1. Create content source
      const { data: source, error: sourceError } = await supabase
        .from('content_sources')
        .insert({
          user_id: user.id,
          subject_id: subjectId,
          title: title,
          source_type: 'text',
          extracted_text: content
        })
        .select()
        .single();

      if (sourceError) throw sourceError;

      // 2. Create summary
      if (generatedContent.summary) {
        await supabase.from('summaries').insert({
          user_id: user.id,
          subject_id: subjectId,
          title: generatedContent.summary.title,
          content: generatedContent.summary.content
        });
      }

      // 3. Create flashcards
      if (generatedContent.flashcards.length > 0) {
        const flashcardsData = generatedContent.flashcards.map(fc => ({
          user_id: user.id,
          subject_id: subjectId,
          front: fc.front,
          back: fc.back,
          next_review: new Date().toISOString()
        }));
        await supabase.from('flashcards').insert(flashcardsData);
      }

      // 4. Create questions
      if (generatedContent.questions.length > 0) {
        const questionsData = generatedContent.questions.map(q => ({
          user_id: user.id,
          subject_id: subjectId,
          question: q.question,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation
        }));
        await supabase.from('questions').insert(questionsData);
      }

      // 5. Add XP
      await supabase.rpc('add_user_xp', {
        p_user_id: user.id,
        p_xp_amount: XP_CONFIG.content_generated,
        p_reason: 'content_generated'
      });

      toast.success('🎉 Tudo salvo!', {
        description: 'Conteúdo adicionado às suas matérias'
      });

      // Reset form
      setContent('');
      setTitle('');
      setGeneratedContent(null);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Erro ao salvar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Importar Conteúdo</h1>
          <p className="text-muted-foreground">
            Cole seu texto ou faça upload de PDF para gerar flashcards e questões automaticamente
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-4">
          <Button
            variant={mode === 'text' ? 'default' : 'outline'}
            onClick={() => setMode('text')}
            className="flex-1 gap-2"
          >
            <FileText className="w-4 h-4" />
            Colar Texto
          </Button>
          <Button
            variant={mode === 'pdf' ? 'default' : 'outline'}
            onClick={() => setMode('pdf')}
            className="flex-1 gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload PDF
          </Button>
        </div>

        {mode === 'pdf' && (
          <Card>
            <CardContent className="p-6">
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium">Clique para fazer upload</p>
                <p className="text-sm text-muted-foreground">Arquivos PDF até 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {mode === 'text' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input 
                    placeholder="Ex: Aula 1 - Cardiologia"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Matéria</Label>
                  <Select value={subjectId} onValueChange={setSubjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma matéria" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cole seu texto (aula, resumo, capítulo)</Label>
                <Textarea 
                  placeholder="Cole aqui o conteúdo que deseja transformar em material de estudo..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="min-h-[300px]"
                />
                <p className="text-xs text-muted-foreground">
                  {content.length} caracteres • Mínimo 100 caracteres recomendado
                </p>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={loading || content.length < 50 || !title.trim()}
                className="w-full gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                Gerar Flashcards e Questões
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Progress Indicator */}
        {loading && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Gerando conteúdo...</span>
                  <Badge variant="outline">
                    {Object.values(progress).filter(Boolean).length}/3
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {progress.summary ? <Check className="w-4 h-4 text-success" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                    <span className="text-sm">Resumo estruturado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {progress.flashcards ? <Check className="w-4 h-4 text-success" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                    <span className="text-sm">Flashcards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {progress.questions ? <Check className="w-4 h-4 text-success" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                    <span className="text-sm">Questões de múltipla escolha</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Content Preview */}
        {generatedContent && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Conteúdo Gerado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                {generatedContent.summary && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span className="font-medium">Resumo</span>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium">{generatedContent.summary.title}</p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-4">
                        {generatedContent.summary.content}
                      </p>
                    </div>
                  </div>
                )}

                {/* Flashcards */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="font-medium">Flashcards ({generatedContent.flashcards.length})</span>
                  </div>
                  <div className="grid gap-2">
                    {generatedContent.flashcards.slice(0, 3).map((fc, i) => (
                      <div key={i} className="bg-muted/50 rounded-lg p-3 text-sm">
                        <p className="font-medium">Q: {fc.front}</p>
                        <p className="text-muted-foreground">R: {fc.back}</p>
                      </div>
                    ))}
                    {generatedContent.flashcards.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{generatedContent.flashcards.length - 3} flashcards
                      </p>
                    )}
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-primary" />
                    <span className="font-medium">Questões ({generatedContent.questions.length})</span>
                  </div>
                  <div className="space-y-2">
                    {generatedContent.questions.slice(0, 2).map((q, i) => (
                      <div key={i} className="bg-muted/50 rounded-lg p-3 text-sm">
                        <p className="font-medium">P: {q.question}</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          Resposta: {q.options[q.correctAnswer]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setGeneratedContent(null)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={loading} className="flex-1 gap-2">
                    <Check className="w-4 h-4" />
                    Salvar Tudo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tips */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Dicas para melhor resultado:</p>
                <ul className="text-muted-foreground mt-1 list-disc list-inside">
                  <li>Cole texto de aulas, livros ou resumos</li>
                  <li>Quanto mais texto, mais conteúdo gerado</li>
                  <li>Selecione a matéria correta para organizar</li>
                  <li>Você pode editar flashcards e questões após salvar</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
