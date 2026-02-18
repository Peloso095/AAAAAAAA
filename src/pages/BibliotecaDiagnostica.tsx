import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, BookOpen, Stethoscope, TestTube, Pill, AlertTriangle,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Disease {
  id: string;
  name: string;
  specialty: string;
  definition: string;
  symptoms: string[];
  differentialDiagnosis: string[];
  exams: string[];
  treatment: string[];
  medications: string[];
  alerts: string[];
}

const DISEASES: Disease[] = [
  // Cardiologia
  {
    id: '1',
    name: 'Infarto Agudo do Miocárdio',
    specialty: 'Cardiologia',
    definition: 'Necrose miocárdica por isquemia prolongada, geralmente por oclusão coronariana aguda.',
    symptoms: ['Dor torácica típica (opressiva, retroesternal)', 'Irradiação para MSE, mandíbula, dorso', 'Dispneia', 'Sudorese fria', 'Náuseas/vômitos'],
    differentialDiagnosis: ['Angina instável', 'Dissecção de aorta', 'Pericardite', 'TEP', 'Espasmo esofágico'],
    exams: ['ECG (supra ST, infra ST, BRE novo)', 'Troponina I/T', 'CKMB', 'Ecocardiograma', 'Coronariografia'],
    treatment: ['MONA (Morfina, O2, Nitrato, AAS)', 'Anticoagulação (HNF/Enoxaparina)', 'Reperfusão (ICP primária ou fibrinolítico)', 'Beta-bloqueador', 'IECA'],
    medications: ['AAS 300mg', 'Clopidogrel 300-600mg', 'Enoxaparina 1mg/kg', 'Atorvastatina 80mg', 'Metoprolol'],
    alerts: ['Tempo porta-balão < 90min', 'Contraindicações a fibrinolítico', 'Killip > II = pior prognóstico'],
  },
  {
    id: '1a',
    name: 'Fibrilação Atrial',
    specialty: 'Cardiologia',
    definition: 'Arritmia cardíaca caracterizada por fibrilação atrial(desorganizada) com resposta ventricular rápida e irregular.',
    symptoms: ['Palpitações', 'Dispneia', 'Fadiga', 'Tontura', 'Dor torácica', 'Pré-síncope'],
    differentialDiagnosis: ['Flutter atrial', 'Taquicardia supraventricular', 'Taquicardia ventricular', 'Fibrilação ventricular'],
    exams: ['ECG (ausência de onda P, complejo irregular)', 'Ecocardiograma', 'Holter 24h', 'Função tireoidiana', 'Eletrólitos'],
    treatment: ['Controle de frequência (beta-bloqueador, digitálico)', 'Controle de ritmo (cardioversão, antiarrítmicos)', 'Anticoagulação (warfarina, DOAC)', 'Ablação por cateter'],
    medications: ['Metoprolol', 'Digoxina', 'Amiodarona', 'Rivaroxabana', 'Dabigatrana'],
    alerts: ['Escala CHA2DS2-VASc para anticoagulação', 'Risco de AVC em FA não anticoagulada', 'Resultado rápido >100 bpm pode comprometer hemodinâmica'],
  },
  {
    id: '1b',
    name: 'Tromboembolismo Pulmonar',
    specialty: 'Cardiologia',
    definition: 'Obstrução da artéria pulmonar ou seus ramos por êmbolos, geralmente originados de veias profundas dos membros inferiores.',
    symptoms: ['Dispneia súbita', 'Dor torácica pleurítica', 'Taquipneia', 'Taquisfigmia', 'Hemoptise', 'Sinais de TVP'],
    differentialDiagnosis: ['IAM', 'Pneumonia', 'Pneumotórax', 'Dissecção de aorta', 'Asma exacerbada'],
    exams: ['D-Dímero', 'Angio-TC de tórax', 'Ecocardiograma', 'Gás sangüíneo arterial', 'Proteína C reativa'],
    treatment: ['Anticoagulação', 'Trombólise (massiva)', 'Embolectomia cirúrgica', 'Filtro de veia cava'],
    medications: ['Enoxaparina 1mg/kg', 'Warfarina', 'Rivaroxabana', 'Alteplase', 'Heparina'],
    alerts: ['Classificação: massive, submassiva, não massiva', 'Hemodinâmica instável = trombólise', 'Tempo é vida: diagnóstico e tratamento precoces'],
  },
  {
    id: '1c',
    name: 'Endocardite Infecciosa',
    specialty: 'Cardiologia',
    definition: 'Infecção do endocárdio, geralmente por bactérias, frequentemente associada a válvulas cardíacas nativo ou prótese.',
    symptoms: ['Febre', 'Sopro cardíaco', 'Embolia periférica', 'Nódulos de Osler', 'Manchas de Roth', 'Splenomegalia'],
    differentialDiagnosis: ['Endocardite não infecciosa', 'Febre reumática', 'Sepse de outra causa', 'Lupus eritematoso sistêmico'],
    exams: ['Hemoculturas (padrão-ouro)', 'Ecocardiograma transesofágico', 'PCR/VHS', 'Leucograma', 'Ureia/Creatinina'],
    treatment: ['Antibioticoterapia IV prolongada', 'Cirurgiavalvular (quando indicado)', 'Suporte hemodinâmico', 'Prevenção de complicações'],
    medications: ['Vancomicina', 'Gentamicina', 'Ceftriaxona', 'Nafcilina', 'Ampicilina+Sulbactam'],
    alerts: ['Critérios de Duke para diagnóstico', 'Indicação cirúrgica: ICC, abscessoperivalvular, microorganismos difíciles de tratar', 'Mortalidade alta se não tratado'],
  },
  // Pneumologia
  {
    id: '2',
    name: 'Pneumonia Adquirida na Comunidade',
    specialty: 'Pneumologia',
    definition: 'Infecção do parênquima pulmonar adquirida fora do ambiente hospitalar.',
    symptoms: ['Tosse produtiva', 'Febre', 'Dispneia', 'Dor pleurítica', 'Crepitações à ausculta'],
    differentialDiagnosis: ['Tuberculose', 'Bronquite aguda', 'Insuficiência cardíaca', 'TEP', 'Câncer de pulmão'],
    exams: ['Radiografia de tórax', 'Hemograma', 'PCR', 'Ureia/Creatinina', 'Gasometria', 'Hemocultura (casos graves)'],
    treatment: ['Antibioticoterapia empírica', 'Suporte ventilatório se necessário', 'Hidratação', 'Controle de febre'],
    medications: ['Amoxicilina + Clavulanato', 'Azitromicina', 'Levofloxacino (alternativa)', 'Ceftriaxona (internação)'],
    alerts: ['CURB-65 para estratificação', 'Pneumonia multilobar = internação', 'Derrame pleural = toracocentese'],
  },
  {
    id: '2a',
    name: 'DPOC Exacerbado',
    specialty: 'Pneumologia',
    definition: 'Piora aguda dos sintomas de DPOC além da variação diária normal, frequentemente por infecção ou poluentes.',
    symptoms: ['Aumento da dispneia', 'Aumento do volume do escarro', 'Mudança da cor do escarro', 'Tosse', 'Sibilância'],
    differentialDiagnosis: ['Pneumonia', 'TEP', 'Pneumotórax', 'Insuficiência cardíaca', 'Arritmia cardíaca'],
    exams: ['Radiografia de tórax', 'Gasometria arterial', 'ECG', 'BNP', 'Hemograma', 'Eletrólitos'],
    treatment: ['Broncodilatadores (beta-agonistas, anticolinérgicos)', 'Corticosteroides sistêmicos', 'Antibioticoterapia (se indicção)', 'Oxigenioterapia', 'Ventilação não invasiva (se necessário)'],
    medications: ['Salbutamol', 'Ipratrópio', 'Prednisona 40mg', 'Amoxicilina+Clavulanato', 'Azitromicina'],
    alerts: [' hipercapnia = evitar sedativos', 'pH <7.25 = considerar VNI', 'Colonização bacteriana frequente'],
  },
  {
    id: '2b',
    name: 'Asma Aguda Grave',
    specialty: 'Pneumologia',
    definition: 'Exacerbação de asma que não responde ao tratamento habitual e requer internação ou representa risco de vida.',
    symptoms: ['Dispneia em repouso', 'Dificuldade em falar', ' Cianose', 'Uso de musculatura acessória', 'Sibilância intensa ou ausente'],
    differentialDiagnosis: ['DPOC exacerbado', 'Anafilaxia', 'Obstrução de via aérea superior', 'Embolia pulmonar', 'Pneumotórax'],
    exams: ['Peak flow (PF < 50% do melhor)', 'Gasometria arterial', 'Radiografia de tórax', 'Eletrólitos'],
    treatment: ['Beta-agonistas de curta ação (高 doses)', 'Anticolinérgicos', 'Corticosteroides sistêmicos', 'Sulfato de magnésio', 'Ventilação mecânica (casos graves)'],
    medications: ['Salbutamol nebulização', 'Ipratrópio nebulização', 'Prednisona oral', 'Metilprednisolona IV', 'Sulfato de magnésio'],
    alerts: ['PF < 150 L/min = ataque grave', 'Silêncio auscultatório = gravidade extrema', 'Hipóxia e hipercapnia = internação UTI'],
  },
  {
    id: '2c',
    name: 'Derrame Pleural',
    specialty: 'Pneumologia',
    definition: 'Acúmulo de líquido no espaço pleural, podendo ser transudato ou exsudato.',
    symptoms: ['Dispneia', 'Dor torácica pleurítica', 'Tosse seca', 'Diminuição do murmúrio vesicular', 'Matidez à percussão'],
    differentialDiagnosis: ['Insuficiência cardíaca', 'Pneumonia', 'Cancêr de pulmão', 'Tuberculose', 'Embolia pulmonar'],
    exams: ['Radiografia de tórax', 'Tomografia de tórax', 'Ultrassonografia pleural', 'Toracocentese (análise do líquido)', 'Biópsia pleural'],
    treatment: ['Tratamento da causa base', 'Toracocentese terapêutica', 'Dreno torácico (se massive)', 'Pleurodese (recorrente)', 'Cirurgia (decorticação)'],
    medications: ['Diuréticos (se transudato)', 'Antibioticoterapia (se parapneumônico)', 'Quimioterapia (se maligno)'],
    alerts: ['Derrame massive = dreno torácico urgente', 'PH < 7.2 = indicação de dreno', 'Lactato desidrogenase elevada = exsudato'],
  },
  // Gastroenterologia
  {
    id: '6',
    name: 'Hepatite B Aguda',
    specialty: 'Gastroenterologia',
    definition: 'Infecção aguda pelo vírus da hepatite B (HBV), transmitida por sangue ou fluidos corporais.',
    symptoms: ['Icterícia', 'Fadiga', 'Náuseas/vômitos', 'Dor abdominal', 'Artralgia', 'Febre'],
    differentialDiagnosis: ['Hepatite A', 'Hepatite C', 'Hepatite tóxica', 'Colestase', 'Cálculo biliar'],
    exams: ['HBsAg', 'Anti-HBc IgM', 'Anti-HBs', 'Transaminases (ALT/AST muito elevadas)', 'Bilirrubinas', 'Tempo de protrombintromboplastina'],
    treatment: ['Repouso', 'Hidratação', 'Dieta hipercalórica', 'Evitar hepatotóxicos', 'Monitoramento de complicações'],
    medications: ['Apenas suporte (não há antiviral específico para forma aguda)', 'Antieméticos', 'Hepatoprotetores (uso controverso)'],
    alerts: ['Transmissão sexual e parenteral', 'Risco de hepatite fulminante (<1%)', 'Cronificação em 5-10% dos adultos'],
  },
  {
    id: '7',
    name: 'Pancreatite Aguda',
    specialty: 'Gastroenterologia',
    definition: 'Inflamação aguda do pâncreas por ativaçãoprematura de enzimas pancreáticas, geralmente por litíase ou etilismo.',
    symptoms: ['Dor abdominal epigástrica intensa (irradiando para dorso)', 'Náuseas/vômitos', 'Febre', 'Taquisfigmia', 'Icterícia (alguns casos)'],
    differentialDiagnosis: ['Úlcera perfurada', 'Isquemia mesentérica', 'Colecistite aguda', 'Aneurisma dissecante da aorta', 'Cetoacidose diabética'],
    exams: ['Amilase e lipase (>3x limite superior)', 'Hemograma', 'LDH', 'Glicemia', 'Creatinina', 'Ultrassonografia abdominal', 'TC de abdome (se indicated)'],
    treatment: ['Jejum oral', 'Hidratação IV vigorosa', 'Controle da dor', 'Suporte nutricional', 'Tratamento da causa'],
    medications: ['Ringer lactato', 'Morfina', 'Ondansetrona', 'Antibioticoterapia (apenas se necrose infectada)'],
    alerts: ['Critérios de Ranson e APACHE II para prognóstico', 'Necrose pancreática infectada = cirúrgia', 'SIRS persistente = mau prognóstico'],
  },
  {
    id: '8',
    name: 'Hemorragia Digestiva Alta',
    specialty: 'Gastroenterologia',
    definition: 'Sangramento originating do trato gastrointestinal proximal ao ligamento de Treitz,放了 sangramento gastrointestinal proximal ao ligamento de Treitz.',
    symptoms: ['Hematêmese', 'Melena', 'Hematoquezia (ocasionalmente)', 'Hipotensão', 'Taquisfigmia', 'Palidez'],
    differentialDiagnosis: ['Úlcera péptica', 'Varizes esofágicas', 'Síndrome de Mallory-Weiss', 'Cancêr gástrico', 'Angiodisplasia'],
    exams: ['Endoscopia digestiva alta (gold standard)', 'Hemoglobina/hematócrito', 'Ureia (aumentada por digestão de sangue)', 'Tipo sanguineo e fatorRh', 'ECG'],
    treatment: ['Ressuscitação hemodinâmica', 'Transfusão (se Hb <7g/dL)', 'Jejum', 'Inibidor de bomba de prótons (高 dose)', 'Endoscopia terapêutica', 'Cirurgia (falha do tratamento endoscópico)'],
    medications: ['Omeprazol 80mg IV bolo + infusão 8mg/h', 'Octreotida (varizes)', 'Eritromicina (procinético antes de EDA)', 'Ferro oral (pós sangramento)'],
    alerts: ['Classificação de Forrest para úlcera', 'Risco de re-sangramento em 72h', 'Hospitalização em UTI para instabilidade hemodinâmica'],
  },
  // Infectologia
  {
    id: '9',
    name: 'Dengue Hemorrágica',
    specialty: 'Infectologia',
    definition: 'Forma grave de dengue por reinfecção com sorotipo diferente, caracterizada por extravasamento vascular e plaquetopenia.',
    symptoms: ['Febre alta', 'Dor retroorbital', 'Mialgia', 'Petéquias', 'Sangramento gengival', 'Dores abdominais intensas'],
    differentialDiagnosis: ['Dengue clássico', 'Leptospirose', 'Meningococcemia', 'Sepse', 'Leucemia'],
    exams: ['Sorologia dengue (IgM/IgG)', 'Hemoconcentração (Ht aumentado >20%)', 'Plaquetopenia', 'Teste de torniquete positivo', 'Eco-Doppler (vasculatura)'],
    treatment: ['Hidratação oral (fase febril)', 'Soro fisiológico IV (fase crítica)', 'Paracetamol para febre', 'Evitar AINES e aspirina', 'Transfusão de plaquetas (se sangramento ativo)'],
    medications: ['Soro fisiológico 0,9%', 'Ringer lactato', 'Paracetamol 500mg', 'Vitamina C', 'Complexo B'],
    alerts: ['Classificação OMS: dengue', ' dengue com sinais de alarme', 'dengue grave', 'Fase crítica: 3º-5º dia de doença = vazamento plasmático'],
  },
  {
    id: '10',
    name: 'Leptospirose',
    specialty: 'Infectologia',
    definition: 'Zoonose causada pela bactéria Leptospira interrogans, transmitida por urina de animais contaminados (especialmente ratos).',
    symptoms: ['Febre alta', 'Cefaleia', 'Mialgia (panturrilhas)', 'Conjuntivite', 'Icterícia', 'Insuficiência renal'],
    differentialDiagnosis: ['Dengue', 'Hepatite viral', 'Meningite', 'Sepse', 'Malária'],
    exams: ['ELISA IgM (padrão-ouro)', 'PCR (primeirasemana)', 'Hemograma (leucocitose)', 'Creatinina', 'Bilirrubinas', 'TGO/TGP'],
    treatment: ['Antibioticoterapia precoce', 'Doxiciclina (1ª linha)', 'Penicilina G cristalina', 'Ceftriaxona', 'Suporte renal (diálise)'],
    medications: ['Doxiciclina 100mg 12/12h', 'Penicilina G 4 MUI IV 6/6h', 'Ceftriaxona 1g IV 24/24h', 'Antieméticos', 'Dipirona'],
    alerts: ['Forma grave = síndrome de Weil (icterícia + insuficiência renal + hemorragia)', 'Período de incubação: 7-14 dias', 'Diagnóstico diferencial com hepatites virais'],
  },
  {
    id: '11',
    name: 'Meningite Bacteriana',
    specialty: 'Infectologia',
    definition: 'Inflamação das meninges por bactéria, emergência médica com alta mortalidade se não tratada rapidamente.',
    symptoms: ['Cefaleia intensa', 'Febre', 'Rigidez de nuca', 'Fotofobia', 'Alteração do nível de consciência', 'Convulsão'],
    differentialDiagnosis: ['Meningite viral', 'Meningite tuberculosa', 'Encefalite', 'Sepse', 'Hemorragia subaracnóidea'],
    exams: ['Punção lombar (gold standard)', 'Gram do líquor', 'Cultura do líquor', 'Glicose e proteína do líquor', 'Hemocultura', 'TC de crânio (antes de PL se indicado)'],
    treatment: ['Antibioticoterapia empírica IV imediata', 'Corticosteróides (dexametasona)', 'Tratamento de complicações', 'Suporte intensivo'],
    medications: ['Ceftriaxona 2g IV 12/12h', 'Vancomicina 1g IV 12/12h', 'Ampicilina (se Listeria)', 'Dexametasona 10mg IV antes ou com ATB', 'Manitol (se edema)'],
    alerts: ['Lactato no líquor > 3.5mmol/L = bacteriana', 'PL deve ser realizada antes de ATB se possível', 'Isolamento respiratório se meningococo'],
  },
  // Neurologia
  {
    id: '4',
    name: 'Acidente Vascular Cerebral Isquêmico',
    specialty: 'Neurologia',
    definition: 'Déficit neurológico súbito por isquemia cerebral focal, durando >24h ou com evidência de infarto.',
    symptoms: ['Hemiparesia/plegia', 'Disartria/afasia', 'Desvio de rima', 'Alteração visual', 'Ataxia'],
    differentialDiagnosis: ['AIT', 'AVC hemorrágico', 'Hipoglicemia', 'Convulsão (Todd)', 'Enxaqueca com aura'],
    exams: ['TC de crânio sem contraste (excluir hemorragia)', 'RM com difusão', 'Angio-TC/RM', 'ECG', 'Ecocardiograma'],
    treatment: ['Trombólise (rtPA) se <4.5h', 'Trombectomia mecânica se oclusão de grande vaso', 'Controle de PA', 'Antiagregação'],
    medications: ['Alteplase 0.9mg/kg (máx 90mg)', 'AAS 100-300mg', 'Estatina alta potência', 'Anti-hipertensivos'],
    alerts: ['Janela terapêutica: trombólise <4.5h', 'PA >185/110 = contraindicação rtPA', 'NIHSS para gravidade'],
  },
  {
    id: '12',
    name: 'Epilepsia — Primeira Crise',
    specialty: 'Neurologia',
    definition: 'Primeira manifestação epiléptica não provocadapor crise epileptiforme, requer investigação etiológica.',
    symptoms: ['Perda de consciência', 'Movimentos tônico-clônicos', 'Perda de tono pós-crise', 'Confusão pós-ictal', 'Cefaleia pós-crise', 'Ferimentos durante crise'],
    differentialDiagnosis: ['Síncope', 'Crise psicogênica', 'Transit ischemic attack', 'Hipoglicemia', 'Arritmia cardíaca'],
    exams: ['Eletroencefalograma (EEG)', 'TC de crânio (descartar lesões)', 'RM cerebral', 'Eletrólitos', 'Glicemia', 'Toxicológico'],
    treatment: ['Investigação etiológica', 'Acionar profilaxia após 2 crises', 'Acionar após 1 crise se anormalidade estrutural', 'Orientar medidas de segurança'],
    medications: [' carbamazepina', 'Fenitoína', 'Levetiracetam', 'Valproato', 'Lacosamida'],
    alerts: ['Estado de mal epiléptico = emergência', 'Crise > 5min = medicação de abortar', 'Dirigir: restrições conforme legislação'],
  },
  {
    id: '13',
    name: 'Meningite Viral',
    specialty: 'Neurologia',
    definition: 'Inflamação das meninges por vírus, geralmente benigna e autolimitada, mais comum que a bacteriana.',
    symptoms: ['Cefaleia', 'Febre', 'Rigidez de nuca (mais leve que bacteriana)', 'Fotofobia', 'Náuseas', 'Fadiga'],
    differentialDiagnosis: ['Meningite bacteriana', 'Meningite tuberculosa', 'Encefalite viral', 'Hipotireoidismo', 'Enxaqueca'],
    exams: ['Punção lombar', 'Líquor: linfocitose, glicose normal, proteína normal ou levemente elevada', 'PCR para herpesvírus', 'TC de crânio prévia a PL'],
    treatment: ['Tratamento sintomático', 'Hidratação', 'Analgésicos', 'Antieméticos', 'Aciclovir (se suspeita de HSV)'],
    medications: ['Paracetamol', 'Dipirona', 'Ondansetrona', 'Soro fisiológico', 'Aciclovir (herpes)'],
    alerts: ['Diagnóstico diferencial com bacteriana é crítico', 'Lactato normal (<2.8mmol/L) sugere viral', 'Piora clínica = reavaliar'],
  },
  {
    id: '14',
    name: 'Síndrome de Guillain-Barré',
    specialty: 'Neurologia',
    definition: 'Polirradiculoneuropatia inflamatória aguda frequentemente pós-infecciosa, caracterizada por paralisia ascendente.',
    symptoms: ['Paralisia ascendente (MMII para MMSS)', 'Parestesias', 'Areflexia/hiporreflexia', 'Dor neuropática', 'Dispneia (formas graves)', 'Disautonomia'],
    differentialDiagnosis: ['Mielite transversa', 'Botulismo', 'Miastenia gravis', 'Poliomielite', 'Intoxicação por organofosforados'],
    exams: ['Punção lombar (dissociação albuminocitológica)', 'Eletroneuromiografia (desmielinização)', 'TC/RM de coluna (descartarcompressão)', 'Glicemia', 'Função renal'],
    treatment: ['Plasmaférese', 'Imunoglobulina IV', 'Suporte respiratório (VNI ou VM)', 'Prevenção de trombose', 'Fisioterapia'],
    medications: ['Imunoglobulina humana 0.4g/kg/dia x 5d', 'Plasmaférese 4-6 sessões', 'Corticoides (controverso)', 'Dipirona (dor)', 'Enoxaparina (tromboprofilaxia)'],
    alerts: ['Dispneia = monitorização de FR', 'Disautonomia =instabilidade cardiovascular', 'Incapacidade de deambular = indicação de tratamento específico'],
  },
  // Endocrinologia (já existente)
  {
    id: '3',
    name: 'Diabetes Mellitus Tipo 2',
    specialty: 'Endocrinologia',
    definition: 'Distúrbio metabólico caracterizado por hiperglicemia crônica por resistência à insulina e/ou deficiência relativa de insulina.',
    symptoms: ['Poliúria', 'Polidipsia', 'Perda de peso', 'Fadiga', 'Visão turva', 'Infecções recorrentes'],
    differentialDiagnosis: ['DM tipo 1', 'LADA', 'Diabetes gestacional', 'Diabetes secundário (Cushing, drogas)'],
    exams: ['Glicemia de jejum ≥126mg/dL', 'HbA1c ≥6.5%', 'TOTG ≥200mg/dL 2h', 'Glicemia casual ≥200 + sintomas'],
    treatment: ['Mudança de estilo de vida', 'Metformina (1ª linha)', 'Associações conforme necessidade', 'Insulinização se falha'],
    medications: ['Metformina 500-2550mg/dia', 'Glicazida', 'Empagliflozina', 'Liraglutida', 'Insulina NPH/Regular'],
    alerts: ['Rastrear complicações: retina, rim, neuropatia', 'Meta HbA1c individualizada', 'iSGLT2 se DCV ou DRC'],
  },
  {
    id: '5',
    name: 'Insuficiência Cardíaca Descompensada',
    specialty: 'Cardiologia',
    definition: 'Síndrome clínica de congestão e/ou baixo débito em paciente com IC crônica ou de novo.',
    symptoms: ['Dispneia aos esforços/repouso', 'Ortopneia', 'DPN', 'Edema de MMII', 'Ganho de peso', 'Fadiga'],
    differentialDiagnosis: ['DPOC exacerbado', 'Pneumonia', 'TEP', 'Síndrome nefrótica', 'Cirrose hepática'],
    exams: ['BNP/NT-proBNP', 'Ecocardiograma', 'Radiografia de tórax', 'ECG', 'Função renal', 'Eletrólitos'],
    treatment: ['Diuréticos de alça IV', 'Vasodilatadores', 'Inotrópicos se baixo débito', 'Otimização de medicações crônicas'],
    medications: ['Furosemida IV 40-80mg', 'Nitroglicerina/Nitroprussiato', 'Dobutamina', 'Carvedilol', 'Enalapril', 'Espironolactona'],
    alerts: ['Perfil hemodinâmico: quente/frio, seco/úmido', 'IC FEr vs FEp = tratamento diferente', 'Congestão = principal causa de internação'],
  },
];

export default function BibliotecaDiagnostica() {
  const [search, setSearch] = useState('');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['symptoms', 'exams', 'treatment']);

  const filteredDiseases = DISEASES.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.symptoms.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const specialties = [...new Set(DISEASES.map((d) => d.specialty))];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Biblioteca Diagnóstica</h1>
          <p className="text-muted-foreground mt-1">Mini referência rápida de doenças</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por doença, especialidade ou sintoma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Disease List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Doenças ({filteredDiseases.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="p-4 space-y-2">
                    {specialties.map((specialty) => {
                      const diseasesInSpecialty = filteredDiseases.filter((d) => d.specialty === specialty);
                      if (diseasesInSpecialty.length === 0) return null;
                      return (
                        <div key={specialty}>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            {specialty}
                          </div>
                          {diseasesInSpecialty.map((disease) => (
                            <motion.button
                              key={disease.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedDisease(disease)}
                              className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                                selectedDisease?.id === disease.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted hover:bg-muted/80'
                              }`}
                            >
                              <div className="font-medium text-sm">{disease.name}</div>
                            </motion.button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Disease Details */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedDisease ? (
                <motion.div
                  key={selectedDisease.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{selectedDisease.name}</CardTitle>
                          <Badge variant="outline" className="mt-2">{selectedDisease.specialty}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Definition */}
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">{selectedDisease.definition}</p>
                      </div>

                      {/* Collapsible Sections */}
                      <CollapsibleSection
                        title="Sintomas"
                        icon={<Stethoscope className="h-4 w-4" />}
                        items={selectedDisease.symptoms}
                        isExpanded={expandedSections.includes('symptoms')}
                        onToggle={() => toggleSection('symptoms')}
                      />

                      <CollapsibleSection
                        title="Diagnóstico Diferencial"
                        icon={<AlertTriangle className="h-4 w-4" />}
                        items={selectedDisease.differentialDiagnosis}
                        isExpanded={expandedSections.includes('differential')}
                        onToggle={() => toggleSection('differential')}
                        variant="warning"
                      />

                      <CollapsibleSection
                        title="Exames"
                        icon={<TestTube className="h-4 w-4" />}
                        items={selectedDisease.exams}
                        isExpanded={expandedSections.includes('exams')}
                        onToggle={() => toggleSection('exams')}
                      />

                      <CollapsibleSection
                        title="Tratamento"
                        icon={<Pill className="h-4 w-4" />}
                        items={selectedDisease.treatment}
                        isExpanded={expandedSections.includes('treatment')}
                        onToggle={() => toggleSection('treatment')}
                        variant="success"
                      />

                      <CollapsibleSection
                        title="Medicamentos"
                        icon={<Pill className="h-4 w-4" />}
                        items={selectedDisease.medications}
                        isExpanded={expandedSections.includes('medications')}
                        onToggle={() => toggleSection('medications')}
                      />

                      {/* Alerts */}
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                          <AlertTriangle className="h-4 w-4" />
                          Alertas Importantes
                        </div>
                        <ul className="space-y-1">
                          {selectedDisease.alerts.map((alert, i) => (
                            <li key={i} className="text-sm text-destructive/80">• {alert}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-[600px] flex items-center justify-center"
                >
                  <div className="text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione uma doença para ver os detalhes</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function CollapsibleSection({
  title,
  icon,
  items,
  isExpanded,
  onToggle,
  variant = 'default',
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  isExpanded: boolean;
  onToggle: () => void;
  variant?: 'default' | 'warning' | 'success';
}) {
  const bgColors = {
    default: 'bg-muted/50',
    warning: 'bg-warning/10',
    success: 'bg-success/10',
  };

  return (
    <div className={`rounded-lg ${bgColors[variant]}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2 font-medium">
          {icon}
          {title}
          <Badge variant="secondary" className="ml-2">{items.length}</Badge>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ul className="px-4 pb-3 space-y-1">
              {items.map((item, i) => (
                <li key={i} className="text-sm">• {item}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
