import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator, Heart, Baby, Brain, Pill, Scale, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Calculadoras() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calculadoras Médicas</h1>
          <p className="text-muted-foreground mt-1">Ferramentas essenciais para cálculos clínicos</p>
        </div>

        <Tabs defaultValue="chads" className="w-full">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-2">
            <TabsTrigger value="chads" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">CHA₂DS₂-VASc</span>
              <span className="sm:hidden">CHADS</span>
            </TabsTrigger>
            <TabsTrigger value="imc" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              IMC
            </TabsTrigger>
            <TabsTrigger value="apgar" className="flex items-center gap-2">
              <Baby className="h-4 w-4" />
              Apgar
            </TabsTrigger>
            <TabsTrigger value="glasgow" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Glasgow
            </TabsTrigger>
            <TabsTrigger value="dose" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Dose
            </TabsTrigger>
            <TabsTrigger value="clearance" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              ClCr
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chads">
            <CHADSCalculator />
          </TabsContent>
          <TabsContent value="imc">
            <IMCCalculator />
          </TabsContent>
          <TabsContent value="apgar">
            <ApgarCalculator />
          </TabsContent>
          <TabsContent value="glasgow">
            <GlasgowCalculator />
          </TabsContent>
          <TabsContent value="dose">
            <DoseCalculator />
          </TabsContent>
          <TabsContent value="clearance">
            <ClearanceCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function CHADSCalculator() {
  const [scores, setScores] = useState({
    chf: false,
    hypertension: false,
    age75: false,
    diabetes: false,
    stroke: false,
    vascular: false,
    age65: false,
    female: false,
  });

  const total = 
    (scores.chf ? 1 : 0) +
    (scores.hypertension ? 1 : 0) +
    (scores.age75 ? 2 : 0) +
    (scores.diabetes ? 1 : 0) +
    (scores.stroke ? 2 : 0) +
    (scores.vascular ? 1 : 0) +
    (scores.age65 ? 1 : 0) +
    (scores.female ? 1 : 0);

  const getRisk = () => {
    if (total === 0) return { risk: '0.2%', recommendation: 'Baixo risco - Considerar sem anticoagulação', color: 'bg-green-500' };
    if (total === 1) return { risk: '0.6%', recommendation: 'Baixo-moderado - Avaliar anticoagulação', color: 'bg-yellow-500' };
    if (total === 2) return { risk: '2.2%', recommendation: 'Moderado - Anticoagulação recomendada', color: 'bg-orange-500' };
    return { risk: `${(total * 2).toFixed(1)}%+`, recommendation: 'Alto risco - Anticoagulação indicada', color: 'bg-red-500' };
  };

  const risk = getRisk();

  const criteria = [
    { key: 'chf', label: 'C - Insuficiência Cardíaca Congestiva', points: 1 },
    { key: 'hypertension', label: 'H - Hipertensão', points: 1 },
    { key: 'age75', label: 'A₂ - Idade ≥ 75 anos', points: 2 },
    { key: 'diabetes', label: 'D - Diabetes Mellitus', points: 1 },
    { key: 'stroke', label: 'S₂ - AVC/AIT/Tromboembolismo prévio', points: 2 },
    { key: 'vascular', label: 'V - Doença Vascular', points: 1 },
    { key: 'age65', label: 'A - Idade 65-74 anos', points: 1 },
    { key: 'female', label: 'Sc - Sexo feminino', points: 1 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            CHA₂DS₂-VASc Score
          </CardTitle>
          <CardDescription>Avaliação de risco de AVC em Fibrilação Atrial</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {criteria.map((item) => (
              <label
                key={item.key}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  scores[item.key as keyof typeof scores] ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={scores[item.key as keyof typeof scores]}
                    onChange={(e) => setScores({ ...scores, [item.key]: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span>{item.label}</span>
                </div>
                <Badge variant="outline">+{item.points}</Badge>
              </label>
            ))}
          </div>

          <div className={`p-4 rounded-lg ${risk.color} text-white`}>
            <div className="text-center">
              <div className="text-4xl font-bold">{total}</div>
              <div className="text-sm opacity-90">Pontuação Total</div>
              <div className="mt-2 text-lg font-medium">Risco anual de AVC: {risk.risk}</div>
              <div className="text-sm opacity-90">{risk.recommendation}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function IMCCalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const calculateIMC = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w > 0 && h > 0) {
      return w / (h * h);
    }
    return null;
  };

  const imc = calculateIMC();

  const getClassification = (imc: number) => {
    if (imc < 18.5) return { label: 'Abaixo do peso', color: 'bg-blue-500' };
    if (imc < 25) return { label: 'Peso normal', color: 'bg-green-500' };
    if (imc < 30) return { label: 'Sobrepeso', color: 'bg-yellow-500' };
    if (imc < 35) return { label: 'Obesidade Grau I', color: 'bg-orange-500' };
    if (imc < 40) return { label: 'Obesidade Grau II', color: 'bg-red-500' };
    return { label: 'Obesidade Grau III', color: 'bg-red-700' };
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Índice de Massa Corporal (IMC)
          </CardTitle>
          <CardDescription>Calculadora de IMC com classificação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="170"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </div>

          {imc && (
            <div className={`p-4 rounded-lg ${getClassification(imc).color} text-white text-center`}>
              <div className="text-4xl font-bold">{imc.toFixed(1)}</div>
              <div className="text-lg">{getClassification(imc).label}</div>
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• &lt; 18.5: Abaixo do peso</p>
            <p>• 18.5 - 24.9: Peso normal</p>
            <p>• 25 - 29.9: Sobrepeso</p>
            <p>• 30 - 34.9: Obesidade Grau I</p>
            <p>• 35 - 39.9: Obesidade Grau II</p>
            <p>• ≥ 40: Obesidade Grau III</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ApgarCalculator() {
  const [scores, setScores] = useState({
    appearance: 0,
    pulse: 0,
    grimace: 0,
    activity: 0,
    respiration: 0,
  });

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  const criteria = [
    {
      key: 'appearance',
      label: 'Aparência (Cor)',
      options: [
        { value: 0, label: 'Cianose central ou palidez' },
        { value: 1, label: 'Cianose de extremidades' },
        { value: 2, label: 'Rosado' },
      ],
    },
    {
      key: 'pulse',
      label: 'Pulso (FC)',
      options: [
        { value: 0, label: 'Ausente' },
        { value: 1, label: '< 100 bpm' },
        { value: 2, label: '≥ 100 bpm' },
      ],
    },
    {
      key: 'grimace',
      label: 'Irritabilidade Reflexa',
      options: [
        { value: 0, label: 'Sem resposta' },
        { value: 1, label: 'Careta' },
        { value: 2, label: 'Choro vigoroso' },
      ],
    },
    {
      key: 'activity',
      label: 'Atividade (Tônus)',
      options: [
        { value: 0, label: 'Flácido' },
        { value: 1, label: 'Alguma flexão' },
        { value: 2, label: 'Movimento ativo' },
      ],
    },
    {
      key: 'respiration',
      label: 'Respiração',
      options: [
        { value: 0, label: 'Ausente' },
        { value: 1, label: 'Lenta, irregular' },
        { value: 2, label: 'Choro forte' },
      ],
    },
  ];

  const getInterpretation = () => {
    if (total >= 7) return { label: 'Normal', color: 'bg-green-500' };
    if (total >= 4) return { label: 'Depressão moderada', color: 'bg-yellow-500' };
    return { label: 'Depressão grave', color: 'bg-red-500' };
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-primary" />
            Escore de Apgar
          </CardTitle>
          <CardDescription>Avaliação do recém-nascido ao 1º e 5º minuto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {criteria.map((item) => (
            <div key={item.key} className="space-y-2">
              <Label>{item.label}</Label>
              <div className="grid grid-cols-3 gap-2">
                {item.options.map((option) => (
                  <Button
                    key={option.value}
                    variant={scores[item.key as keyof typeof scores] === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setScores({ ...scores, [item.key]: option.value })}
                    className="text-xs h-auto py-2"
                  >
                    {option.value}: {option.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          <div className={`p-4 rounded-lg ${getInterpretation().color} text-white text-center`}>
            <div className="text-4xl font-bold">{total}/10</div>
            <div className="text-lg">{getInterpretation().label}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function GlasgowCalculator() {
  const [scores, setScores] = useState({
    eye: 1,
    verbal: 1,
    motor: 1,
  });

  const total = scores.eye + scores.verbal + scores.motor;

  const criteria = [
    {
      key: 'eye',
      label: 'Abertura Ocular',
      options: [
        { value: 4, label: 'Espontânea' },
        { value: 3, label: 'Ao comando verbal' },
        { value: 2, label: 'À dor' },
        { value: 1, label: 'Ausente' },
      ],
    },
    {
      key: 'verbal',
      label: 'Resposta Verbal',
      options: [
        { value: 5, label: 'Orientada' },
        { value: 4, label: 'Confusa' },
        { value: 3, label: 'Palavras inapropriadas' },
        { value: 2, label: 'Sons incompreensíveis' },
        { value: 1, label: 'Ausente' },
      ],
    },
    {
      key: 'motor',
      label: 'Resposta Motora',
      options: [
        { value: 6, label: 'Obedece comandos' },
        { value: 5, label: 'Localiza dor' },
        { value: 4, label: 'Retirada à dor' },
        { value: 3, label: 'Flexão anormal' },
        { value: 2, label: 'Extensão anormal' },
        { value: 1, label: 'Ausente' },
      ],
    },
  ];

  const getInterpretation = () => {
    if (total >= 13) return { label: 'TCE Leve', color: 'bg-green-500' };
    if (total >= 9) return { label: 'TCE Moderado', color: 'bg-yellow-500' };
    return { label: 'TCE Grave', color: 'bg-red-500' };
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Escala de Coma de Glasgow
          </CardTitle>
          <CardDescription>Avaliação do nível de consciência</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {criteria.map((item) => (
            <div key={item.key} className="space-y-2">
              <Label>{item.label}</Label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {item.options.map((option) => (
                  <Button
                    key={option.value}
                    variant={scores[item.key as keyof typeof scores] === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setScores({ ...scores, [item.key]: option.value })}
                    className="text-xs h-auto py-2"
                  >
                    {option.value}: {option.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          <div className={`p-4 rounded-lg ${getInterpretation().color} text-white text-center`}>
            <div className="text-4xl font-bold">{total}/15</div>
            <div className="text-sm">O{scores.eye} V{scores.verbal} M{scores.motor}</div>
            <div className="text-lg mt-1">{getInterpretation().label}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DoseCalculator() {
  const [weight, setWeight] = useState('');
  const [dosePerKg, setDosePerKg] = useState('');
  const [concentration, setConcentration] = useState('');

  const totalDose = parseFloat(weight) * parseFloat(dosePerKg);
  const volume = concentration ? totalDose / parseFloat(concentration) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Calculadora de Dose
          </CardTitle>
          <CardDescription>Cálculo de dose por peso corporal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dose-weight">Peso (kg)</Label>
              <Input
                id="dose-weight"
                type="number"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dose-per-kg">Dose (mg/kg)</Label>
              <Input
                id="dose-per-kg"
                type="number"
                placeholder="10"
                value={dosePerKg}
                onChange={(e) => setDosePerKg(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="concentration">Concentração (mg/mL) - opcional</Label>
              <Input
                id="concentration"
                type="number"
                placeholder="50"
                value={concentration}
                onChange={(e) => setConcentration(e.target.value)}
              />
            </div>
          </div>

          {weight && dosePerKg && (
            <div className="p-4 rounded-lg bg-primary text-primary-foreground text-center">
              <div className="text-3xl font-bold">{totalDose.toFixed(1)} mg</div>
              <div className="text-sm opacity-90">Dose total</div>
              {volume && (
                <div className="mt-2">
                  <div className="text-2xl font-bold">{volume.toFixed(2)} mL</div>
                  <div className="text-sm opacity-90">Volume a administrar</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ClearanceCalculator() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [creatinine, setCreatinine] = useState('');
  const [isFemale, setIsFemale] = useState(false);

  const calculateClearance = () => {
    const a = parseFloat(age);
    const w = parseFloat(weight);
    const cr = parseFloat(creatinine);
    if (a > 0 && w > 0 && cr > 0) {
      let clcr = ((140 - a) * w) / (72 * cr);
      if (isFemale) clcr *= 0.85;
      return clcr;
    }
    return null;
  };

  const clcr = calculateClearance();

  const getInterpretation = (value: number) => {
    if (value >= 90) return { label: 'Normal', color: 'bg-green-500' };
    if (value >= 60) return { label: 'DRC Estágio 2', color: 'bg-yellow-500' };
    if (value >= 30) return { label: 'DRC Estágio 3', color: 'bg-orange-500' };
    if (value >= 15) return { label: 'DRC Estágio 4', color: 'bg-red-500' };
    return { label: 'DRC Estágio 5 (Dialítica)', color: 'bg-red-700' };
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Clearance de Creatinina (Cockcroft-Gault)
          </CardTitle>
          <CardDescription>Estimativa da taxa de filtração glomerular</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clcr-age">Idade (anos)</Label>
              <Input
                id="clcr-age"
                type="number"
                placeholder="50"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="clcr-weight">Peso (kg)</Label>
              <Input
                id="clcr-weight"
                type="number"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="clcr-cr">Creatinina sérica (mg/dL)</Label>
              <Input
                id="clcr-cr"
                type="number"
                step="0.1"
                placeholder="1.0"
                value={creatinine}
                onChange={(e) => setCreatinine(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="female"
                checked={isFemale}
                onChange={(e) => setIsFemale(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="female">Sexo feminino (×0.85)</Label>
            </div>
          </div>

          {clcr && (
            <div className={`p-4 rounded-lg ${getInterpretation(clcr).color} text-white text-center`}>
              <div className="text-4xl font-bold">{clcr.toFixed(1)}</div>
              <div className="text-sm opacity-90">mL/min</div>
              <div className="text-lg mt-1">{getInterpretation(clcr).label}</div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>Fórmula: ClCr = [(140 - idade) × peso] / (72 × Cr) {isFemale ? '× 0.85' : ''}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
