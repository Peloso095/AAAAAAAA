import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  BookOpen, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  Edit,
  MoreVertical
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Subject {
  id: string;
  name: string;
  color: string;
  progress: number;
  modules: Module[];
}

interface Module {
  id: string;
  name: string;
  completed: boolean;
}

const COLORS = [
  '#004E89', '#00A8E8', '#007EA7', '#003459', 
  '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
];

export default function Materias() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [newModuleName, setNewModuleName] = useState('');
  const [addingModuleFor, setAddingModuleFor] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadSubjects();
  }, [user]);

  const loadSubjects = async () => {
    try {
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (subjectsError) throw subjectsError;

      // Carregar modules filtrando por user_id (obrigatório)
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('user_id', user!.id);

      if (modulesError) throw modulesError;

      // Associar modules às subjects (filtra por subject_id)
      const subjectsWithModules = (subjectsData || []).map(subject => {
        const modules = (modulesData || []).filter(m => m.subject_id === subject.id);
        const completedCount = modules.filter(m => m.completed).length;
        const progress = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;
        
        return {
          ...subject,
          modules,
          progress
        };
      });

      setSubjects(subjectsWithModules);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error('Erro ao carregar matérias');
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async () => {
    if (!newSubjectName.trim()) return;

    try {
      const { error } = await supabase.from('subjects').insert({
        user_id: user!.id,
        name: newSubjectName.trim(),
        color: selectedColor
      });

      if (error) throw error;

      toast.success('Matéria criada!');
      setNewSubjectName('');
      setIsDialogOpen(false);
      loadSubjects();
    } catch (error) {
      toast.error('Erro ao criar matéria');
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
      toast.success('Matéria removida');
      loadSubjects();
    } catch (error) {
      toast.error('Erro ao remover matéria');
    }
  };

  const addModule = async (subjectId: string) => {
    if (!newModuleName.trim()) return;

    try {
      const { error } = await supabase.from('modules').insert({
        user_id: user!.id,
        subject_id: subjectId,
        name: newModuleName.trim()
      });

      if (error) throw error;

      toast.success('Módulo adicionado!');
      setNewModuleName('');
      setAddingModuleFor(null);
      loadSubjects();
    } catch (error) {
      toast.error('Erro ao adicionar módulo');
    }
  };

  const toggleModule = async (moduleId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('modules')
        .update({ completed })
        .eq('id', moduleId);

      if (error) throw error;
      loadSubjects();
    } catch (error) {
      toast.error('Erro ao atualizar módulo');
    }
  };

  const deleteModule = async (moduleId: string) => {
    try {
      const { error } = await supabase.from('modules').delete().eq('id', moduleId);
      if (error) throw error;
      loadSubjects();
    } catch (error) {
      toast.error('Erro ao remover módulo');
    }
  };

  const toggleExpand = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Matérias</h1>
            <p className="text-muted-foreground">Organize suas disciplinas e acompanhe o progresso</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Matéria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Matéria</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da Matéria</Label>
                  <Input 
                    placeholder="Ex: Anatomia Humana"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full transition-all ${
                          selectedColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={createSubject} className="w-full">
                  Criar Matéria
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : subjects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma matéria cadastrada</h3>
              <p className="text-muted-foreground mb-4">Crie sua primeira matéria para começar a organizar seus estudos</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Matéria
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {subjects.map((subject, i) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardContent className="p-0">
                    <div 
                      className="p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleExpand(subject.id)}
                    >
                      <div 
                        className="w-3 h-12 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {expandedSubjects.has(subject.id) ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                          <h3 className="font-semibold truncate">{subject.name}</h3>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <Progress value={subject.progress} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {subject.progress}%
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setAddingModuleFor(subject.id)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Módulo
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteSubject(subject.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir Matéria
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {expandedSubjects.has(subject.id) && (
                      <div className="border-t border-border px-4 py-3 space-y-2 bg-muted/30">
                        {subject.modules.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            Nenhum módulo cadastrado
                          </p>
                        ) : (
                          subject.modules.map(module => (
                            <div 
                              key={module.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                            >
                              <Checkbox 
                                checked={module.completed}
                                onCheckedChange={(checked) => toggleModule(module.id, checked as boolean)}
                              />
                              <span className={module.completed ? 'line-through text-muted-foreground' : ''}>
                                {module.name}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="ml-auto h-8 w-8"
                                onClick={() => deleteModule(module.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))
                        )}
                        
                        {addingModuleFor === subject.id ? (
                          <div className="flex gap-2 mt-2">
                            <Input 
                              placeholder="Nome do módulo"
                              value={newModuleName}
                              onChange={(e) => setNewModuleName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && addModule(subject.id)}
                            />
                            <Button size="sm" onClick={() => addModule(subject.id)}>
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => setAddingModuleFor(subject.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Módulo
                          </Button>
                        )}
                      </div>
                    )}
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
