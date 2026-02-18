import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Play,
  ChevronLeft,
  Check,
  X,
  AlertCircle,
  User,
  FileText,
  Pill,
  Trophy
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ClinicalCase {
  id: string;
  title: string;
  patientInfo: {
    age: number;
    gender: string;
    mainComplaint: string;
  };
  symptoms: string[];
  history: string;
  correctDiagnosis: string;
  correctExams: string[];
  correctTreatment: string;
  specialty: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Sample clinical cases
const SAMPLE_CASES: ClinicalCase[] = [
  {
    id: '1',
    title: 'Dor Torácica Aguda',
    patientInfo: { age: 55, gender: 'Masculino', mainComplaint: 'Dor no peito há 2 horas' },
    symptoms: ['Dor torácica em aperto', 'Irradiação para braço esquerdo', 'Sudorese', 'Náuseas'],
    history: 'Paciente hipertenso, diabético, tabagista há 30 anos. Refere dor torácica intensa iniciada há 2 horas, com irradiação para membro superior esquerdo, acompanhada de sudorese e náuseas.',
    correctDiagnosis: 'Infarto Agudo do Miocárdio',
    correctExams: ['ECG', 'Troponina', 'CKMB'],
    correctTreatment: 'AAS + Clopidogrel + Anticoagulação + Angioplastia primária',
    specialty: 'Cardiologia',
    difficulty: 'medium'
  },
  {
    id: '2',
    title: 'Cefaleia Intensa',
    patientInfo: { age: 35, gender: 'Feminino', mainComplaint: 'Pior dor de cabeça da vida' },
    symptoms: ['Cefaleia súbita e intensa', 'Rigidez de nuca', 'Fotofobia', 'Vômitos'],
    history: 'Paciente previamente hígida, refere início súbito de cefaleia intensa, descrita como "a pior dor de cabeça da vida", acompanhada de rigidez de nuca, fotofobia e vômitos.',
    correctDiagnosis: 'Hemorragia Subaracnóidea',
    correctExams: ['TC de Crânio sem contraste', 'Punção Lombar'],
    correctTreatment: 'Internação em UTI + Nimodipina + Avaliação neurocirúrgica',
    specialty: 'Neurologia',
    difficulty: 'hard'
  },
  {
    id: '3',
    title: 'Dispneia Progressiva',
    patientInfo: { age: 68, gender: 'Masculino', mainComplaint: 'Falta de ar há 1 semana' },
    symptoms: ['Dispneia aos esforços', 'Ortopneia', 'Edema de MMII', 'Tosse noturna'],
    history: 'Paciente com antecedente de IAM há 5 anos, refere dispneia progressiva há 1 semana, pior ao deitar-se, acompanhada de edema bilateral de membros inferiores e tosse noturna.',
    correctDiagnosis: 'Insuficiência Cardíaca Descompensada',
    correctExams: ['Ecocardiograma', 'BNP', 'Radiografia de tórax'],
    correctTreatment: 'Furosemida + IECA + Betabloqueador + Restrição hídrica',
    specialty: 'Cardiologia',
    difficulty: 'easy'
  }
];

export default function ClinicaVirtual() {
  const { user } = useAuth();
  const [cases] = useState<ClinicalCase[]>(SAMPLE_CASES);
  const [selectedCase, setSelectedCase] = useState<ClinicalCase | null>(null);
  const [gameStep, setGameStep] = useState<'intro' | 'diagnosis' | 'exams' | 'treatment' | 'result'>('intro');
  const [userDiagnosis, setUserDiagnosis] = useState('');
  const [userExams, setUserExams] = useState('');
  const [userTreatment, setUserTreatment] = useState('');
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const startCase = (clinicalCase: ClinicalCase) => {
    setSelectedCase(clinicalCase);
    setGameStep('intro');
    setUserDiagnosis('');
    setUserExams('');
    setUserTreatment('');
    setScore(0);
    setTotalScore(0);
  };

  const endCase = () => {
    setSelectedCase(null);
    setGameStep('intro');
  };

  const evaluateStep = (userAnswer: string, correctAnswers: string | string[], maxPoints: number) => {
    const answers = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
    const userLower = userAnswer.toLowerCase();
    let points = 0;

    answers.forEach(answer => {
      if (userLower.includes(answer.toLowerCase())) {
        points += maxPoints / answers.length;
      }
    });

    return Math.round(points);
  };

  const submitDiagnosis = () => {
    const points = evaluateStep(userDiagnosis, selectedCase!.correctDiagnosis, 40);
    setScore(score + points);
    setTotalScore(40);
    setGameStep('exams');
  };

  const submitExams = () => {
    const points = evaluateStep(userExams, selectedCase!.correctExams, 30);
    setScore(score + points);
    setTotalScore(70);
    setGameStep('treatment');
  };

  const submitTreatment = () => {
    const points = evaluateStep(userTreatment, selectedCase!.correctTreatment, 30);
    const finalScore = score + points;
    setScore(finalScore);
    setTotalScore(100);
    setGameStep('result');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-success text-success-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'hard': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  };

  if (selectedCase) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={endCase}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Badge className={getDifficultyColor(selectedCase.difficulty)}>
              {getDifficultyLabel(selectedCase.difficulty)}
            </Badge>
          </div>

          <Progress value={(totalScore)} className="mb-6" />

          {gameStep === 'intro' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informações do Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Idade</p>
                      <p className="font-semibold">{selectedCase.patientInfo.age} anos</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Sexo</p>
                      <p className="font-semibold">{selectedCase.patientInfo.gender}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Especialidade</p>
                      <p className="font-semibold">{selectedCase.specialty}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Queixa Principal:</p>
                    <p className="text-muted-foreground">{selectedCase.patientInfo.mainComplaint}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">História:</p>
                    <p className="text-muted-foreground">{selectedCase.history}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Sintomas:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCase.symptoms.map((symptom, i) => (
                        <Badge key={i} variant="outline">{symptom}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button onClick={() => setGameStep('diagnosis')} className="w-full" size="lg">
                Iniciar Diagnóstico
              </Button>
            </motion.div>
          )}

          {gameStep === 'diagnosis' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Qual é o diagnóstico?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Com base nas informações do paciente, qual é a sua hipótese diagnóstica principal?
                  </p>
                  <Textarea 
                    placeholder="Digite seu diagnóstico..."
                    value={userDiagnosis}
                    onChange={(e) => setUserDiagnosis(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={submitDiagnosis} className="w-full">
                    Confirmar Diagnóstico
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {gameStep === 'exams' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Quais exames solicitar?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Diagnóstico correto:</p>
                    <p className="font-semibold">{selectedCase.correctDiagnosis}</p>
                  </div>
                  <p className="text-muted-foreground">
                    Quais exames você solicitaria para confirmar o diagnóstico?
                  </p>
                  <Textarea 
                    placeholder="Liste os exames..."
                    value={userExams}
                    onChange={(e) => setUserExams(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={submitExams} className="w-full">
                    Confirmar Exames
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {gameStep === 'treatment' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    Qual o tratamento?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Exames corretos:</p>
                    <p className="font-semibold">{selectedCase.correctExams.join(', ')}</p>
                  </div>
                  <p className="text-muted-foreground">
                    Qual seria a conduta terapêutica para este paciente?
                  </p>
                  <Textarea 
                    placeholder="Descreva o tratamento..."
                    value={userTreatment}
                    onChange={(e) => setUserTreatment(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={submitTreatment} className="w-full">
                    Confirmar Tratamento
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {gameStep === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <Card className="text-center py-8">
                <CardContent>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold font-display mb-2">Caso Concluído!</h2>
                  <p className="text-4xl font-bold text-primary mb-2">{score} / 100</p>
                  <p className="text-muted-foreground mb-6">pontos</p>

                  <div className="text-left space-y-4 max-w-md mx-auto">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Diagnóstico correto:</p>
                      <p className="font-semibold">{selectedCase.correctDiagnosis}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Exames corretos:</p>
                      <p className="font-semibold">{selectedCase.correctExams.join(', ')}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Tratamento correto:</p>
                      <p className="font-semibold">{selectedCase.correctTreatment}</p>
                    </div>
                  </div>

                  <Button onClick={endCase} className="mt-6">Voltar aos Casos</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Clínica Virtual</h1>
          <p className="text-muted-foreground">Pratique diagnóstico e conduta com casos clínicos simulados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((clinicalCase, i) => (
            <motion.div
              key={clinicalCase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all cursor-pointer h-full" onClick={() => startCase(clinicalCase)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-primary" />
                    </div>
                    <Badge className={getDifficultyColor(clinicalCase.difficulty)}>
                      {getDifficultyLabel(clinicalCase.difficulty)}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{clinicalCase.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {clinicalCase.patientInfo.gender}, {clinicalCase.patientInfo.age} anos
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {clinicalCase.patientInfo.mainComplaint}
                  </p>
                  <div className="mt-4 pt-4 border-t">
                    <Badge variant="outline">{clinicalCase.specialty}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
