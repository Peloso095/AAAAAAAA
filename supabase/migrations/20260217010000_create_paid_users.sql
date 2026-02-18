-- =============================================================================
-- TABELA: paid_users - Lista de usuários que pagaram
-- =============================================================================

-- Criar tabela paid_users
CREATE TABLE IF NOT EXISTS public.paid_users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.paid_users ENABLE ROW LEVEL SECURITY;

-- Política: apenas leitura para usuários autenticados (verificação de acesso)
-- Usuários normais NÃO podem inserir/modificar - apenas via service role
CREATE POLICY "paid_users_read_access" 
ON public.paid_users FOR SELECT 
USING (auth.role() = 'authenticated');

-- Política: apenas service_role pode fazer INSERT/UPDATE/DELETE
CREATE POLICY "paid_users_service_role_full_access" 
ON public.paid_users FOR ALL 
USING (auth.role() = 'service_role');

-- Criar índice para busca rápida por email
CREATE UNIQUE INDEX idx_paid_users_email ON public.paid_users(LOWER(email));

-- =============================================================================
-- INSERIR USUÁRIOS DE TESTE (execute manualmente via dashboard)
-- =============================================================================

-- Para inserir usuários pagantes, use o dashboard do Supabase
-- ouuma função service role:
/*
-- Exemplo de inserção (apenas service role):
INSERT INTO public.paid_users (email, paid_at) 
VALUES ('usuario@email.com', now());
*/
