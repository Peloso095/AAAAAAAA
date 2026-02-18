-- =============================================================================
-- MIGRAÇÃO: Setar usuário admin
-- Execute esta migração para dar acesso admin ao seu usuário
-- =============================================================================

-- Substitua pelo email do seu usuário
-- Esta query vai procurar o usuário pelo email e setar is_admin = true

UPDATE public.profiles
SET is_admin = true
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'rafaelpeloso0909@gmail.com' 
  LIMIT 1
);

-- Verificar se funcionou
SELECT 
  p.user_id,
  p.is_admin,
  p.is_premium,
  u.email
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'rafaelpeloso0909@gmail.com';
