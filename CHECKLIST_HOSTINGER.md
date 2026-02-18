# Deploy MEDTRACK na Hostinger

## ✅ Correções Aplicadas

### Loading Infinito
- **Causa**: `AuthContext` tinha promises que nunca resolviam + `useAccess` sem timeout
- **Fix**: 
  - AuthContext agora sempre define `setIsLoading(false)` com cleanup adequado
  - useAccess tem timeout de 10 segundos + flag para evitar verificações duplicadas

---

## 🚀 Passo a Passo do Deploy

### 1. Preparar o Build

```bash
# No seu terminal, na pasta do projeto:
npm run build
```

Isso vai gerar a pasta `dist/` com todos os arquivos estáticos.

### 2. Configurar Supabase

1. **Vá para** https://supabase.com/dashboard
2. **Authentication → URL Configuration**
3. **Adicione as URLs**:
   - Site URL: `https://seudominio.com` (substitua pelo seu domínio)
   - Redirect URLs: `https://seudominio.com/auth/callback`

### 3. Upload para Hostinger

**Opção A - hPanel (Arquivos):**
1. Acesse o hPanel → Files → File Manager
2. Vá para `public_html`
3. Delete todos os arquivos existentes
4. Faça upload do conteúdo da pasta `dist/`
5. **Também faça upload do `.htaccess`** que está em `public/.htaccess` para `public_html/`

**Opção B - FTP:**
1. Conecte via FTP
2. Faça upload do conteúdo de `dist/` para `public_html/`
3. Faça upload do `.htaccess` para `public_html/`

### 4. Configurar Variáveis de Ambiente

No hPanel, vá para **Advanced → Environment Variables** e adicione:

| Variável | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sua-chave-anon` |
| `VITE_SITE_URL` | `https://seudominio.com` |

⚠️ **Importante**: A Hostinger não suporta variáveis Vite nativamente. Você precisa **colocar os valores direto no código** se não funcionar:

Edite `src/integrations/supabase/client.ts`:
```ts
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon-aqui';
```

### 5. Verificar se Funciona

1. Acesse `https://seudominio.com`
2. Faça login
3. Vá para `/diagnostico` e execute os testes

---

## 🐛 Solução de Problemas

### "Too many redirects"
- Causa: `.htaccess` mal configurado
- Solução: Verifique se o arquivo foi copiado corretamente

### "Cannot read properties of undefined"
- Causa: Variáveis de ambiente não carregaram
- Solução: Use valores hardcoded temporariamente

### "Network error" no login
- Causa: Supabase URL incorreta ou bloqueada
- Solução: Verifique as URLs em Authentication → URL Configuration

### Loading eterno
- Causa: Alguma query ainda travando
- Solução: Limpe o cache do navegador ou use Incognito

---

## 📁 Arquivos Criados/Copiados para Deploy

```
public_html/
├── index.html
├── .htaccess          ← IMPORTANTE: Copie este arquivo!
├── assets/
│   ├── index-xxxx.js
│   └── index-xxxx.css
└── ...
```

O `.htaccess` faz o roteamento SPA funcionar (todas as rotas vão para index.html).

---

## ✅ Checklist Final

- [ ] Build executado (`npm run build`)
- [ ] Arquivos de `dist/` upados para `public_html/`
- [ ] `.htaccess` copiado para `public_html/`
- [ ] URLs configuradas no Supabase
- [ ] Variáveis de ambiente ou valores hardcoded
- [ ] Testado em `/diagnostico`
