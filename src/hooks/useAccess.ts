import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// =============================================================================
// HOOK DE VERIFICAÇÃO DE ACESSO
// Com timeout para evitar loading infinito
// =============================================================================

interface AccessStatus {
  hasAccess: boolean;
  isLoading: boolean;
  isDev: boolean;
  error?: string;
}

const DEV_EMAIL = 'rafaelpeloso0909@gmail.com';
const ACCESS_CHECK_TIMEOUT = 10000; // 10 segundos

export function useAccess(): AccessStatus {
  const { user, isLoading: authLoading } = useAuth();
  const [accessStatus, setAccessStatus] = useState<AccessStatus>({
    hasAccess: false,
    isLoading: true,
    isDev: false,
  });
  
  // Ref para evitar múltiplas verificações
  const isCheckingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Se auth ainda está carregando, aguarda
    if (authLoading) {
      return;
    }

    // Se não há usuário, deny access
    if (!user) {
      setAccessStatus({
        hasAccess: false,
        isLoading: false,
        isDev: false,
      });
      return;
    }

    // Evita verificação dupla
    if (isCheckingRef.current) {
      return;
    }
    isCheckingRef.current = true;

    async function checkAccess() {
      try {
        console.log('[useAccess] Checking access for user:', user.id);

        // 1. Verifica se é dev (instantâneo)
        const isDev = user.email?.toLowerCase() === DEV_EMAIL.toLowerCase();
        
        if (isDev) {
          console.log('[useAccess] User is developer, granting access');
          setAccessStatus({
            hasAccess: true,
            isLoading: false,
            isDev: true,
          });
          isCheckingRef.current = false;
          return;
        }

        // 2. Define timeout para evitar loading infinito
        const timeoutPromise = new Promise<'timeout'>((resolve) => {
          timeoutRef.current = setTimeout(() => {
            resolve('timeout');
          }, ACCESS_CHECK_TIMEOUT);
        });

        // 3. Verifica subscription com timeout
        const subscriptionPromise = supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle();

        const result = await Promise.race([subscriptionPromise, timeoutPromise]);

        // Limpa timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Se timeout, usa valor padrão
        if (result === 'timeout') {
          console.warn('[useAccess] Subscription check timed out');
          setAccessStatus({
            hasAccess: false,
            isLoading: false,
            isDev: false,
            error: 'Timeout ao verificar assinatura',
          });
          isCheckingRef.current = false;
          return;
        }

        // Processa resultado
        const { data: subscription, error: subError } = result;
        
        if (subError) {
          console.error('[useAccess] Subscription query error:', subError);
          // Em caso de erro na query, nega acesso mas não fica em loading
          setAccessStatus({
            hasAccess: false,
            isLoading: false,
            isDev: false,
            error: subError.message,
          });
          isCheckingRef.current = false;
          return;
        }

        const hasActiveSubscription = subscription?.status === 'active';
        
        console.log('[useAccess] Has active subscription:', hasActiveSubscription);

        setAccessStatus({
          hasAccess: hasActiveSubscription,
          isLoading: false,
          isDev: false,
        });

      } catch (error: any) {
        console.error('[useAccess] Access check error:', error);
        // Qualquer erro, libera com warning mas não fica em loading
        setAccessStatus({
          hasAccess: false,
          isLoading: false,
          isDev: false,
          error: error.message,
        });
      } finally {
        isCheckingRef.current = false;
      }
    }

    checkAccess();

    // Cleanup na desmontagem
    return () => {
      isCheckingRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, authLoading]);

  return accessStatus;
}
