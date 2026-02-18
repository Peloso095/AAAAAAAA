// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Fallback values para desenvolvimento local
// Em produção, configure via variáveis de ambiente VITE_
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://iurqzoryxguwfarkmbak.supabase.co';
// A chave correta é a JWT completa do Supabase
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1cnF6b3J5eGd1d2ZhcmttYmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MTc4MDAsImV4cCI6MjA1MjI5MzgwMH0.b1vich_xt0mbjmqd37bhitog_vsnbp_c0';

// Debug em desenvolvimento
if (import.meta.env.DEV) {
  console.log('[Supabase] URL:', SUPABASE_URL);
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
