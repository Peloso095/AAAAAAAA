# MEDTRACK - Checklist de Deploy

## ✅ Tarefas Concluídas

### 1. Variáveis de Ambiente (VITE_)
- [x] Todas as variáveis do frontend agora usam prefixo `VITE_`
- [x] Criado `.env.example` documentado com todas as variáveis necessárias
- [x] Adicionada variável `VITE_SITE_URL` para redirect em produção

### 2. Auth Redirect
- [x] Código ajustado para usar `VITE_SITE_URL` configurável
- [x] Fallback para `window.location.origin` em desenvolvimento

### 3. Profiles Auto-criado
- [x] Criado utilitário `profileUtils.ts` com fallback
- [x] Integrados no `AuthContext` (ao fazer login)
- [x] Integrados no `Dashboard` (ao carregar dados)

### 4. RLS e Policies
- [x] Revisadas políticas em `fix_all_tables.sql`
- [x] Políticas corretas para todas as tabelas com `user_id = auth.uid()`

### 5. Migrations
- [x] `fix_all_tables.sql` - consolidado com todas as tabelas
- [x] `functions_list.sql` - consolidado com todas as funções e triggers

### 6. Diagnóstico
- [x] Criada página `/diagnostico` para validação em 5 minutos

---

## 🚀 Como fazer o Deploy

### Passo 1: Configurar Supabase

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard

2. **Execute as migrations**
   - Vá para: SQL Editor no seu projeto
   - Execute o conteúdo de `supabase/migrations/fix_all_tables.sql`
   - Execute o conteúdo de `supabase/migrations/functions_list.sql`

3. **Configure Auth Redirect URLs**
   - Vá para: Authentication → URL Configuration
   - Adicione sua URL de produção (ex: `https://medtrack.vercel.app`)
   - Adicione URLs de desenvolvimento (ex: `http://localhost:8080`)

4. **Copie as chaves**
   - Settings → API → Project URL
   - Settings → API → Project API keys (anon public)

### Passo 2: Configurar Vercel/Netlify

#### Vercel:
1. **Crie um novo projeto** ou importe do GitHub
2. **Configure as variáveis de ambiente**:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon
   VITE_SITE_URL=https://seu-dominio.vercel.app
   ```
3. **Deploy**: O Vite já está configurado com `base: "./"`

#### Netlify:
1. **Configure no painel Netlify**:
   - Site settings → Environment Variables
   - Adicione as mesmas variáveis acima
2. **O `netlify.toml`** já está configurado corretamente

### Passo 3: Testar

1. **Acesse** `/diagnostico` após fazer login
2. **Execute os testes** e verifique se tudo passa
3. **Testes importantes**:
   - Supabase Connection ✓
   - User Profile ✓
   - Subjects/Flashcards/Questions ✓
   - Access Check (dev ou subscription) ✓

---

## 📋 Variáveis de Ambiente Necessárias

### Obrigatórias:
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Chave pública do Supabase | `eyJhbGciOiJIUzI1NiIs...` |

### Recomendadas:
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_SITE_URL` | URL do site em produção | `https://medtrack.vercel.app` |
| `VITE_CONTACT_PHONE` | WhatsApp para suporte | `+5535999210503` |
| `VITE_MONTHLY_PRICE` | Preço mensal | `15.90` |
| `VITE_PIX_KEY` | Chave Pix para pagamentos | `10249148609` |

---

## 🐛 Solução de Problemas Comuns

### Erro 404/400 em /rest/v1/*
- **Causa**: RLS bloqueando acesso ou tabela não existe
- **Solução**: Execute as migrations novamente

### Email confirmation não funciona
- **Causa**: Redirect URL não configurada no Supabase
- **Solução**: Adicione a URL em Authentication → URL Configuration

### Profile não existe
- **Causa**: Trigger não funcionou
- **Solução**: O app agora tem fallback automático, ou execute:
  ```sql
  INSERT INTO profiles (user_id, full_name) 
  SELECT id, raw_user_meta_data->>'full_name' 
  FROM auth.users 
  WHERE id = 'USER_ID_AQUI';
  ```

### Access negado para usuário pago
- **Causa**: Assinatura não está com status 'active'
- **Solução**: Verifique a tabela subscriptions:
  ```sql
  UPDATE subscriptions SET status = 'active' WHERE user_id = 'USER_ID';
  ```

---

## 📞 Suporte

Em caso de dúvidas, verifique:
1. Console do navegador para erros
2. Página de diagnóstico em `/diagnostico`
3. Logs do Supabase em → Logs
