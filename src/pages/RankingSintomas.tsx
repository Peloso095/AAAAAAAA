import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, Stethoscope, AlertTriangle, TrendingUp, 
  ChevronRight, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Diagnosis {
  id: string;
  name: string;
  probability: 'Alta' | 'Moderada' | 'Baixa';
  specialty: string;
  keyFindings: string[];
  redFlags: string[];
  nextSteps: string[];
}

interface SymptomEntry {
  symptom: string;
  keywords: string[];
  diagnoses: Diagnosis[];
}

const SYMPTOM_DATABASE: SymptomEntry[] = [
  {
    symptom: 'Dor torácica',
    keywords: ['dor no peito', 'dor torax', 'aperto no peito', 'peito dói', 'dor coração'],
    diagnoses: [
      {
        id: 'iam',
        name: 'Síndrome Coronariana Aguda',
        probability: 'Alta',
        specialty: 'Cardiologia',
        keyFindings: ['Dor opressiva', 'Irradiação para MSE/mandíbula', 'Sudorese', 'Dispneia'],
        redFlags: ['Supra ST no ECG', 'Hipotensão', 'Alteração de consciência'],
        nextSteps: ['ECG em 10 min', 'Troponina', 'AAS 300mg', 'Acesso venoso'],
      },
      {
        id: 'tep',
        name: 'Tromboembolismo Pulmonar',
        probability: 'Moderada',
        specialty: 'Pneumologia',
        keyFindings: ['Dor pleurítica', 'Dispneia súbita', 'Taquicardia', 'Hemoptise'],
        redFlags: ['Instabilidade hemodinâmica', 'Hipoxemia grave'],
        nextSteps: ['D-dímero', 'Angio-TC', 'Anticoagulação'],
      },
      {
        id: 'pneumonia',
        name: 'Pneumonia',
        probability: 'Moderada',
        specialty: 'Pneumologia',
        keyFindings: ['Febre', 'Tosse produtiva', 'Crepitações'],
        redFlags: ['SpO2 < 90%', 'Confusão mental', 'PAM < 65'],
        nextSteps: ['Radiografia de tórax', 'Hemograma', 'PCR'],
      },
      {
        id: 'pericardite',
        name: 'Pericardite',
        probability: 'Baixa',
        specialty: 'Cardiologia',
        keyFindings: ['Piora com decúbito', 'Melhora sentado', 'Atrito pericárdico'],
        redFlags: ['Tamponamento cardíaco'],
        nextSteps: ['ECG', 'Ecocardiograma', 'Marcadores inflamatórios'],
      },
    ],
  },
  {
    symptom: 'Cefaleia',
    keywords: ['dor de cabeça', 'dor cabeça', 'enxaqueca', 'cabeça dói', 'cefaléia'],
    diagnoses: [
      {
        id: 'enxaqueca',
        name: 'Enxaqueca',
        probability: 'Alta',
        specialty: 'Neurologia',
        keyFindings: ['Unilateral', 'Pulsátil', 'Náuseas/vômitos', 'Fotofobia'],
        redFlags: ['Início súbito', 'Pior cefaleia da vida'],
        nextSteps: ['Analgesia', 'Triptanos se indicado', 'Profilaxia se frequente'],
      },
      {
        id: 'hsa',
        name: 'Hemorragia Subaracnóidea',
        probability: 'Baixa',
        specialty: 'Neurologia/Neurocirurgia',
        keyFindings: ['Início súbito', 'Intensidade máxima', 'Rigidez de nuca', 'Síncope'],
        redFlags: ['Pior cefaleia da vida', 'Alteração de consciência', 'Déficit focal'],
        nextSteps: ['TC de crânio urgente', 'Punção lombar se TC normal', 'Angio-TC/RM'],
      },
      {
        id: 'meningite',
        name: 'Meningite',
        probability: 'Moderada',
        specialty: 'Infectologia/Neurologia',
        keyFindings: ['Febre', 'Rigidez de nuca', 'Fotofobia', 'Alteração de consciência'],
        redFlags: ['Petéquias', 'Choque séptico', 'Coma'],
        nextSteps: ['Punção lombar', 'Hemocultura', 'ATB empírico urgente'],
      },
    ],
  },
  {
    symptom: 'Dispneia',
    keywords: ['falta de ar', 'dificuldade respirar', 'cansaço respirar', 'ofegante', 'sufocando'],
    diagnoses: [
      {
        id: 'ic',
        name: 'Insuficiência Cardíaca',
        probability: 'Alta',
        specialty: 'Cardiologia',
        keyFindings: ['Ortopneia', 'DPN', 'Edema de MMII', 'Estertores'],
        redFlags: ['EAP', 'Choque cardiogênico'],
        nextSteps: ['BNP/NT-proBNP', 'Ecocardiograma', 'Diuréticos'],
      },
      {
        id: 'dpoc',
        name: 'DPOC Exacerbado',
        probability: 'Moderada',
        specialty: 'Pneumologia',
        keyFindings: ['Tabagismo', 'Sibilos', 'Uso de musculatura acessória', 'Tosse'],
        redFlags: ['Alteração de consciência', 'Cianose', 'Acidose respiratória'],
        nextSteps: ['Gasometria', 'Broncodilatadores', 'Corticoide sistêmico'],
      },
      {
        id: 'asma',
        name: 'Crise Asmática',
        probability: 'Moderada',
        specialty: 'Pneumologia',
        keyFindings: ['Sibilos', 'Aperto no peito', 'Tosse', 'Gatilho identificável'],
        redFlags: ['Tórax silencioso', 'Cianose', 'Bradicardia'],
        nextSteps: ['Peak flow', 'Beta-2 inalatório', 'Corticoide'],
      },
    ],
  },
  {
    symptom: 'Dor abdominal',
    keywords: ['dor barriga', 'dor abdome', 'cólica', 'barriga dói', 'dor estômago'],
    diagnoses: [
      {
        id: 'apendicite',
        name: 'Apendicite Aguda',
        probability: 'Alta',
        specialty: 'Cirurgia',
        keyFindings: ['Dor em FID', 'Blumberg positivo', 'Febre', 'Anorexia'],
        redFlags: ['Peritonite difusa', 'Sepse'],
        nextSteps: ['Hemograma', 'TC abdome', 'Avaliação cirúrgica'],
      },
      {
        id: 'colecistite',
        name: 'Colecistite Aguda',
        probability: 'Moderada',
        specialty: 'Cirurgia',
        keyFindings: ['Dor em HCD', 'Murphy positivo', 'Febre', 'Intolerância a gordura'],
        redFlags: ['Icterícia', 'Sepse'],
        nextSteps: ['USG abdome', 'Enzimas hepáticas', 'Amilase/Lipase'],
      },
      {
        id: 'pancreatite',
        name: 'Pancreatite Aguda',
        probability: 'Moderada',
        specialty: 'Gastroenterologia',
        keyFindings: ['Dor epigástrica em faixa', 'Irradiação para dorso', 'Náuseas/vômitos'],
        redFlags: ['Ranson ≥ 3', 'SIRS', 'Necrose pancreática'],
        nextSteps: ['Amilase/Lipase', 'TC abdome', 'Suporte clínico'],
      },
    ],
  },
];

export default function RankingSintomas() {
  const [search, setSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<SymptomEntry | null>(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);

  const searchResults = search.length > 2
    ? SYMPTOM_DATABASE.filter((entry) =>
        entry.symptom.toLowerCase().includes(search.toLowerCase()) ||
        entry.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  const handleSearch = () => {
    if (searchResults.length > 0) {
      setSelectedEntry(searchResults[0]);
      setSelectedDiagnosis(null);
    }
  };

  const getProbabilityColor = (prob: string) => {
    switch (prob) {
      case 'Alta': return 'bg-red-500';
      case 'Moderada': return 'bg-yellow-500';
      case 'Baixa': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ranking de Sintomas</h1>
          <p className="text-muted-foreground mt-1">Digite um sintoma e veja os diagnósticos mais prováveis</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="py-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ex: dor no peito, falta de ar, dor de cabeça..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>
                <Stethoscope className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>

            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2 mt-3">
              {SYMPTOM_DATABASE.map((entry) => (
                <Button
                  key={entry.symptom}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEntry(entry);
                    setSelectedDiagnosis(null);
                    setSearch(entry.symptom);
                  }}
                >
                  {entry.symptom}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedEntry && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Diagnosis List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Diagnósticos para "{selectedEntry.symptom}"
                  </CardTitle>
                  <CardDescription>Ordenados por probabilidade</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedEntry.diagnoses.map((diagnosis, index) => (
                    <motion.button
                      key={diagnosis.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedDiagnosis(diagnosis)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedDiagnosis?.id === diagnosis.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{diagnosis.name}</div>
                          <div className={`text-xs ${selectedDiagnosis?.id === diagnosis.id ? 'opacity-80' : 'text-muted-foreground'}`}>
                            {diagnosis.specialty}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getProbabilityColor(diagnosis.probability)}`} />
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Diagnosis Details */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {selectedDiagnosis ? (
                  <motion.div
                    key={selectedDiagnosis.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{selectedDiagnosis.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{selectedDiagnosis.specialty}</Badge>
                              <Badge className={getProbabilityColor(selectedDiagnosis.probability)}>
                                {selectedDiagnosis.probability} probabilidade
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Key Findings */}
                        <div>
                          <h3 className="font-semibold flex items-center gap-2 mb-3">
                            <Activity className="h-4 w-4 text-primary" />
                            Achados-Chave
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedDiagnosis.keyFindings.map((finding, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                {finding}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Red Flags */}
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <h3 className="font-semibold flex items-center gap-2 mb-3 text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            Sinais de Alarme (Red Flags)
                          </h3>
                          <div className="space-y-2">
                            {selectedDiagnosis.redFlags.map((flag, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-destructive">
                                <AlertTriangle className="h-3 w-3" />
                                {flag}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Next Steps */}
                        <div>
                          <h3 className="font-semibold flex items-center gap-2 mb-3">
                            <ChevronRight className="h-4 w-4 text-primary" />
                            Próximos Passos
                          </h3>
                          <ol className="space-y-2">
                            {selectedDiagnosis.nextSteps.map((step, i) => (
                              <li key={i} className="flex items-center gap-3 text-sm">
                                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                  {i + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-[400px] flex items-center justify-center"
                  >
                    <Card className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Selecione um diagnóstico para ver os detalhes</p>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {!selectedEntry && (
          <Card className="h-[300px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Digite um sintoma para começar</p>
              <p className="text-sm mt-1">Ou clique em uma das sugestões acima</p>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
