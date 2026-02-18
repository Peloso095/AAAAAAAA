import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Syringe, Heart, Stethoscope, Scissors, Activity,
  CheckCircle, AlertTriangle, Play, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Procedure {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  difficulty: 'Básico' | 'Intermediário' | 'Avançado';
  duration: string;
  materials: string[];
  steps: {
    id: string;
    title: string;
    description: string;
    tips?: string[];
    warnings?: string[];
  }[];
  complications: string[];
}

const PROCEDURES: Procedure[] = [
  // Acesso Vascular
  {
    id: 'venipuncture',
    title: 'Punção Venosa Periférica',
    category: 'Acesso Vascular',
    icon: <Syringe className="h-5 w-5" />,
    difficulty: 'Básico',
    duration: '5-10 min',
    materials: [
      'Luvas de procedimento',
      'Garrote/torniquete',
      'Algodão/gaze',
      'Álcool 70%',
      'Jelco/cateter adequado',
      'Esparadrapo/Micropore',
      'Equipo de soro (se necessário)',
    ],
    steps: [
      {
        id: '1',
        title: 'Preparação',
        description: 'Lave as mãos, separe o material, identifique-se ao paciente e explique o procedimento.',
        tips: ['Escolha o membro não dominante', 'Verifique alergias ao látex'],
      },
      {
        id: '2',
        title: 'Escolha do local',
        description: 'Coloque o garrote 10-15cm acima do local escolhido. Palpe as veias para escolher a melhor opção.',
        tips: ['Prefira veias do antebraço', 'Evite áreas com hematomas ou flebite'],
        warnings: ['Não puncione em membro com fístula ou mastectomia'],
      },
      {
        id: '3',
        title: 'Antissepsia',
        description: 'Faça antissepsia com álcool 70% em movimentos circulares do centro para a periferia.',
        tips: ['Aguarde secar completamente'],
      },
      {
        id: '4',
        title: 'Punção',
        description: 'Estabilize a veia com o polegar, insira o cateter com bisel para cima em ângulo de 15-30°.',
        tips: ['Avance lentamente', 'Observe o refluxo de sangue'],
      },
      {
        id: '5',
        title: 'Avanço do cateter',
        description: 'Ao visualizar refluxo, diminua o ângulo e avance apenas o cateter plástico.',
        warnings: ['Nunca reintroduza a agulha após retirar'],
      },
      {
        id: '6',
        title: 'Fixação',
        description: 'Solte o garrote, retire a agulha, comprima a veia, conecte o equipo e fixe com micropore.',
        tips: ['Faça curativo transparente para melhor visualização'],
      },
    ],
    complications: [
      'Hematoma',
      'Flebite',
      'Infiltração',
      'Infecção local',
      'Punção arterial acidental',
    ],
  },
  {
    id: 'cvc',
    title: 'Cateterismo Venoso Central (CVC)',
    category: 'Acesso Vascular',
    icon: <Syringe className="h-5 w-5" />,
    difficulty: 'Avançado',
    duration: '20-30 min',
    materials: [
      'Kit de CVC',
      'Luvas estéreis',
      'Gorro e máscara',
      'Avental estéril',
      'Campos estéreis',
      'Anestésico local',
      'Fio guias',
      'Cateter central',
      'Soro fisiológico',
      'Fixador',
    ],
    steps: [
      {
        id: '1',
        title: 'Preparação',
        description: 'Lave as mãos, coloque EPIs (gorro, máscara, avental), prepare o campo estéril.',
        tips: ['Técnica asséptica rigorosa'],
      },
      {
        id: '2',
        title: 'Identificação do sítio',
        description: 'Identifique veia subclávia ou jugular com ultrassom.',
        warnings: ['Evite punção em coagulopatia grave'],
      },
      {
        id: '3',
        title: 'Anestesia',
        description: 'Infiltre anestésico local no local da punção.',
      },
      {
        id: '4',
        title: 'Punção',
        description: 'Puncione com agulha attached à seringa sob visão ultrassonográfica.',
        tips: ['Aspire para confirmar sangue venoso'],
      },
      {
        id: '5',
        title: 'Introdução do fio',
        description: 'Insira o fio guia através da agulha.',
        warnings: ['Não force o fio guia'],
      },
      {
        id: '6',
        title: 'Dilatação',
        description: 'Faça dilatação da pele e tecido subcutâneo.',
      },
      {
        id: '7',
        title: 'Passagem do cateter',
        description: 'Insira o cateter sobre o fio guia até a posição correta.',
        tips: ['Confirme posição com Raio-X'],
      },
      {
        id: '8',
        title: 'Fixação',
        description: 'Fixe o cateter com pontos e curativo estéril.',
      },
      {
        id: '9',
        title: 'Verificação',
        description: 'Confirme posição com radiografia de tórax.',
        warnings: ['Cateter deve estar na veia cava superior'],
      },
      {
        id: '10',
        title: 'Prescrição',
        description: 'Prescreva heparinização e cuidados.',
      },
    ],
    complications: [
      'Pneumotórax',
      'Punção arterial',
      'Hemotórax',
      'Infecção',
      'Trombose',
    ],
  },
  {
    id: 'gasometry',
    title: 'Gasometria Arterial',
    category: 'Acesso Vascular',
    icon: <Syringe className="h-5 w-5" />,
    difficulty: 'Básico',
    duration: '5-10 min',
    materials: [
      'Seringa de gasometria',
      'Agulha 22G ou 23G',
      'Luvas',
      'Algodão com álcool',
      'Gaze',
      'Escarificador',
      'Capalha de heparinizada',
    ],
    steps: [
      {
        id: '1',
        title: 'Preparação',
        description: 'Prepare a seringa heparinizada, identifique o paciente.',
      },
      {
        id: '2',
        title: 'Escolha do local',
        description: 'Geralmente artéria radial, pode usar femoral ou braquial.',
        tips: ['Teste de Allen antes da punção radial'],
      },
      {
        id: '3',
        title: 'Antissepsia',
        description: 'Limpe o local com álcool.',
      },
      {
        id: '4',
        title: 'Punção',
        description: 'Puncione a artéria com agulha em ângulo de 45-90°.',
        warnings: ['Não utilize garrote'],
      },
      {
        id: '5',
        title: 'Coleta',
        description: 'Colete 1-2mL de sangue arterial.',
        tips: ['Não introduza bolhas na seringa'],
      },
      {
        id: '6',
        title: 'Compressão',
        description: 'Comprima o local por 5-10 minutos.',
        warnings: ['Verifique sangramento antes de liberar'],
      },
    ],
    complications: [
      'Hematoma',
      'Infecção',
      'Lesão nervosa',
      'Trombose',
    ],
  },
  {
    id: 'intraosseous',
    title: 'Acesso Intraósseo',
    category: 'Acesso Vascular',
    icon: <Syringe className="h-5 w-5" />,
    difficulty: 'Intermediário',
    duration: '5-10 min',
    materials: [
      'Kit de acesso intraósseo',
      'Luvas estéreis',
      'Anestésico local',
      'Soro fisiológico',
      'Equipo',
    ],
    steps: [
      {
        id: '1',
        title: 'Indicação',
        description: 'Indicado quando acesso venoso não é possível.',
        warnings: ['Não usar em ossos fraturados'],
      },
      {
        id: '2',
        title: 'Escolha do local',
        description: 'Preferencialmente tíbia proximal (2cm abaixo da tuberosidade).',
      },
      {
        id: '3',
        title: 'Anestesia',
        description: 'Anestesie pele e periósseo localmente.',
      },
      {
        id: '4',
        title: 'Inserção',
        description: 'Insira a agulha perpendicular ao osso, com movimento de rotação.',
        tips: ['Avance até "falha" na resistência'],
      },
      {
        id: '5',
        title: 'Aspiração',
        description: 'Aspire medula óssea para confirmar posição.',
        tips: ['Pode usar SF para confirmar fluxo'],
      },
      {
        id: '6',
        title: 'Fixação',
        description: 'Fixe a agulha e conecte o equipo.',
      },
      {
        id: '7',
        title: 'Infusão',
        description: 'Inicie infusão de fluidos/medicamentos.',
        warnings: ['Não infundir soluções hipertonicas pelo IO'],
      },
    ],
    complications: [
      'Fratura óssea',
      'Infecção',
      'Extravasamento',
      'Síndrome compartimental',
    ],
  },
  // Cirurgia
  {
    id: 'suture',
    title: 'Sutura Simples Interrompida',
    category: 'Cirurgia',
    icon: <Scissors className="h-5 w-5" />,
    difficulty: 'Básico',
    duration: '10-15 min',
    materials: [
      'Kit de pequena cirurgia',
      'Luvas estéreis',
      'Campo estéril',
      'Anestésico local (lidocaína)',
      'Seringa e agulha',
      'Fio de sutura adequado',
      'Soro fisiológico',
      'Antisséptico',
    ],
    steps: [
      {
        id: '1',
        title: 'Avaliação da ferida',
        description: 'Avalie profundidade, contaminação, bordas, estruturas acometidas e tempo de lesão.',
        tips: ['Feridas > 6h necessitam debridamento'],
        warnings: ['Não suture feridas contaminadas sem lavagem'],
      },
      {
        id: '2',
        title: 'Anestesia',
        description: 'Infiltre anestésico local nas bordas da ferida, aguarde 3-5 minutos.',
        tips: ['Dose máxima lidocaína: 4mg/kg (7mg/kg com adrenalina)'],
      },
      {
        id: '3',
        title: 'Limpeza',
        description: 'Lave abundantemente com SF 0,9%, remova corpos estranhos e tecido desvitalizado.',
      },
      {
        id: '4',
        title: 'Posicionamento do porta-agulhas',
        description: 'Segure a agulha no terço médio, perpendicular ao porta-agulhas.',
      },
      {
        id: '5',
        title: 'Passagem do fio',
        description: 'Entre perpendicular à pele, a 3-5mm da borda, saia no mesmo nível no lado oposto.',
        tips: ['Movimento de supinação do punho', 'Bordas devem ficar evertidas'],
      },
      {
        id: '6',
        title: 'Confecção do nó',
        description: 'Faça nó com 3 seminós: 2 voltas, 1 volta, 1 volta (em direções alternadas).',
        tips: ['Não aperte demais para evitar isquemia'],
      },
      {
        id: '7',
        title: 'Curativo',
        description: 'Limpe com SF, aplique pomada e curativo estéril.',
      },
      {
        id: '8',
        title: 'Orientações',
        description: 'Oriente sobre cuidados pós-operatórios e retorno.',
      },
    ],
    complications: [
      'Infecção',
      'Deiscência',
      'Necrose de bordas',
      'Cicatriz hipertrófica',
      'Quelóide',
    ],
  },
  {
    id: 'abscess',
    title: 'Drenagem de Abscesso',
    category: 'Cirurgia',
    icon: <Scissors className="h-5 w-5" />,
    difficulty: 'Intermediário',
    duration: '15-20 min',
    materials: [
      'Kit de pequena cirurgia',
      'Luvas estéreis',
      'Anestésico local',
      'Bisturi',
      'Pinça Halstead',
      'Gaze',
      'Dreno',
      'Soro fisiológico',
    ],
    steps: [
      {
        id: '1',
        title: 'Avaliação',
        description: 'Delimite a área do abscesso com palpação.',
        tips: ['Use ultrassom se disponível'],
      },
      {
        id: '2',
        title: 'Anestesia',
        description: 'Anestesie o local com lidocaína.',
      },
      {
        id: '3',
        title: 'Incisão',
        description: 'Faça incisão ampla sobre o ponto mais flutuante.',
        tips: ['Incisão suficiente para drenagem adequada'],
      },
      {
        id: '4',
        title: 'Drenagem',
        description: 'Esprema suavemente para remover todo o pus.',
        warnings: ['Não force muito para evitar disseminação'],
      },
      {
        id: '5',
        title: 'Cavidade',
        description: 'Explore a cavidade com pinça para quebrar septações.',
      },
      {
        id: '6',
        title: 'Dreno',
        description: 'Coloque dreno se cavidade grande.',
      },
      {
        id: '7',
        title: 'Curativo',
        description: 'Faça curativo compressivo.',
      },
      {
        id: '8',
        title: 'Orientação',
        description: 'Oriente sobre limpeza e retorno.',
      },
      {
        id: '9',
        title: 'Prescrição',
        description: 'Prescreva antibiótico se indicado.',
      },
    ],
    complications: [
      'Recidiva',
      'Cicatriz',
      'Infecção',
      'Lesão de estruturas profundas',
    ],
  },
  {
    id: 'cricothyroidotomy',
    title: 'Cricotireoidostomia de Emergência',
    category: 'Cirurgia',
    icon: <Scissors className="h-5 w-5" />,
    difficulty: 'Avançado',
    duration: '5 min',
    materials: [
      'Bisturi',
      'Pinça ou tracheal hook',
      'Tubo de traqueostomia ou cannula',
      'Luvas',
      'Antisséptico',
    ],
    steps: [
      {
        id: '1',
        title: 'Indicação',
        description: 'Obstrução de vias aéreas superiores não resolvida por manobras básicas.',
        warnings: ['Último recurso quando intubação não é possível'],
      },
      {
        id: '2',
        title: 'Posicionamento',
        description: 'Posicione o paciente em decúbito dorsal, pescoço em extensão.',
      },
      {
        id: '3',
        title: 'Identificação',
        description: 'Identifique a membrana cricotireóidea (entre tireoide e cricóide).',
      },
      {
        id: '4',
        title: 'Incisão',
        description: 'Faça incisão transversal de 1-2cm na membrana.',
      },
      {
        id: '5',
        title: 'Abertura',
        description: 'Abra a membrana com pinça ou bisturi.',
      },
      {
        id: '6',
        title: 'Inseração do tubo',
        description: 'Insira o tubo na traqueia.',
        warnings: ['Não insira muito profundo'],
      },
    ],
    complications: [
      'Infecção',
      'Lesão de estruturas adjacentes',
      'Estenose',
      'Pneumotórax',
    ],
  },
  // Diagnóstico
  {
    id: 'ecg',
    title: 'Eletrocardiograma (ECG)',
    category: 'Diagnóstico',
    icon: <Activity className="h-5 w-5" />,
    difficulty: 'Básico',
    duration: '5-10 min',
    materials: [
      'Eletrocardiógrafo',
      'Eletrodos adesivos ou com gel',
      'Gel condutor (se necessário)',
      'Algodão com álcool',
      'Papel para impressão',
    ],
    steps: [
      {
        id: '1',
        title: 'Preparação do paciente',
        description: 'Explique o procedimento, posicione em decúbito dorsal, exponha tórax e membros.',
        tips: ['Remova joias metálicas', 'Relaxe o paciente para reduzir artefatos'],
      },
      {
        id: '2',
        title: 'Limpeza da pele',
        description: 'Limpe os locais de fixação com álcool para remover oleosidade.',
        tips: ['Em homens com muitos pelos, pode ser necessário raspar'],
      },
      {
        id: '3',
        title: 'Derivações precordiais',
        description: 'V1: 4º EIC paraesternal D, V2: 4º EIC paraesternal E, V3: entre V2 e V4, V4: 5º EIC linha hemiclavicular E, V5: 5º EIC linha axilar anterior E, V6: 5º EIC linha axilar média E',
        warnings: ['Posicionamento incorreto altera o traçado'],
      },
      {
        id: '4',
        title: 'Derivações periféricas',
        description: 'RA (vermelho): punho direito, LA (amarelo): punho esquerdo, RL (preto): tornozelo direito, LL (verde): tornozelo esquerdo',
        tips: ['Lembre: "Vermelho à direita, verde à esquerda" ou "Right-Red"'],
      },
      {
        id: '5',
        title: 'Verificação e registro',
        description: 'Verifique todas as conexões, calibre o aparato (10mm/mV), registre com velocidade de 25mm/s.',
      },
      {
        id: '6',
        title: 'Análise sistemática',
        description: 'Identifique: ritmo, FC, eixo, intervalos (PR, QRS, QT), alterações de ST/T.',
      },
      {
        id: '7',
        title: 'Laudo',
        description: 'Interprete o traçado e emita laudo.',
      },
    ],
    complications: [
      'Artefatos por movimento',
      'Interferência elétrica',
      'Troca de eletrodos',
    ],
  },
  {
    id: 'fast',
    title: 'Ultrassonografia FAST',
    category: 'Diagnóstico',
    icon: <Activity className="h-5 w-5" />,
    difficulty: 'Intermediário',
    duration: '10-15 min',
    materials: [
      'Aparelho de ultrassom',
      'Transdutor convexo',
      'Gel acústico',
      'Luvas',
    ],
    steps: [
      {
        id: '1',
        title: 'Indicação',
        description: 'Avaliação de trauma abdominal, hemoperitônio, líquido livre.',
      },
      {
        id: '2',
        title: 'Posicionamento',
        description: 'Paciente em decúbito dorsal.',
      },
      {
        id: '3',
        title: 'Janela hepática',
        description: 'Avalie espaço de Morrison (fígado-rim) e subdiafragmático D.',
      },
      {
        id: '4',
        title: 'Janela esplênica',
        description: 'Avalie espaço esplenorrenal e subdiafragmático E.',
      },
      {
        id: '5',
        title: 'Janela pélvica',
        description: 'Avalie fundo de saco de Douglas (mulheres) e espaço retrovesical (homens).',
      },
      {
        id: '6',
        title: 'Janela pericárdica',
        description: 'Avalie presença de líquido pericárdico (subxifoideo).',
      },
      {
        id: '7',
        title: 'Interpretação',
        description: 'Identifique presença de líquido livre anecoico.',
        tips: ['Líquido parece preto (aneóico)'],
      },
      {
        id: '8',
        title: 'Laudo',
        description: 'Docente achados: positivo/negativo para cada janela.',
      },
    ],
    complications: [
      'Artefatos',
      'Interpretação difícil em obesos',
    ],
  },
  {
    id: 'lumbar',
    title: 'Punção Lombar',
    category: 'Diagnóstico',
    icon: <Syringe className="h-5 w-5" />,
    difficulty: 'Avançado',
    duration: '20-30 min',
    materials: [
      'Kit de punção lombar',
      'Luvas estéreis',
      'Gorro e máscara',
      'Campo estéril',
      'Anestésico local',
      'Agulha de PL',
    ],
    steps: [
      {
        id: '1',
        title: 'Indicação',
        description: 'Suspeita de meningite, hemorragia subaracnóidea, esclerose múltipla.',
        warnings: ['TC antes se sinais de aumento de PIC'],
      },
      {
        id: '2',
        title: 'Posicionamento',
        description: 'Paciente em decúbito lateral ou sentado, coluna em flexão máxima.',
      },
      {
        id: '3',
        title: 'Identificação',
        description: 'Identifique espaço entre L3-L4 ou L4-L5 (linha que passa crista ilíaca).',
      },
      {
        id: '4',
        title: 'Anestesia',
        description: 'Anestesie o local com lidocaína.',
      },
      {
        id: '5',
        title: 'Punção',
        description: 'Insira a agulha com bisel параллельно ao eixo da coluna, direcionada para ombro homolateral.',
        tips: ['Use técnica de estilete'],
      },
      {
        id: '6',
        title: 'Coleta',
        description: 'Colete líquor em tubos estéreis.',
      },
      {
        id: '7',
        title: 'Remoção',
        description: 'Retire a agulha e comprima o local.',
      },
      {
        id: '8',
        title: 'Pós-procedimento',
        description: 'Paciente deve permanecer em repouso por 1-2 horas.',
        tips: ['Hidratação para evitar cefaleia'],
      },
      {
        id: '9',
        title: 'Envio',
        description: 'Envíe líquor para análise (celularidade, bioquímica, cultura, PCR).',
      },
      {
        id: '10',
        title: 'Complicações',
        description: 'Cefaleia pós-punção, sangramento, infecção.',
      },
    ],
    complications: [
      'Cefaleia pós-punção',
      'Sangramento',
      'Infecção',
      'Lesão medular (rara)',
    ],
  },
  {
    id: 'paracentesis',
    title: 'Paracentese Abdominal',
    category: 'Diagnóstico',
    icon: <Syringe className="h-5 w-5" />,
    difficulty: 'Intermediário',
    duration: '15-20 min',
    materials: [
      'Kit de paracentese',
      'Luvas estéreis',
      'Anestésico local',
      'Cateter',
      'Tubos de coleta',
      'Soro fisiológico',
    ],
    steps: [
      {
        id: '1',
        title: 'Indicação',
        description: 'Derrame pleural significativo, suspeita de ascite infectada.',
      },
      {
        id: '2',
        title: 'Ultrassom',
        description: 'Localize o ponto ideal de punção com ultrassom.',
        tips: ['Evite alças intestinais'],
      },
      {
        id: '3',
        title: 'Anestesia',
        description: 'Anestesie pele, subcutâneo e peritônio.',
      },
      {
        id: '4',
        title: 'Punção',
        description: 'Insira cateter em Z para evitar vazamento posterior.',
      },
      {
        id: '5',
        title: 'Drenagem',
        description: 'Drene o líquido lentamente (evitar descompressão rápida).',
        warnings: ['Não drenar mais de 1L em ascites tense'],
      },
      {
        id: '6',
        title: 'Coleta',
        description: 'Colete amostras para análise (celularidade, albumina, cultura, citologia).',
      },
      {
        id: '7',
        title: 'Remoção',
        description: 'Retire o cateter e comprima o local.',
      },
      {
        id: '8',
        title: 'Exames',
        description: 'Solicite análise do líquido: citologia, bioquímica, microbiology.',
      },
      {
        id: '9',
        title: 'Complicações',
        description: 'Sangramento, infecção, perfuração intestinal, vazamento.',
      },
    ],
    complications: [
      'Sangramento',
      'Infecção',
      'Perfuração intestinal',
      'Vazamento de líquido',
    ],
  },
];

export default function Procedimentos() {
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isTraining, setIsTraining] = useState(false);

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const resetTraining = () => {
    setCompletedSteps(new Set());
  };

  const startTraining = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setCompletedSteps(new Set());
    setIsTraining(true);
  };

  const categories = [...new Set(PROCEDURES.map((p) => p.category))];

  if (!selectedProcedure) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Procedimentos Médicos</h1>
            <p className="text-muted-foreground mt-1">Guias passo a passo com checklist</p>
          </div>

          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="mb-4">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
              ))}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat} value={cat}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PROCEDURES.filter((p) => p.category === cat).map((procedure) => (
                    <motion.div
                      key={procedure.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer hover:border-primary transition-colors h-full"
                        onClick={() => startTraining(procedure)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              {procedure.icon}
                            </div>
                            <Badge variant={
                              procedure.difficulty === 'Básico' ? 'default' :
                              procedure.difficulty === 'Intermediário' ? 'secondary' : 'destructive'
                            }>
                              {procedure.difficulty}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg mt-3">{procedure.title}</CardTitle>
                          <CardDescription>{procedure.duration}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4" />
                            <span>{procedure.steps.length} etapas</span>
                          </div>
                          <Button className="w-full mt-4" variant="outline">
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar Treinamento
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </AppLayout>
    );
  }

  const progress = (completedSteps.size / selectedProcedure.steps.length) * 100;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              {selectedProcedure.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{selectedProcedure.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={
                  selectedProcedure.difficulty === 'Básico' ? 'default' :
                  selectedProcedure.difficulty === 'Intermediário' ? 'secondary' : 'destructive'
                }>
                  {selectedProcedure.difficulty}
                </Badge>
                <span className="text-sm text-muted-foreground">{selectedProcedure.duration}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetTraining}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
            <Button variant="ghost" onClick={() => setSelectedProcedure(null)}>
              Voltar
            </Button>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso</span>
              <span className="text-sm text-muted-foreground">
                {completedSteps.size} / {selectedProcedure.steps.length} etapas
              </span>
            </div>
            <Progress value={progress} />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Steps */}
          <div className="lg:col-span-2 space-y-4">
            {selectedProcedure.steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={completedSteps.has(step.id) ? 'border-green-500/50 bg-green-500/5' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={completedSteps.has(step.id)}
                          onCheckedChange={() => toggleStep(step.id)}
                        />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          completedSteps.has(step.id) ? 'bg-green-500 text-white' : 'bg-muted'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${completedSteps.has(step.id) ? 'line-through text-muted-foreground' : ''}`}>
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                          {step.description}
                        </p>
                        
                        {step.tips && step.tips.length > 0 && (
                          <div className="mt-3 p-2 bg-primary/10 rounded-lg">
                            <div className="text-xs font-medium text-primary mb-1">💡 Dicas:</div>
                            <ul className="text-xs space-y-1">
                              {step.tips.map((tip, i) => (
                                <li key={i}>• {tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {step.warnings && step.warnings.length > 0 && (
                          <div className="mt-3 p-2 bg-destructive/10 rounded-lg">
                            <div className="text-xs font-medium text-destructive flex items-center gap-1 mb-1">
                              <AlertTriangle className="h-3 w-3" />
                              Atenção:
                            </div>
                            <ul className="text-xs text-destructive space-y-1">
                              {step.warnings.map((warning, i) => (
                                <li key={i}>• {warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Materials */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base">Materiais Necessários</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedProcedure.materials.map((material, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {material}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Complications */}
            <Card className="border-destructive/50">
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Complicações Possíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedProcedure.complications.map((comp, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-destructive/80">
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                      {comp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Completion */}
            <AnimatePresence>
              {progress === 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="bg-green-500/10 border-green-500">
                    <CardContent className="py-6 text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <h3 className="font-bold text-green-700 dark:text-green-400">
                        Procedimento Completo!
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Você completou todas as etapas.
                      </p>
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
