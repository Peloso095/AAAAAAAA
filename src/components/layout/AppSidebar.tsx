import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Brain, 
  ClipboardList, 
  Stethoscope, 
  FolderOpen, 
  Calendar, 
  Trophy,
  LogOut,
  Settings,
  Search,
  Moon,
  Sun,
  Calculator,
  Library,
  Target,
  Syringe,
  GitCompare,
  ListOrdered,
  Heart,
  Bot,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { ScrollArea } from '@/components/ui/scroll-area';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: BookOpen, label: 'Matérias', path: '/materias' },
  { icon: FileText, label: 'Resumos', path: '/resumos' },
  { icon: Brain, label: 'Flashcards', path: '/flashcards' },
  { icon: ClipboardList, label: 'Questões', path: '/questoes' },
  { icon: Stethoscope, label: 'Clínica Virtual', path: '/clinica' },
  { icon: FolderOpen, label: 'Portfólio', path: '/portfolio' },
  { icon: Calendar, label: 'Agenda', path: '/agenda' },
  { icon: Trophy, label: 'Conquistas', path: '/conquistas' },
  { icon: Calculator, label: 'Calculadoras', path: '/calculadoras' },
  { icon: Library, label: 'Biblioteca', path: '/biblioteca' },
  { icon: Target, label: 'Simulador OSCE', path: '/osce' },
  { icon: Syringe, label: 'Procedimentos', path: '/procedimentos' },
  { icon: GitCompare, label: 'Comparador', path: '/comparador' },
  { icon: ListOrdered, label: 'Ranking Sintomas', path: '/sintomas' },
  { icon: Heart, label: 'Soft Skills', path: '/softskills' },
  { icon: Bot, label: 'Tutor IA', path: '/tutor' },
  { icon: Zap, label: 'Cram Mode', path: '/crammode' },
];

export function AppSidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-display text-sidebar-foreground">MEDTRACK</span>
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-sidebar-accent/50 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all text-sm">
          <Search className="w-4 h-4" />
          <span>Buscar...</span>
          <kbd className="ml-auto text-xs bg-sidebar-accent px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'sidebar-item',
                  isActive && 'sidebar-item-active'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="sidebar-item w-full"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
        </button>
        
        <Link to="/configuracoes" className="sidebar-item">
          <Settings className="w-5 h-5" />
          <span>Configurações</span>
        </Link>

        <button onClick={signOut} className="sidebar-item w-full text-destructive hover:text-destructive">
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 px-4 py-3 mt-2 bg-sidebar-accent/30 rounded-lg">
          <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center text-sidebar-primary-foreground font-medium text-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.user_metadata?.full_name || 'Estudante'}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
