// Legacy supabase client - use @/integrations/supabase/client instead
import { createClient } from '@supabase/supabase-js'

// Fallback values - deve usar o client oficial em src/integrations/supabase/client.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iurqzoryxguwfarkmbak.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1cnF6b3J5eGd1d2ZhcmttYmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MTc4MDAsImV4cCI6MjA1MjI5MzgwMH0.b1vich_xt0mbjmqd37bhitog_vsnbp_c0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
