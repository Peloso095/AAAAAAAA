import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, Clock, CheckCircle, XCircle, RotateCcw, Award,
  Stethoscope, MessageSquare, FileText, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OSCEStation {
  id: string;
  title: string;
  scenario: string;
  timeLimit: number; // seconds
  patientInfo: {
    name: string;
    age: number;
    gender: string;
    chiefComplaint: string;
  };
  checklist: {
    category: string;
    items: { id: string; text: string; points: number }[];
  }[];
  expectedFindings: string[];
  criticalActions: string[];
}

const OSCE_STATIONS: OSCEStation[] = [
  // Estação 1 - Já existente
  {
    id: '1',
    title: 'Anamnese - Dor Torácica',
    scenario: 'Paciente chega ao consultório queixando-se de dor no peito. Realize uma anamnese completa.',
    timeLimit: 480, // 8 minutes
    patientInfo: {
      name: 'João Silva',
      age: 55,
      gender: 'Masculino',
      chiefComplaint: 'Dor no peito há 2 horas',
    },
    checklist: [
      {
        category: 'Identificação e Acolhimento',
        items: [
          { id: 'greet', text: 'Cumprimentou o paciente e se apresentou', points: 1 },
          { id: 'confirm', text: 'Confirmou identidade do paciente', points: 1 },
          { id: 'comfort', text: 'Verificou conforto do paciente', points: 1 },
        ],
      },
      {
        category: 'História da Doença Atual',
        items: [
          { id: 'onset', text: 'Perguntou sobre início dos sintomas', points: 2 },
          { id: 'location', text: 'Investigou localização da dor', points: 2 },
          { id: 'character', text: 'Caracterizou o tipo de dor', points: 2 },
          { id: 'radiation', text: 'Perguntou sobre irradiação', points: 2 },
          { id: 'severity', text: 'Quantificou intensidade (0-10)', points: 2 },
          { id: 'triggers', text: 'Investigou fatores desencadeantes', points: 2 },
          { id: 'relief', text: 'Perguntou sobre fatores de alívio', points: 2 },
          { id: 'associated', text: 'Investigou sintomas associados', points: 2 },
        ],
      },
      {
        category: 'Antecedentes',
        items: [
          { id: 'diseases', text: 'Investigou doenças prévias (HAS, DM, DLP)', points: 2 },
          { id: 'medications', text: 'Perguntou sobre medicações em uso', points: 2 },
          { id: 'allergies', text: 'Verificou alergias', points: 1 },
          { id: 'surgeries', text: 'Perguntou sobre cirurgias prévias', points: 1 },
          { id: 'family', text: 'Investigou história familiar', points: 2 },
        ],
      },
      {
        category: 'Hábitos de Vida',
        items: [
          { id: 'smoking', text: 'Perguntou sobre tabagismo', points: 2 },
          { id: 'alcohol', text: 'Investigou etilismo', points: 1 },
          { id: 'exercise', text: 'Perguntou sobre atividade física', points: 1 },
        ],
      },
      {
        category: 'Comunicação',
        items: [
          { id: 'listen', text: 'Demonstrou escuta ativa', points: 2 },
          { id: 'empathy', text: 'Mostrou empatia', points: 2 },
          { id: 'summary', text: 'Resumiu informações ao final', points: 2 },
        ],
      },
    ],
    expectedFindings: [
      'Dor retroesternal, opressiva, iniciada há 2h',
      'Irradiação para MSE e mandíbula',
      'Sudorese e náuseas associadas',
      'HAS e DM em tratamento',
      'Tabagista 30 maços-ano',
    ],
    criticalActions: [
      'Reconhecer sinais de SCA',
      'Não atrasar encaminhamento',
    ],
  },
  // Estação 2 - Já existente
  {
    id: '2',
    title: 'Exame Físico - Abdome Agudo',
    scenario: 'Paciente com dor abdominal intensa. Realize o exame físico abdominal completo.',
    timeLimit: 600, // 10 minutes
    patientInfo: {
      name: 'Maria Santos',
      age: 45,
      gender: 'Feminino',
      chiefComplaint: 'Dor abdominal intensa há 6 horas',
    },
    checklist: [
      {
        category: 'Preparação',
        items: [
          { id: 'wash', text: 'Higienizou as mãos', points: 2 },
          { id: 'expose', text: 'Expôs abdome adequadamente', points: 1 },
          { id: 'position', text: 'Posicionou paciente em decúbito dorsal', points: 1 },
        ],
      },
      {
        category: 'Inspeção',
        items: [
          { id: 'contour', text: 'Observou contorno abdominal', points: 2 },
          { id: 'scars', text: 'Verificou cicatrizes', points: 1 },
          { id: 'distension', text: 'Avaliou distensão', points: 2 },
          { id: 'movements', text: 'Observou movimentos respiratórios', points: 1 },
        ],
      },
      {
        category: 'Ausculta',
        items: [
          { id: 'bowel', text: 'Auscultou ruídos hidroaéreos (4 quadrantes)', points: 3 },
          { id: 'bruits', text: 'Pesquisou sopros abdominais', points: 2 },
        ],
      },
      {
        category: 'Percussão',
        items: [
          { id: 'timpanism', text: 'Avaliou timpanismo/macicez', points: 2 },
          { id: 'liver', text: 'Delimitou área hepática', points: 2 },
          { id: 'shifting', text: 'Pesquisou macicez móvel', points: 2 },
        ],
      },
      {
        category: 'Palpação',
        items: [
          { id: 'superficial', text: 'Realizou palpação superficial', points: 2 },
          { id: 'deep', text: 'Realizou palpação profunda', points: 2 },
          { id: 'rebound', text: 'Pesquisou descompressão brusca', points: 3 },
          { id: 'murphy', text: 'Realizou sinal de Murphy', points: 2 },
          { id: 'rovsing', text: 'Pesquisou sinal de Rovsing', points: 2 },
          { id: 'blumberg', text: 'Verificou sinal de Blumberg', points: 2 },
        ],
      },
    ],
    expectedFindings: [
      'Abdome distendido',
      'RHA diminuídos',
      'Dor à palpação em FID',
      'Blumberg positivo',
      'Defesa abdominal',
    ],
    criticalActions: [
      'Reconhecer sinais de peritonite',
      'Solicitar avaliação cirúrgica',
    ],
  },
  // NOVAS ESTAÇÕES
  {
    id: '3',
    title: 'Anamnese — Dispneia Progressiva',
    scenario: 'Paciente com falta de ar aos pequenos esforços há 2 semanas. Realize anamnese completa.',
    timeLimit: 480, // 8 min
    patientInfo: {
      name: 'Carlos Oliveira',
      age: 68,
      gender: 'Masculino',
      chiefComplaint: 'Falta de ar aos pequenos esforços há 2 semanas',
    },
    checklist: [
      {
        category: 'Identificação e Acolhimento',
        items: [
          { id: 'greet3', text: 'Cumprimentou o paciente e se apresentou', points: 1 },
          { id: 'confirm3', text: 'Confirmou identidade do paciente', points: 1 },
        ],
      },
      {
        category: 'História da Dispneia',
        items: [
          { id: 'onset3', text: 'Perguntou sobre início da dispneia', points: 2 },
          { id: 'progression3', text: 'Investigou progressão dos sintomas', points: 2 },
          { id: 'grade3', text: 'Classificou a dispneia (NYHA)', points: 2 },
          { id: 'position3', text: 'Verificou orthopneia e platipneia', points: 2 },
          { id: 'paroxysmal3', text: 'Investigou dispneia paroxística noturna', points: 2 },
          { id: 'triggers3', text: 'Identificou fatores desencadeantes', points: 2 },
          { id: 'associated3', text: 'Perguntou sobre sintomas associados (tosse, edema, dor)', points: 2 },
        ],
      },
      {
        category: 'Antecedentes',
        items: [
          { id: 'cardiac3', text: 'Investigou doenças cardíacas prévias', points: 2 },
          { id: 'pulmonary3', text: 'Investigou doenças pulmonares', points: 2 },
          { id: 'meds3', text: 'Perguntou sobre medicações em uso', points: 1 },
        ],
      },
      {
        category: 'Comunicação',
        items: [
          { id: 'listen3', text: 'Demonstrou escuta ativa', points: 2 },
          { id: 'empathy3', text: 'Mostrou empatia', points: 2 },
          { id: 'summary3', text: 'Resumiu informações ao final', points: 2 },
        ],
      },
    ],
    expectedFindings: [
      'Dispneia progressiva aos esforços',
      'Ortopneia presente',
      'Edema de MMII',
      'História de HAS',
    ],
    criticalActions: [
      'Suspeitar insuficiência cardíaca',
      'Solicitar exames complementares',
    ],
  },
  {
    id: '4',
    title: 'Exame Físico — Ausculta Cardíaca',
    scenario: 'Paciente com sopro cardíaco detectado em check-up. Realize ausculta e identifique alterações.',
    timeLimit: 600, // 10 min
    patientInfo: {
      name: 'Ana Lima',
      age: 52,
      gender: 'Feminino',
      chiefComplaint: 'Sopro cardíaco detectado em check-up',
    },
    checklist: [
      {
        category: 'Preparação',
        items: [
          { id: 'wash4', text: 'Higienizou as mãos', points: 1 },
          { id: 'expose4', text: 'Expôs o tórax adequadamente', points: 1 },
        ],
      },
      {
        category: 'Inspeção',
        items: [
          { id: 'precordium4', text: 'Inspecionou o precórdio', points: 2 },
          { id: 'pulsations4', text: 'Verificou impulsões precordiais', points: 2 },
        ],
      },
      {
        category: 'Palpação',
        items: [
          { id: 'thrill4', text: 'Palpou frêmito', points: 3 },
          { id: 'ap4', text: 'Localizou e mediu PMI', points: 2 },
        ],
      },
      {
        category: 'Ausculta',
        items: [
          { id: 'b1b24', text: 'Avaliou bulhas B1 e B2', points: 2 },
          { id: 'murmur4', text: 'Identificou sopro (timbre, intensidade, localização)', points: 3 },
          { id: 'maneuver4', text: 'Realizou manobras fonacológicas', points: 2 },
          { id: 'radiation4', text: 'Verificou irradiação do sopro', points: 2 },
        ],
      },
      {
        category: 'Achados Adicionais',
        items: [
          { id: 'extra4', text: 'Avaliou третього bulha (B3)', points: 2 },
          { id: 'friction4', text: 'Pesquisou atrito pericárdico', points: 2 },
        ],
      },
    ],
    expectedFindings: [
      'Sopro sistólico em foco aórtico',
      'Irradiação para carótidas',
      'Intensidade 3/6',
    ],
    criticalActions: [
      'Caracterizar o sopro adequadamente',
      'Encaminhar para avaliação cardiológica',
    ],
  },
  {
    id: '5',
    title: 'Comunicação de Diagnóstico Grave',
    scenario: 'Comunique o diagnóstico de câncer de pulmão ao paciente e oriente sobre próximos passos.',
    timeLimit: 720, // 12 min
    patientInfo: {
      name: 'Roberto Costa',
      age: 61,
      gender: 'Masculino',
      chiefComplaint: 'Resultado de biópsia: carcinoma broncogênico',
    },
    checklist: [
      {
        category: 'Preparação',
        items: [
          { id: 'privacy5', text: 'Garantiu privacidade', points: 2 },
          { id: 'setting5', text: 'Verificou ambiente adequado', points: 1 },
          { id: 'support5', text: 'Verificou presença de familiar se desejado', points: 1 },
        ],
      },
      {
        category: 'Comunicação',
        items: [
          { id: 'warning5', text: 'Utilizou alertas antes da notícia', points: 2 },
          { id: 'clear5', text: 'Comunicou diagnóstico de forma clara', points: 3 },
          { id: 'language5', text: 'Evitou linguagem excessivamente técnica', points: 2 },
          { id: 'paused5', text: 'Deu pausas para processamento', points: 2 },
          { id: 'emotion5', text: 'Validou emoções do paciente', points: 2 },
          { id: 'questions5', text: 'Permitiu perguntas', points: 2 },
        ],
      },
      {
        category: 'Orientações',
        items: [
          { id: 'treatment5', text: 'Explicou opções de tratamento', points: 2 },
          { id: 'next5', text: 'Esclareceu próximos passos', points: 2 },
          { id: 'support5b', text: 'Indicou suporte psicológico', points: 1 },
          { id: 'follow5', text: 'Agendou retorno', points: 1 },
        ],
      },
    ],
    expectedFindings: [
      'Comunicação empática e clara',
      'Paciente compreendeu diagnóstico',
      'Plano de tratamento delineado',
    ],
    criticalActions: [
      'Não quitar esperança',
      'Garantir compreensão do paciente',
    ],
  },
  {
    id: '6',
    title: 'Anamnese — Dor Abdominal Crônica',
    scenario: 'Paciente com dor epigástrica recorrente há 3 meses. Investigue causas e fatores de risco.',
    timeLimit: 480, // 8 min
    patientInfo: {
      name: 'Fernanda Souza',
      age: 38,
      gender: 'Feminino',
      chiefComplaint: 'Dor epigástrica recorrente há 3 meses',
    },
    checklist: [
      {
        category: 'Caracterização da Dor',
        items: [
          { id: 'onset6', text: 'Perguntou sobre início', points: 1 },
          { id: 'frequency6', text: 'Investigou frequência', points: 2 },
          { id: 'timing6', text: 'Verificou relação com refeições', points: 2 },
          { id: 'character6', text: 'Caracterizou a dor', points: 2 },
          { id: 'radiation6', text: 'Perguntou sobre irradiação', points: 1 },
        ],
      },
      {
        category: 'Sintomas Associados',
        items: [
          { id: 'nausea6', text: 'Investigou náuseas/vômitos', points: 2 },
          { id: 'heartburn6', text: 'Perguntou sobre pirose', points: 2 },
          { id: 'bloating6', text: 'Verificou distensão', points: 1 },
          { id: 'weight6', text: 'Investigou perda de peso', points: 2 },
        ],
      },
      {
        category: 'Fatores de Risco',
        items: [
          { id: 'smoking6', text: 'Perguntou sobre tabagismo', points: 2 },
          { id: 'alcohol6', text: 'Investigou etilismo', points: 1 },
          { id: 'meds6', text: 'Perguntou sobre AINES/antiácidos', points: 2 },
          { id: 'stress6', text: 'Avaliou nível de estresse', points: 1 },
        ],
      },
      {
        category: 'Comunicação',
        items: [
          { id: 'listen6', text: 'Demonstrou escuta ativa', points: 2 },
          { id: 'empathy6', text: 'Mostrou empatia', points: 2 },
        ],
      },
    ],
    expectedFindings: [
      'Dor relacionada a refeições',
      'Pirose associada',
      'Uso de AINES',
    ],
    criticalActions: [
      'Suspeitar doença ulcerosa',
      'Solicitar endoscopia digestiva',
    ],
  },
  {
    id: '7',
    title: 'Exame Neurológico — Alteração de Consciência',
    scenario: 'Familiar relata confusão mental aguda. Realize avaliação neurológica dirigida.',
    timeLimit: 600, // 10 min
    patientInfo: {
      name: 'Paulo Mendes',
      age: 74,
      gender: 'Masculino',
      chiefComplaint: 'Confusão mental aguda relatada pelo familiar',
    },
    checklist: [
      {
        category: 'Avaliação do Nível de Consciência',
        items: [
          { id: 'glasgow7', text: 'Escalou Glasgow', points: 3 },
          { id: 'avpu7', text: 'Avaliou resposta AVPU', points: 2 },
        ],
      },
      {
        category: 'Orientações',
        items: [
          { id: 'time7', text: 'Verificou orientação temporal', points: 2 },
          { id: 'space7', text: 'Verificou orientação espacial', points: 2 },
          { id: 'person7', text: 'Verificou orientação pessoal', points: 2 },
        ],
      },
      {
        category: 'Avaliação Cognitiva',
        items: [
          { id: 'memory7', text: 'Avaliou memória recente', points: 2 },
          { id: 'attention7', text: 'Testou atenção', points: 2 },
          { id: 'language7', text: 'Avaliou linguagem', points: 2 },
        ],
      },
      {
        category: 'Exame Físico Neurológico',
        items: [
          { id: 'pupils7', text: 'Avaliou pupilas (tamanho, simetria, reflexos)', points: 3 },
          { id: 'motor7', text: 'Avaliou força motora', points: 2 },
          { id: 'sensory7', text: 'Avaliou sensibilidade', points: 2 },
          { id: 'reflexes7', text: 'Avaliou reflexos', points: 2 },
        ],
      },
    ],
    expectedFindings: [
      'Confusão mental',
      'Desorientação témporo-espacial',
      'Atenção comprometida',
    ],
    criticalActions: [
      'Descartar causas metabolicamente reversíveis',
      'Solicitar TC de crânio',
    ],
  },
  {
    id: '8',
    title: 'Prescrição Médica — Hipertensão Descompensada',
    scenario: 'Paciente com PA 180x110 mmHg em pronto-socorro. Elabore a prescrição inicial.',
    timeLimit: 360, // 6 min
    patientInfo: {
      name: 'Marlene Ramos',
      age: 59,
      gender: 'Feminino',
      chiefComplaint: 'PA 180x110 mmHg em pronto-socorro',
    },
    checklist: [
      {
        category: 'Avaliação Inicial',
        items: [
          { id: 'history8', text: 'Revisou história clínica', points: 2 },
          { id: 'symptoms8', text: 'Investigou sintomas (cefaleia, tontura, alterações visuais)', points: 2 },
          { id: 'exam8', text: 'Verificou exame neurológico básico', points: 2 },
        ],
      },
      {
        category: 'Prescrição',
        items: [
          { id: 'antihypertensive8', text: 'Escolheu anti-hipertensivo adequado', points: 3 },
          { id: 'dose8', text: 'Prescreveu dose correta', points: 2 },
          { id: 'route8', text: 'Definiu via de administração', points: 2 },
          { id: 'target8', text: 'Estabeleceu meta de PA', points: 2 },
          { id: 'monitor8', text: 'Definiu monitorização', points: 2 },
        ],
      },
      {
        category: 'Cuidados',
        items: [
          { id: 'education8', text: 'Orientou paciente', points: 1 },
          { id: 'follow8', text: 'Agendou retorno', points: 1 },
          { id: 'referral8', text: 'Verificou necessidade de encaminhamento', points: 2 },
        ],
      },
    ],
    expectedFindings: [
      'PA 180x110 = hipertensão grave',
      'Início de anti-hipertensivo IV',
      'Monitorização frequente',
    ],
    criticalActions: [
      'Reduzir PA gradualmente (não muito rápido)',
      'Avaliar lesões de órgão alvo',
    ],
  },
];

export default function SimuladorOSCE() {
  const [selectedStation, setSelectedStation] = useState<OSCEStation | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setShowResults(true);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startStation = (station: OSCEStation) => {
    setSelectedStation(station);
    setTimeLeft(station.timeLimit);
    setCheckedItems(new Set());
    setNotes('');
    setShowResults(false);
    setIsRunning(true);
  };

  const toggleItem = (itemId: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const calculateScore = useCallback(() => {
    if (!selectedStation) return { earned: 0, total: 0, percentage: 0 };
    let earned = 0;
    let total = 0;
    selectedStation.checklist.forEach((category) => {
      category.items.forEach((item) => {
        total += item.points;
        if (checkedItems.has(item.id)) {
          earned += item.points;
        }
      });
    });
    return { earned, total, percentage: Math.round((earned / total) * 100) };
  }, [selectedStation, checkedItems]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetStation = () => {
    if (selectedStation) {
      setTimeLeft(selectedStation.timeLimit);
      setCheckedItems(new Set());
      setNotes('');
      setShowResults(false);
      setIsRunning(false);
    }
  };

  const finishStation = () => {
    setIsRunning(false);
    setShowResults(true);
  };

  if (!selectedStation) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Simulador OSCE</h1>
            <p className="text-muted-foreground mt-1">Treinamento para provas práticas</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {OSCE_STATIONS.map((station) => (
              <motion.div
                key={station.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => startStation(station)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{station.title}</CardTitle>
                        <CardDescription className="mt-2">{station.scenario}</CardDescription>
                      </div>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.floor(station.timeLimit / 60)} min
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Stethoscope className="h-4 w-4" />
                        <span>{station.patientInfo.name}, {station.patientInfo.age}a</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{station.checklist.reduce((acc, cat) => acc + cat.items.length, 0)} itens</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Estação
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const score = calculateScore();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{selectedStation.title}</h1>
            <p className="text-muted-foreground">{selectedStation.patientInfo.chiefComplaint}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-mono font-bold ${timeLeft < 60 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="flex gap-2">
              {isRunning ? (
                <Button variant="destructive" onClick={finishStation}>
                  Finalizar
                </Button>
              ) : !showResults ? (
                <Button onClick={() => setIsRunning(true)}>
                  <Play className="h-4 w-4 mr-2" />
                  Continuar
                </Button>
              ) : null}
              <Button variant="outline" onClick={resetStation}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" onClick={() => setSelectedStation(null)}>
                Voltar
              </Button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso</span>
              <span className="text-sm text-muted-foreground">
                {checkedItems.size} / {selectedStation.checklist.reduce((acc, cat) => acc + cat.items.length, 0)} itens
              </span>
            </div>
            <Progress value={(checkedItems.size / selectedStation.checklist.reduce((acc, cat) => acc + cat.items.length, 0)) * 100} />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Checklist */}
          <div className="lg:col-span-2 space-y-4">
            {selectedStation.checklist.map((category) => (
              <Card key={category.category}>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">{category.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {category.items.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        checkedItems.has(item.id) ? 'bg-primary/10' : 'hover:bg-muted'
                      }`}
                    >
                      <Checkbox
                        checked={checkedItems.has(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                        disabled={showResults}
                      />
                      <span className="flex-1 text-sm">{item.text}</span>
                      <Badge variant="outline">{item.points} pts</Badge>
                    </label>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Patient Info */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><strong>Nome:</strong> {selectedStation.patientInfo.name}</p>
                <p><strong>Idade:</strong> {selectedStation.patientInfo.age} anos</p>
                <p><strong>Sexo:</strong> {selectedStation.patientInfo.gender}</p>
                <p><strong>Queixa:</strong> {selectedStation.patientInfo.chiefComplaint}</p>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Anotações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Faça suas anotações aqui..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Results */}
            <AnimatePresence>
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={score.percentage >= 70 ? 'border-green-500' : score.percentage >= 50 ? 'border-yellow-500' : 'border-red-500'}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Resultado Final
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${
                          score.percentage >= 70 ? 'text-green-500' : score.percentage >= 50 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {score.percentage}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {score.earned} / {score.total} pontos
                        </div>
                        <div className="mt-2">
                          {score.percentage >= 70 ? (
                            <Badge className="bg-green-500">Aprovado</Badge>
                          ) : score.percentage >= 50 ? (
                            <Badge className="bg-yellow-500">Recuperação</Badge>
                          ) : (
                            <Badge variant="destructive">Reprovado</Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">Achados Esperados:</div>
                        {selectedStation.expectedFindings.map((finding, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {finding}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-medium text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Ações Críticas:
                        </div>
                        {selectedStation.criticalActions.map((action, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-destructive">
                            <XCircle className="h-3 w-3" />
                            {action}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
