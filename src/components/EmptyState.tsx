import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Upload, Plus, Wand2, Brain, BookOpen, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type EmptyStateType = 'flashcards' | 'questions' | 'summaries' | 'subjects' | 'agenda';

interface EmptyStateProps {
  type: EmptyStateType;
  onImport?: () => void;
  onGenerate?: () => void;
  onCreate?: () => void;
}

const emptyStateConfig = {
  flashcards: {
    icon: Brain,
    title: 'Nenhum flashcard ainda',
    description: 'Crie flashcards para revisar e memorize o conteúdo',
    importLabel: 'Importar Texto',
    generateLabel: 'Gerar Automaticamente',
    createLabel: 'Criar Manualmente',
    importPath: '/importar',
  },
  questions: {
    icon: ClipboardList,
    title: 'Nenhuma questão ainda',
    description: 'Pratique com questões de múltipla escolha',
    importLabel: 'Importar Questões',
    generateLabel: 'Gerar de Texto',
    createLabel: 'Criar Questão',
    importPath: '/importar',
  },
  summaries: {
    icon: BookOpen,
    title: 'Nenhum resumo ainda',
    description: 'Crie resumos para estudar o conteúdo principal',
    importLabel: 'Importar Resumo',
    generateLabel: 'Gerar de Texto',
    createLabel: 'Criar Resumo',
    importPath: '/importar',
  },
  subjects: {
    icon: FileText,
    title: 'Nenhuma matéria cadastrada',
    description: 'Adicione suas matérias para começar a estudar',
    importLabel: 'Ver Matérias',
    generateLabel: '',
    createLabel: 'Adicionar Matéria',
    importPath: '/materias',
  },
  agenda: {
    icon: FileText,
    title: 'Agenda vazia',
    description: 'Planeje seus estudos e eventos',
    importLabel: '',
    generateLabel: '',
    createLabel: 'Criar Evento',
    importPath: '/agenda',
  },
};

export function EmptyState({ type, onImport, onGenerate, onCreate }: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="text-center py-12">
        <CardContent>
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          
          <h3 className="text-xl font-semibold font-display mb-2">{config.title}</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{config.description}</p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {config.importLabel && (
              onImport ? (
                <Button onClick={onImport} variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  {config.importLabel}
                </Button>
              ) : (
                <Link to={config.importPath}>
                  <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    {config.importLabel}
                  </Button>
                </Link>
              )
            )}
            
            {config.generateLabel && (
              onGenerate ? (
                <Button onClick={onGenerate} variant="outline" className="gap-2">
                  <Wand2 className="w-4 h-4" />
                  {config.generateLabel}
                </Button>
              ) : (
                <Link to="/importar">
                  <Button variant="outline" className="gap-2">
                    <Wand2 className="w-4 h-4" />
                    {config.generateLabel}
                  </Button>
                </Link>
              )
            )}
            
            {config.createLabel && (
              onCreate ? (
                <Button onClick={onCreate} className="gap-2">
                  <Plus className="w-4 h-4" />
                  {config.createLabel}
                </Button>
              ) : (
                <Link to={type === 'subjects' ? '/materias' : '/agenda'}>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    {config.createLabel}
                  </Button>
                </Link>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Skeleton loading for empty states
export function EmptyStateSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-muted rounded-lg" />
    </div>
  );
}
