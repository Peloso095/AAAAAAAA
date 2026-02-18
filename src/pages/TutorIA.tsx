import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, Bot, User, Sparkles, BookOpen, Table, 
  GitCompare, Clock, Lightbulb, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  format?: 'text' | 'table' | 'comparison' | 'timeline' | 'mindmap';
}

type ExpertiseLevel = 'leigo' | 'iniciante' | 'avancado' | 'residente';

const EXPERTISE_LABELS: Record<ExpertiseLevel, string> = {
  leigo: 'Leigo',
  iniciante: 'Estudante Iniciante',
  avancado: 'Estudante Avançado',
  residente: 'Residente',
};

const QUICK_PROMPTS = [
  { icon: <BookOpen className="h-4 w-4" />, label: 'Resumo', prompt: 'Faça um resumo sobre' },
  { icon: <Table className="h-4 w-4" />, label: 'Tabela', prompt: 'Crie uma tabela comparando' },
  { icon: <GitCompare className="h-4 w-4" />, label: 'Comparação', prompt: 'Compare e contraste' },
  { icon: <Clock className="h-4 w-4" />, label: 'Linha do Tempo', prompt: 'Crie uma linha do tempo de' },
  { icon: <Lightbulb className="h-4 w-4" />, label: 'Explicação', prompt: 'Explique de forma simples' },
];

const SAMPLE_RESPONSES: Record<string, string> = {
  'resumo': `## Resumo: Insuficiência Cardíaca

### Definição
Síndrome clínica caracterizada pela incapacidade do coração de bombear sangue adequadamente para suprir as demandas metabólicas dos tecidos.

### Classificação
- **IC com FE reduzida (ICFEr)**: FE ≤ 40%
- **IC com FE levemente reduzida (ICFElr)**: FE 41-49%
- **IC com FE preservada (ICFEp)**: FE ≥ 50%

### Sintomas Principais
- Dispneia aos esforços/repouso
- Ortopneia e DPN
- Edema de membros inferiores
- Fadiga e intolerância ao exercício

### Tratamento Base (ICFEr)
1. IECA/BRA ou ARNI
2. Beta-bloqueador
3. Antagonista mineralocorticoide
4. iSGLT2`,
  'tabela': `## Comparação: Classes de Anti-hipertensivos

| Classe | Exemplo | Mecanismo | Indicação Preferencial | Contraindicação |
|--------|---------|-----------|----------------------|-----------------|
| IECA | Enalapril | Inibe ECA | IC, DM, DRC | Gravidez, Estenose renal bilateral |
| BRA | Losartana | Bloqueia AT1 | Intolerância a IECA | Gravidez |
| BCC | Anlodipino | Bloqueia canais Ca | Idosos, Raça negra | IC descompensada |
| Diurético | HCTZ | Natriurese | Idosos, Raça negra | Gota |
| BB | Metoprolol | Bloqueia β1 | IC, Pós-IAM | Asma grave, BAV 2-3º |`,
  'comparacao': `## Comparação: Pneumonia vs Tuberculose

### Semelhanças
- Ambas afetam o parênquima pulmonar
- Podem apresentar tosse e febre
- Diagnóstico por imagem e exames

### Diferenças

| Aspecto | Pneumonia | Tuberculose |
|---------|-----------|-------------|
| Início | Agudo (horas a dias) | Insidioso (semanas) |
| Febre | Alta, contínua | Baixa, vespertina |
| Tosse | Produtiva | Seca → hemoptise |
| Radiografia | Consolidação lobar | Cavitações em ápices |
| Tratamento | ATB 5-7 dias | RIPE 6 meses |`,
};

export default function TutorIA() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expertiseLevel, setExpertiseLevel] = useState<ExpertiseLevel>('avancado');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (in production, this would call your AI backend)
    setTimeout(() => {
      let responseContent = '';
      const lowerInput = input.toLowerCase();

      if (lowerInput.includes('resumo')) {
        responseContent = SAMPLE_RESPONSES['resumo'];
      } else if (lowerInput.includes('tabela')) {
        responseContent = SAMPLE_RESPONSES['tabela'];
      } else if (lowerInput.includes('compar')) {
        responseContent = SAMPLE_RESPONSES['comparacao'];
      } else {
        // Default response based on expertise level
        const levelIntros: Record<ExpertiseLevel, string> = {
          leigo: 'Vou explicar de forma bem simples:\n\n',
          iniciante: 'Vamos entender o conceito básico:\n\n',
          avancado: 'Considerando os aspectos fisiopatológicos:\n\n',
          residente: 'Do ponto de vista clínico e baseado em evidências:\n\n',
        };

        responseContent = `${levelIntros[expertiseLevel]}Entendi sua pergunta sobre "${input}". Como seu tutor de medicina, vou ajudá-lo a compreender este tema.

### Pontos Principais
- Primeiro, é importante entender o contexto clínico
- Os mecanismos fisiopatológicos envolvidos
- As implicações para diagnóstico e tratamento

### Próximos Passos
1. Estude os conceitos fundamentais
2. Pratique com casos clínicos
3. Revise com flashcards

Gostaria que eu aprofundasse algum aspecto específico?`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt + ' ');
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Bot className="h-8 w-8 text-primary" />
              Tutor IA
            </h1>
            <p className="text-muted-foreground mt-1">Seu assistente de estudos médicos com IA</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Nível:</span>
            <Tabs value={expertiseLevel} onValueChange={(v) => setExpertiseLevel(v as ExpertiseLevel)}>
              <TabsList>
                <TabsTrigger value="leigo" className="text-xs">Leigo</TabsTrigger>
                <TabsTrigger value="iniciante" className="text-xs">Iniciante</TabsTrigger>
                <TabsTrigger value="avancado" className="text-xs">Avançado</TabsTrigger>
                <TabsTrigger value="residente" className="text-xs">Residente</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Olá! Sou seu Tutor de Medicina</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Posso ajudar você a entender conceitos médicos, criar resumos, tabelas comparativas, 
                  linhas do tempo e muito mais. Basta perguntar!
                </p>

                {/* Quick Prompts */}
                <div className="flex flex-wrap justify-center gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickPrompt(prompt.prompt)}
                      className="flex items-center gap-2"
                    >
                      {prompt.icon}
                      {prompt.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Bot className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            {message.content.split('\n').map((line, i) => {
                              if (line.startsWith('## ')) {
                                return <h2 key={i} className="text-lg font-bold mt-2 mb-1">{line.replace('## ', '')}</h2>;
                              }
                              if (line.startsWith('### ')) {
                                return <h3 key={i} className="text-base font-semibold mt-2 mb-1">{line.replace('### ', '')}</h3>;
                              }
                              if (line.startsWith('| ')) {
                                return (
                                  <div key={i} className="overflow-x-auto">
                                    <pre className="text-xs bg-background/50 p-2 rounded">{line}</pre>
                                  </div>
                                );
                              }
                              if (line.startsWith('- ')) {
                                return <li key={i} className="ml-4">{line.replace('- ', '')}</li>;
                              }
                              if (line.match(/^\d+\. /)) {
                                return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
                              }
                              return line ? <p key={i}>{line}</p> : <br key={i} />;
                            })}
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}
                        <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Pensando...</span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Quick Prompts (when there are messages) */}
          {messages.length > 0 && (
            <div className="px-4 py-2 border-t flex gap-2 overflow-x-auto">
              {QUICK_PROMPTS.map((prompt) => (
                <Button
                  key={prompt.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickPrompt(prompt.prompt)}
                  className="shrink-0"
                >
                  {prompt.icon}
                  <span className="ml-1">{prompt.label}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua pergunta..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Adaptando respostas para: <Badge variant="outline">{EXPERTISE_LABELS[expertiseLevel]}</Badge>
            </p>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
