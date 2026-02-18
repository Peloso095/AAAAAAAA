import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAccess } from '@/hooks/useAccess';
import { Loader2 } from 'lucide-react';

interface AccessGateProps {
  children: ReactNode;
}

/**
 * Componente de proteção de rotas
 * Verifica acesso após login
 */
export function AccessGate({ children }: AccessGateProps) {
  const { hasAccess, isLoading, isDev } = useAccess();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Dev ou usuário pago tem acesso
  if (hasAccess || isDev) {
    return <>{children}</>;
  }

  // Sem acesso - redireciona para assinatura
  return <Navigate to="/assinatura" replace />;
}

/**
 * Componente para conteúdo bloqueado
 */
export function LockedContent({ children }: { children: ReactNode }) {
  const { hasAccess, isLoading, isDev } = useAccess();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (hasAccess || isDev) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">🔒</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">Conteúdo Bloqueado</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Assine o MEDTRACK para acessar todos os recursos
      </p>
      <a
        href="/assinatura"
        className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
      >
        Ver Planos
      </a>
    </div>
  );
}

export default AccessGate;
