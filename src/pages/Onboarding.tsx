import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  Clock, 
  Calendar, 
  BookOpen, 
  Check,
  ChevronRight,
  ChevronDown,
  Sparkles,
  GraduationCap,
  Stethoscope,
  Plus,
  Minus,
  Loader2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// =============================================================================
// TIPOS
// =============================================================================

type SelectionType = 'grad' | 'resid' | 'both';

interface CatalogGroup {
  group_key: string;
  group_label: string;
  description: string;
  subjects: CatalogSubject[];
  allSelected: boolean;
}

interface CatalogSubject {
  id: string;
  name: string;
  group_key: string;
  group_label: string;
  selected: boolean;
}

interface CatalogData {
  groups: CatalogGroup[];
  loading: boolean;
  error: string | null;
}

// =============================================================================
// CONSTANTES
// =============================================================================

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', 
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'
];

const getColorForGroup = (groupKey: string): string => {
  const hash = groupKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
};

// =============================================================================
// COMPONENTES AUXILIARES
// =============================================================================

function GroupAccordion({ 
  group, 
  onToggleSubject, 
  onToggleAll 
}: { 
  group: CatalogGroup;
  onToggleSubject: (subjectId: string) => void;
  onToggleAll: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCount = group.subjects.filter(s => s.selected).length;

  return (
    <Card className="overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-12 rounded-full"
            style={{ backgroundColor: getColorForGroup(group.group_key) }}
          />
          <div>
            <h3 className="font-semibold">{group.group_label}</h3>
            <p className="text-sm text-muted-foreground">{group.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedCount} / {group.subjects.length} selecionadas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleAll();
            }}
            className="gap-1"
          >
            {group.allSelected ? (
              <>
                <Minus className="w-3 h-3" />
                Desmarcar
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                Todas
              </>
            )}
          </Button>
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t"
          >
            <div className="p-3 space-y-1 bg-muted/20">
              {group.subjects.map(subject => (
                <div 
                  key={subject.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => onToggleSubject(subject.id)}
                >
                  <Checkbox 
                    checked={subject.selected}
                    onCheckedChange={() => onToggleSubject(subject.id)}
                    className="pointer-events-none"
                  />
                  <span className={subject.selected ? '' : 'text-muted-foreground'}>
                    {subject.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Selection type
  const [selectionType, setSelectionType] = useState<SelectionType | null>(null);
  
  // Step 2: Catalog data
  const [catalogData, setCatalogData] = useState<CatalogData>({
    groups: [],
    loading: true,
    error: null
  });

  // =============================================================================
  // CARREGAR CATÁLOGO
  // =============================================================================
  
  useEffect(() => {
    if (step === 1) {
      loadCatalog();
    }
  }, [step, selectionType]);

  const loadCatalog = async () => {
    setCatalogData(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Buscar do catálogo
      let query = supabase
        .from('subject_catalog')
        .select('*')
        .order('group_label');

      // Filtrar por tipo se necessário
      if (selectionType === 'grad') {
        query = query.eq('group_type', 'grad');
      } else if (selectionType === 'resid') {
        query = query.eq('group_type', 'resid');
      }

      const { data, error } = await query;

      if (error) throw error;

      // Agrupar por group_key
      const groupsMap = new Map<string, CatalogGroup>();
      
      for (const item of (data || [])) {
        const groupKey = `${item.group_type}_${item.group_key}`;
        
        if (!groupsMap.has(groupKey)) {
          groupsMap.set(groupKey, {
            group_key: groupKey,
            group_label: item.group_label,
            description: item.description || '',
            subjects: [],
            allSelected: false
          });
        }
        
        const group = groupsMap.get(groupKey)!;
        group.subjects.push({
          id: item.id,
          name: item.name,
          group_key: item.group_key,
          group_label: item.group_label,
          selected: false
        });
      }

      // Atualizar estado
      const groups = Array.from(groupsMap.values());
      
      // Verificar se há grupo com todas selecionadas
      for (const group of groups) {
        group.allSelected = group.subjects.every(s => s.selected);
      }

      setCatalogData({
        groups,
        loading: false,
        error: null
      });

    } catch (err: any) {
      console.error('Error loading catalog:', err);
      setCatalogData({
        groups: [],
        loading: false,
        error: err.message
      });
    }
  };

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleToggleSubject = (groupKey: string, subjectId: string) => {
    setCatalogData(prev => {
      const newGroups = prev.groups.map(group => {
        if (group.group_key === groupKey) {
          const newSubjects = group.subjects.map(s => 
            s.id === subjectId ? { ...s, selected: !s.selected } : s
          );
          return {
            ...group,
            subjects: newSubjects,
            allSelected: newSubjects.every(s => s.selected)
          };
        }
        return group;
      });
      return { ...prev, groups: newGroups };
    });
  };

  const handleToggleAllInGroup = (groupKey: string) => {
    setCatalogData(prev => {
      const newGroups = prev.groups.map(group => {
        if (group.group_key === groupKey) {
          const newSelected = !group.allSelected;
          return {
            ...group,
            subjects: group.subjects.map(s => ({ ...s, selected: newSelected })),
            allSelected: newSelected
          };
        }
        return group;
      });
      return { ...prev, groups: newGroups };
    });
  };

  const getTotalSelected = () => {
    return catalogData.groups.reduce((acc, group) => 
      acc + group.subjects.filter(s => s.selected).length, 0
    );
  };

  const getSelectedSubjects = (): CatalogSubject[] => {
    return catalogData.groups.flatMap(g => g.subjects.filter(s => s.selected));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return selectionType !== null;
      case 1: return getTotalSelected() >= 3;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const selectedSubjects = getSelectedSubjects();
      const subjectNames = selectedSubjects.map(s => s.name);

      // Chamar função RPC do Supabase
      const { data, error } = await (supabase as any).rpc('complete_onboarding', {
        p_user_id: user.id,
        p_subject_names: subjectNames
      });

      if (error) {
        console.error('RPC Error:', error);
        toast.error('Erro ao completar onboarding');
        return;
      }

      console.log('Onboarding result:', data);

      if (data?.success) {
        toast.success(`🎉 Plano de estudos criado! ${data.created_count || 0} matérias adicionadas.`);
        navigate('/materias');
      } else {
        toast.error(data?.error || 'Erro ao completar onboarding');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Erro ao completar onboarding');
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold font-display">O que você está estudando?</h2>
              <p className="text-muted-foreground mt-2">Selecione o tipo de formação</p>
            </div>

            <div className="grid gap-4">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectionType === 'grad' ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectionType('grad')}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectionType === 'grad' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Graduação em Medicina</p>
                    <p className="text-sm text-muted-foreground">1º ao 6º ano da faculdade</p>
                  </div>
                  {selectionType === 'grad' && (
                    <Check className="w-5 h-5 text-primary ml-auto" />
                  )}
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectionType === 'resid' ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectionType('resid')}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectionType === 'resid' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Residência Médica</p>
                    <p className="text-sm text-muted-foreground">Especialização após a graduação</p>
                  </div>
                  {selectionType === 'resid' && (
                    <Check className="w-5 h-5 text-primary ml-auto" />
                  )}
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectionType === 'both' ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectionType('both')}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectionType === 'both' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Ambos</p>
                    <p className="text-sm text-muted-foreground">Graduação + Preparatório para Residência</p>
                  </div>
                  {selectionType === 'both' && (
                    <Check className="w-5 h-5 text-primary ml-auto" />
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold font-display">Selecione suas matérias</h2>
              <p className="text-muted-foreground mt-2">
                Escolha pelo menos 3 matérias do currículo
              </p>
            </div>

            {catalogData.loading && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando catálogo...</p>
              </div>
            )}

            {catalogData.error && (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{catalogData.error}</p>
                <Button onClick={loadCatalog}>Tentar novamente</Button>
              </div>
            )}

            {!catalogData.loading && !catalogData.error && (
              <div className="space-y-3">
                {catalogData.groups.map(group => (
                  <GroupAccordion
                    key={group.group_key}
                    group={group}
                    onToggleSubject={(subjectId) => handleToggleSubject(group.group_key, subjectId)}
                    onToggleAll={() => handleToggleAllInGroup(group.group_key)}
                  />
                ))}
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              {getTotalSelected()} matéria(s) selecionada(s) - mínimo 3 necessárias
            </div>
          </motion.div>
        );

      case 2:
        const selectedSubjects = getSelectedSubjects();
        return (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold font-display">Pronto para começar!</h2>
              <p className="text-muted-foreground mt-2">Resumo do seu plano</p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tipo de formação</span>
                  <span className="font-medium">
                    {selectionType === 'grad' && 'Graduação'}
                    {selectionType === 'resid' && 'Residência'}
                    {selectionType === 'both' && 'Ambos'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total de matérias</span>
                  <span className="font-medium">{selectedSubjects.length}</span>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Matérias selecionadas:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {selectedSubjects.map(subject => (
                      <div key={subject.id} className="flex items-center gap-2 text-sm">
                        <Check className="w-3 h-3 text-green-500" />
                        <span>{subject.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-muted-foreground">
              Você pode alterar tudo isso depois nas configurações
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Passo {step + 1} de 3</span>
            <span>{Math.round(((step + 1) / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            disabled={step === 0}
          >
            Voltar
          </Button>
          
          {step < 2 ? (
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              Continuar
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={completeOnboarding}
              disabled={loading || !canProceed()}
              className="gap-2 bg-success hover:bg-success/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  Começar a Estudar!
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
