import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ensureProfileExists } from '@/lib/profileUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Função para inicializar autenticação
    const initAuth = async () => {
      try {
        // Tenta obter a sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.warn('[Auth] Session error:', error.message);
        }
        
        // Sempre define o loading como false após tentativa
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        setIsSupabaseConnected(true);
        
      } catch (err) {
        console.error('[Auth] Fatal error:', err);
        if (isMounted) {
          setIsLoading(false);
          setIsSupabaseConnected(false);
        }
      }
    };

    // Executa imediatamente
    initAuth();

    // Escuta mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Profile creation em background
      if (session?.user) {
        ensureProfileExists(session.user.id).catch(err => {
          console.warn('[Auth] Profile creation skipped:', err.message);
        });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // Use configurable site URL or fallback to window.location.origin
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const redirectUrl = `${siteUrl}/`;
    
    console.log('[Auth] SignUp redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName }
      }
    });
    
    if (error) {
      console.error('[Auth] SignUp error:', error);
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isSupabaseConnected, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
