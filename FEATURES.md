# MEDTRACK - Novas Funcionalidades

## Visão Geral
Este documento descreve as novas funcionalidades implementadas para automatizar a experiência do usuário e reduzir o esforço manual.

---

## 1. Onboarding Guiado (2-3 minutos)

**Rota:** `/onboarding`

### O que faz:
- Wizard de 4 passos que configura automaticamente o ambiente do usuário
- Passo 1: Objetivo (prova, residência, graduação)
- Passo 2: Carga horária semanal + dias preferidos
- Passo 3: Seleção de matérias padrão
- Passo 4: Resumo e confirmação

### O que é criado automaticamente:
- `user_preferences` com objetivo e preferências
- `subjects` (matérias) selecionadas
- `study_plans` (slots de estudo semanais)
- +100 XP bônus por completar

---

## 2. Importação de Conteúdo + Geração Automática

**Rota:** `/importar`

### Fluxo:
1. Usuário cola texto (aula, resumo, capítulo)
2. Seleciona a matéria
3. Clica em "Gerar"
4. Sistema cria automaticamente:
   - Resumo estruturado
   - Flashcards (perguntas/respostas)
   - Questões de múltipla escolha
5. Preview com opção de editar/salvar
6. Tudo salvo no banco com +15 XP

### Provider de Geração:
- **Mock/Local**: Usa heurísticas e regex para gerar conteúdo sem LLM
- **OpenAI** (preparado): Configure `VITE_OPENAI_API_KEY` no .env

### Tabelas criadas:
- `content_sources` - Armazena texto original importado

---

## 3. Next Best Action (Dashboard Inteligente)

**Card no Dashboard** que recomenda a próxima melhor ação baseado em:
- Se não fez onboarding → 推荐ar onboarding
- Se tem flashcards pendentes → Revisar flashcards
- Se não fez questões hoje → Fazer simulado
- Se streak está em risco → Sessão rápida

### Informações mostradas:
- Tempo estimado
- Recompensa de XP
- CTA claro

---

## 4. Empty States Inteligentes

**Componente:** `EmptyState`

Usado em:
- Flashcards
- Questões  
- Resumos
- Matérias
- Agenda

Cada empty state oferece:
- Importar conteúdo
- Gerar automaticamente
- Criar manualmente

---

## 5. Spaced Repetition (SRS)

O sistema já possui SRS implementado (SM-2). Cada flashcard tem:
- `ease_factor` - Fator de facilidade
- `interval` - Intervalo em dias
- `repetitions` - Número de revisões
- `next_review` - Data da próxima revisão

### Qualidade de resposta:
- Errei (1) → Repete em 1 dia
- Difícil (2) → Repete em 1 dia
- Bom (4) → Multiplica intervalo
- Fácil (5) → Maior multiplicador

---

## 6. Gamificação (XP + Níveis)

### Tabelas:
- `user_xp_logs` - Log detalhado de XP
- `user_streaks` - Controle de sequência

### Funções SQL:
- `add_user_xp(user_id, amount, reason)` - Adiciona XP e calcula nível
- `update_user_streak(user_id)` - Atualiza sequência

### Recompensas:
| Ação | XP |
|------|-----|
| Revisar flashcard | +5 |
| Questão correta | +10 |
| Questão errada | +2 |
| Sessão completa | +25 |
| Meta diária | +50 |
| Conteúdo gerado | +15 |
| Onboarding | +100 |

### Níveis:
- A cada 1000 XP = 1 nível
- Nível 1 → 0-999 XP
- Nível 2 → 1000-1999 XP
- E assim por diante

---

## 7. Migração do Banco de Dados

Arquivo: `supabase/migrations/20251206200000_add_onboarding_and_content_tables.sql`

Cria:
1. `user_preferences` - Preferências do usuário
2. `content_sources` - Fontes de conteúdo importado
3. `study_plans` - Plano de estudos semanal
4. `user_xp_logs` - Log de XP
5. `user_streaks` - Controle de sequência
6. Funções `add_user_xp` e `update_user_streak`

### Para aplicar:
```bash
cd supabase
supabase db push
# ou
supabase migrations up
```

---

## Variáveis de Ambiente

Crie um arquivo `.env` com:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
# Opcional - para geração com IA
VITE_OPENAI_API_KEY=sua_chave_openai
```

---

## Como Testar

1. **Onboarding:**
   - Faça login
   - Acesse `/onboarding`
   - Complete o wizard
   - Verifique XP ganho

2. **Importação:**
   - Vá para `/importar`
   - Cole um texto de estudo
   - Selecione uma matéria
   - Clique "Gerar"
   - Salve e verifique flashcards criados

3. **Next Best Action:**
   - No Dashboard, observe o card de recomendação
   - Clique no CTA e verifique o fluxo

4. **Revisão de Flashcards:**
   - Vá para `/flashcards`
   - Reveja cartões pendentes
   - Ganhe XP ao responder

---

## Arquitetura

```
src/
├── lib/
│   ├── contentGenerator.ts  # Provider de geração de conteúdo
│   └── nextBestAction.ts    # Motor de recomendações
├── pages/
│   ├── Onboarding.tsx      # Wizard de configuração
│   └── Importar.tsx        # Importação e geração
├── components/
│   └── EmptyState.tsx      # Estados vazios inteligentes
└── hooks/
    └── useUserProgress.ts  # Hook de progresso/XP
```

---

## Limitações Atuais

- PDF upload é apenas UI (precisa de Supabase Storage)
- Geração mock é básica (sem LLM real)
- Algumas warnings de lint em código existente

---

## Próximos Passos

- [ ] Upload real de PDFs
- [ ] Integração com OpenAI GPT-4
- [ ] Mais métricas de progresso
- [ ] Notifications push
- [ ] Modo offline
