# MEDTRACK - Plataforma de Estudos Médicos

Sistema completo de estudos para medicina com recursos avançados de aprendizado e automação.

## 🛠️ Stack Técnica

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Radix UI + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Estado:** React Query + Context API
- **Animações:** Framer Motion
- **Rotas:** React Router DOM 6

## 🎯 Novas Funcionalidades (v2.0)

### 🤖 Automação & IA
- **Onboarding Guiado** - Wizard de 3 min que configura tudo automaticamente
- **Importar Conteúdo** - Cole texto e gere flashcards/questões automaticamente
- **Next Best Action** - Dashboard recomenda a melhor próxima ação
- **Empty States Inteligentes** - CTAs claros em telas vazias

### 📚 Estudos Automatizados
- **Geração de Conteúdo** - Resumos, flashcards e questões a partir de texto
- **Spaced Repetition (SRS)** - Algoritmo SM-2 para revisão otimizada
- **Agenda Auto-preenchida** - Baseada no plano de estudos

### 🎮 Gamificação
- **Sistema de XP** - Ganhe XP por todas as ações
- **Níveis** - A cada 1000 XP sobe um nível
- **Streaks** - Mantenha sua sequência de estudos
- **Conquistas** - Desbloqueie achievements

## 🎯 Funcionalidades

### 📚 Estudos
- **Flashcards** - Sistema de repetição espaçada
- **Questões** - Banco de questões com estatísticas
- **Resumos** - Criação e organização de resumos
- **Matérias** - Gestão de disciplinas

### 🏥 Prática Clínica
- **Clínica Virtual** - Casos clínicos interativos
- **Simulador OSCE** - Simulação de exames práticos
- **Procedimentos** - Guia de procedimentos médicos
- **Biblioteca Diagnóstica** - Protocolos e guidelines

### 🧮 Ferramentas
- **Calculadoras Médicas** - IMC, Glasgow, CHADS, etc
- **Comparador** - Compare diagnósticos diferenciais
- **Ranking de Sintomas** - Análise de sintomas

### 🤖 IA
- **Tutor IA** - Assistente virtual para dúvidas
- **Soft Skills** - Desenvolvimento pessoal

### 📅 Organização
- **Agenda** - Planejamento de estudos
- **Portfolio** - Acompanhamento de evolução

## 🚀 Como usar

### Instalação
```bash
npm install
```

### Configuração do Banco
```bash
# Aplique as migrações
cd supabase
supabase db push
# ou
supabase migrations up
```

### Variáveis de Ambiente
Crie um arquivo `.env`:
```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
# Opcional - para geração com IA
VITE_OPENAI_API_KEY=sua_chave_openai
```

### Desenvolvimento
```bash
npm run dev
```

Acesse: http://localhost:5173

### Build
```bash
npm run build
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/           # Componentes shadcn/ui
│   ├── layout/       # Layout (Sidebar, Header, etc)
│   └── EmptyState.tsx
├── contexts/         # React Contexts (Auth, User)
├── hooks/            # Hooks customizados
├── integrations/
│   └── supabase/     # Cliente e tipos Supabase
├── lib/
│   ├── contentGenerator.ts  # Provider de geração
│   ├── nextBestAction.ts   # Motor de recomendações
│   └── utils.ts
├── pages/            # Páginas da aplicação
│   ├── Onboarding.tsx
│   ├── Importar.tsx
│   └── Dashboard.tsx
└── types/            # Tipos TypeScript
```

## 🗂️ Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard principal |
| `/auth` | Login/Cadastro |
| `/onboarding` | Configuração inicial |
| `/importar` | Importar conteúdo |
| `/materias` | Matérias |
| `/flashcards` | Flashcards SRS |
| `/questoes` | Questões |
| `/resumos` | Resumos |
| `/agenda` | Agenda |
| `/conquistas` | Conquistas |

## 📊 Regras de XP

| Ação | XP |
|------|-----|
| Revisar flashcard | +5 |
| Questão correta | +10 |
| Questão errada | +2 |
| Sessão completa | +25 |
| Meta diária | +50 |
| Conteúdo gerado | +15 |
| Onboarding | +100 |

## 📄 Documentação

- [FEATURES.md](./FEATURES.md) - Detalhes das novas funcionalidades

## 🧪 Testes

```bash
# Run linting
npm run lint

# Run type check
npm run build
```
"# AAAAAAAA" 
"# AAAAAAAA" 
