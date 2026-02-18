import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, Calendar, Tag, FileText, Trash2, Edit2, Stethoscope, Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface PortfolioEntry {
  id: string;
  title: string;
  description: string | null;
  specialty: string | null;
  cid_code: string | null;
  date: string;
  learnings: string | null;
  created_at: string;
}

const specialties = [
  'Cardiologia',
  'Pneumologia',
  'Gastroenterologia',
  'Neurologia',
  'Dermatologia',
  'Pediatria',
  'Ginecologia',
  'Ortopedia',
  'Psiquiatria',
  'Endocrinologia',
  'Nefrologia',
  'Reumatologia',
  'Infectologia',
  'Cirurgia Geral',
  'Emergência',
  'Outro',
];

const Portfolio = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [newEntry, setNewEntry] = useState({
    title: '',
    description: '',
    specialty: '',
    cid_code: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    learnings: '',
  });

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clinical_portfolio')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
      toast.error('Erro ao carregar portfólio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!user || !newEntry.title) return;

    try {
      const { error } = await supabase.from('clinical_portfolio').insert({
        user_id: user.id,
        title: newEntry.title,
        description: newEntry.description || null,
        specialty: newEntry.specialty || null,
        cid_code: newEntry.cid_code || null,
        date: newEntry.date,
        learnings: newEntry.learnings || null,
      });

      if (error) throw error;

      toast.success('Caso adicionado ao portfólio!');
      setIsDialogOpen(false);
      setNewEntry({
        title: '',
        description: '',
        specialty: '',
        cid_code: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        learnings: '',
      });
      loadEntries();
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error('Erro ao adicionar caso');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('clinical_portfolio').delete().eq('id', id);
      if (error) throw error;
      toast.success('Caso removido');
      loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Erro ao remover caso');
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.cid_code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      filterSpecialty === 'all' || entry.specialty === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const stats = {
    total: entries.length,
    thisMonth: entries.filter(
      (e) => new Date(e.date).getMonth() === new Date().getMonth()
    ).length,
    specialties: [...new Set(entries.map((e) => e.specialty).filter(Boolean))].length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Portfólio Clínico</h1>
            <p className="text-muted-foreground mt-1">Registre seus casos clínicos e aprendizados</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Caso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Adicionar Caso Clínico</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Título do Caso *</Label>
                  <Input
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    placeholder="Ex: Paciente com dor torácica aguda"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CID (opcional)</Label>
                    <Input
                      value={newEntry.cid_code}
                      onChange={(e) => setNewEntry({ ...newEntry, cid_code: e.target.value })}
                      placeholder="Ex: I21.0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Select
                    value={newEntry.specialty}
                    onValueChange={(value) => setNewEntry({ ...newEntry, specialty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Descrição do Caso</Label>
                  <Textarea
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    placeholder="Descreva o caso clínico..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aprendizados</Label>
                  <Textarea
                    value={newEntry.learnings}
                    onChange={(e) => setNewEntry({ ...newEntry, learnings: e.target.value })}
                    placeholder="O que você aprendeu com este caso?"
                    rows={3}
                  />
                </div>
                <Button onClick={handleAddEntry} className="w-full" disabled={!newEntry.title}>
                  Adicionar ao Portfólio
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <FolderOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Casos Totais</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.thisMonth}</p>
                <p className="text-sm text-muted-foreground">Este Mês</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-transparent">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Stethoscope className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.specialties}</p>
                <p className="text-sm text-muted-foreground">Especialidades</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar casos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Especialidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {specialties.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Entries */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 h-32" />
              </Card>
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {entries.length === 0 ? 'Nenhum caso registrado' : 'Nenhum caso encontrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {entries.length === 0
                  ? 'Comece a registrar seus casos clínicos para construir seu portfólio.'
                  : 'Tente ajustar os filtros de busca.'}
              </p>
              {entries.length === 0 && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Caso
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{entry.title}</h3>
                          {entry.specialty && (
                            <Badge variant="secondary">{entry.specialty}</Badge>
                          )}
                          {entry.cid_code && (
                            <Badge variant="outline" className="font-mono">
                              {entry.cid_code}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(entry.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                        {entry.description && (
                          <p className="text-muted-foreground mb-3 line-clamp-2">
                            {entry.description}
                          </p>
                        )}
                        {entry.learnings && (
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              Aprendizados
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {entry.learnings}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Portfolio;
