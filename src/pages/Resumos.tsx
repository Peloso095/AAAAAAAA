import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  Search, 
  Trash2, 
  Edit,
  Save,
  X,
  BookOpen
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Summary {
  id: string;
  title: string;
  content: string;
  subject_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

export default function Resumos() {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSubjectId, setEditSubjectId] = useState<string>('none');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSubjectId, setNewSubjectId] = useState<string>('none');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [summariesRes, subjectsRes] = await Promise.all([
        supabase.from('summaries').select('*').eq('user_id', user!.id).order('updated_at', { ascending: false }),
        supabase.from('subjects').select('id, name, color').eq('user_id', user!.id)
      ]);

      if (summariesRes.error) throw summariesRes.error;
      if (subjectsRes.error) throw subjectsRes.error;

      setSummaries(summariesRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar resumos');
    } finally {
      setLoading(false);
    }
  };

  const createSummary = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Preencha título e conteúdo');
      return;
    }

    try {
      const { error } = await supabase.from('summaries').insert({
        user_id: user!.id,
        title: newTitle.trim(),
        content: newContent.trim(),
        subject_id: newSubjectId === 'none' ? null : newSubjectId
      });

      if (error) throw error;

      toast.success('Resumo criado!');
      setNewTitle('');
      setNewContent('');
      setNewSubjectId('none');
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao criar resumo');
    }
  };

  const updateSummary = async () => {
    if (!selectedSummary || !editTitle.trim() || !editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('summaries')
        .update({
          title: editTitle.trim(),
          content: editContent.trim(),
          subject_id: editSubjectId === 'none' ? null : editSubjectId
        })
        .eq('id', selectedSummary.id);

      if (error) throw error;

      toast.success('Resumo atualizado!');
      setIsEditing(false);
      loadData();
      setSelectedSummary(null);
    } catch (error) {
      toast.error('Erro ao atualizar resumo');
    }
  };

  const deleteSummary = async (id: string) => {
    try {
      const { error } = await supabase.from('summaries').delete().eq('id', id);
      if (error) throw error;
      toast.success('Resumo removido');
      if (selectedSummary?.id === id) setSelectedSummary(null);
      loadData();
    } catch (error) {
      toast.error('Erro ao remover resumo');
    }
  };

  const openSummary = (summary: Summary) => {
    setSelectedSummary(summary);
    setEditTitle(summary.title);
    setEditContent(summary.content);
    setEditSubjectId(summary.subject_id || 'none');
    setIsEditing(false);
  };

  const getSubjectName = (subjectId: string | null) => {
    if (!subjectId) return null;
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || null;
  };

  const getSubjectColor = (subjectId: string | null) => {
    if (!subjectId) return '#6B7280';
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || '#6B7280';
  };

  const filteredSummaries = summaries.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display">Resumos</h1>
            <p className="text-muted-foreground">Seus resumos e anotações</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Resumo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Resumo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input 
                    placeholder="Título do resumo"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
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
                  <Label>Conteúdo (suporta Markdown)</Label>
                  <Textarea 
                    placeholder="Digite seu resumo aqui... Use **negrito**, *itálico*, # títulos"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
                <Button onClick={createSummary} className="w-full">
                  Criar Resumo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar resumos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary List */}
          <div className="lg:col-span-1 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando...</div>
            ) : filteredSummaries.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum resumo</h3>
                  <p className="text-muted-foreground text-sm">
                    {searchTerm ? 'Nenhum resultado encontrado' : 'Crie seu primeiro resumo'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredSummaries.map((summary, i) => (
                <motion.div
                  key={summary.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedSummary?.id === summary.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => openSummary(summary)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{summary.title}</h3>
                          {summary.subject_id && (
                            <span 
                              className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full text-white"
                              style={{ backgroundColor: getSubjectColor(summary.subject_id) }}
                            >
                              {getSubjectName(summary.subject_id)}
                            </span>
                          )}
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {summary.content.substring(0, 100)}...
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(summary.updated_at), "d 'de' MMM", { locale: ptBR })}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSummary(summary.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Summary Detail */}
          <div className="lg:col-span-2">
            {selectedSummary ? (
              <Card className="h-full">
                <CardContent className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Input 
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="text-xl font-bold"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={updateSummary}>
                            <Save className="w-4 h-4 mr-1" />
                            Salvar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Select value={editSubjectId} onValueChange={setEditSubjectId}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
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
                      <Textarea 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={20}
                        className="font-mono text-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold font-display">{selectedSummary.title}</h2>
                          {selectedSummary.subject_id && (
                            <span 
                              className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full text-white"
                              style={{ backgroundColor: getSubjectColor(selectedSummary.subject_id) }}
                            >
                              {getSubjectName(selectedSummary.subject_id)}
                            </span>
                          )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {selectedSummary.content}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center text-center p-12">
                <div>
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Selecione um resumo</h3>
                  <p className="text-muted-foreground">
                    Clique em um resumo da lista para visualizar
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
