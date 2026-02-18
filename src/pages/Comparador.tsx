import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ArrowLeftRight, Pill, Stethoscope, TestTube, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ComparisonItem {
  id: string;
  name: string;
  category: string;
  attributes: Record<string, string | string[]>;
}

const DISEASES: ComparisonItem[] = [
  // Cardiologia
  { id: 'iam', name: 'IAM com Supra de ST', category: 'Cardiologia', attributes: { 'Fisiopatologia': 'Oclusão coronariana total', 'Dor': 'Opressiva, retroesternal, > 20min', 'ECG': 'Supradesnivelamento ST ≥1mm', 'Troponina': 'Elevada (pico 12-24h)', 'Tratamento urgente': 'Reperfusão (ICP primária ou fibrinolítico)', 'Mortalidade': 'Alta sem tratamento' } },
  { id: 'angina', name: 'Angina Instável', category: 'Cardiologia', attributes: { 'Fisiopatologia': 'Oclusão parcial/instável', 'Dor': 'Opressiva, < 20min ou repouso', 'ECG': 'Infradesnivelamento ST ou normal', 'Troponina': 'Normal', 'Tratamento urgente': 'Antitrombóticos, estratificação', 'Mortalidade': 'Moderada sem tratamento' } },
  { id: 'pericardite', name: 'Pericardite Aguda', category: 'Cardiologia', attributes: { 'Fisiopatologia': 'Inflamação do pericárdio', 'Dor': 'Pleurítica, piora com decúbito', 'ECG': 'Supra ST difuso côncavo + infra PR', 'Troponina': 'Normal ou pouco elevada', 'Tratamento urgente': 'Anti-inflamatórios', 'Mortalidade': 'Baixa' } },
  { id: 'fibrilacao', name: 'Fibrilação Atrial', category: 'Cardiologia', attributes: { 'Fisiopatologia': 'Arritmia por fibrilação atrial', 'Ritmo': 'Irregular irregular', 'ECG': 'Ausência de onda P, complexo irregular', 'Riscos': 'AVC, insuficiência cardíaca', 'Tratamento': 'Anticoagulação, controle de frequência/ritmo', 'CHADS2-VASc': 'Escala para anticoagulação' } },
  { id: 'tep', name: 'Tromboembolismo Pulmonar', category: 'Cardiologia', attributes: { 'Fisiopatologia': 'Êmbolo na artéria pulmonar', 'Dispneia': 'Súbita', 'Dor torácica': 'Pleurítica', 'Exames': 'D-Dímero, Angio-TC', 'Tratamento': 'Anticoagulação, trombólise', 'Classificação': 'Massivo, submassivo, não massivo' } },
  { id: 'endocardite', name: 'Endocardite Infecciosa', category: 'Cardiologia', attributes: { 'Fisiopatologia': 'Infecção do endocárdio', 'Febre': 'Presente', 'Sopro': 'Cardíaco', 'Diagnóstico': 'Critérios de Duke', 'Tratamento': 'Antibioticoterapia IV prolongada', 'Complicações': 'Embolia, insuficiência valvar' } },
  // Pneumologia
  { id: 'dpoc', name: 'DPOC Exacerbação', category: 'Pneumologia', attributes: { 'Fisiopatologia': 'Obstrução crônica vias aéreas', 'Dispneia': 'Progressiva, piora', 'Tosse': 'Crônica, com expectoração', 'Exacerbação': 'Infecção (viral/bacteriana)', 'Gasometria': 'Hipoxemia, hipercapnia', 'Tratamento': 'Broncodilatadores, corticoide, antibiótico' } },
  { id: 'asma', name: 'Asma Agudizada', category: 'Pneumologia', attributes: { 'Fisiopatologia': 'Broncoespasmo, inflamação', 'Dispneia': 'Sibilância, aperto no peito', 'Sibilância': 'Diffusa, expiratória', 'Gás': 'Hipoxemia, normo ou hipercapnia', 'Tratamento': 'Beta-agonista, corticoide, sulfato de Mg', 'Gravidade': 'Pico expiratório fluxo (PEF) reduzido' } },
  { id: 'derrame', name: 'Derrame Pleural', category: 'Pneumologia', attributes: { 'Fisiopatologia': 'Acúmulo de líquido no espaço pleural', 'Dispneia': 'Presente', 'Dor torácica': 'Pleurítica', 'Exame': 'Radiografia de tórax, USG', 'Tipo': 'Transudato vs Exsudato', 'Tratamento': 'Toracocentese, tratar causa' } },
  // Gastroenterologia
  { id: 'pancreatite', name: 'Pancreatite Aguda', category: 'Gastroenterologia', attributes: { 'Fisiopatologia': 'Autodigestão pâncreas', 'Dor': 'Epigástrica, irradia costas', 'Náusea': 'Vômitos intensos', 'Amilase/Lipase': '>3x limite superior', 'Imagem': 'TC/USG com alterações', 'Etiologia mais comum': 'Litíase, etilismo' } },
  { id: 'hepatite', name: 'Hepatite Viral Aguda', category: 'Gastroenterologia', attributes: { 'Fisiopatologia': 'Inflamação hepatócitos/vírus', 'Icterícia': 'Colúria, acolia, icterícia', 'Dor': 'Hipocôndrio direito', 'Transaminases': 'AST, ALT muito elevadas', 'Etiologia': 'A, B, C, D, E', 'Transmissão': 'Fecal-oral (A/E), sangue (B/C)' } },
  { id: 'hemorragia', name: 'Hemorragia Digestiva Alta', category: 'Gastroenterologia', attributes: { 'Fisiopatologia': 'Sangramento proximal ao ligamento de Treitz', 'Manifestações': 'Hematêmese, melena', 'Diagnóstico': 'Endoscopia digestiva alta', 'Tratamento': 'Endoscopia terapêutica, IPP IV', 'Classificação': 'Forrest (úlcera)' } },
  // Infectologia
  { id: 'dengue', name: 'Dengue', category: 'Infectologia', attributes: { 'Fisiopatologia': 'Infecção viral (Flavivirus)', 'Febre': 'Alta (39-40°C), bifásica', 'Exantema': 'Sim, rash maculopapular', 'Dor': 'Mialgia, artralgia, cefaleia', 'Laboratório': 'Leucopenia, plaquetopenia', 'Sinais de alerta': 'Dor abdominal, vômitos, sangramento' } },
  { id: 'leptospirose', name: 'Leptospirose', category: 'Infectologia', attributes: { 'Fisiopatologia': 'Infecção por Leptospira', 'Febre': 'Alta, súbita', 'Exantema': 'Raro', 'Dor': 'Mialgia intensa (panturrilhas)', 'Laboratório': 'Leucocitose, azotemia', 'Sinais de alerta': 'Icterícia, insuficiência renal' } },
  { id: 'meningiteb', name: 'Meningite Bacteriana', category: 'Infectologia', attributes: { 'Fisiopatologia': 'Infecção meninges/bactérias', 'Febre': 'Alta', 'Sinais meníngeos': 'Kernig, Brudzinski positivos', 'LCR': 'Pleocitose polimorfonuclear, proteína ↑, glicose ↓', 'Tratamento': 'Antibiótico empírico urgente', 'Complicações': 'Septicemia, neurológicas' } },
  { id: 'tifo', name: 'Febre Tifoide', category: 'Infectologia', attributes: { 'Fisiopatologia': 'Infecção por Salmonella Typhi', 'Febre': 'Gradual, sustentada', 'Exantema': 'Roseolas em tronco', 'Dor': 'Abdominal, cefaleia', 'Laboratório': 'Leucopenia, hemocultura positiva', 'Sinais de alerta': 'Sangramento intestinal, perfuração' } },
  // Neurologia
  { id: 'avc', name: 'AVC Isquêmico', category: 'Neurologia', attributes: { 'Fisiopatologia': 'Oclusão de artéria cerebral', 'Início': 'Súbito', 'Déficit': 'Focal, conforme artéria', 'TC inicial': 'Normal ou hiperdensidade', 'Tratamento': 'Trombólise ou trombectomia', 'Janela terapêutica': '4,5h para trombólise' } },
  { id: 'meningite', name: 'Meningite Viral', category: 'Neurologia', attributes: { 'Fisiopatologia': 'Inflamação meninges por vírus', 'Febre': 'Presente', 'Sinais meníngeos': 'Podem estar presentes', 'LCR': 'Linfocitose, glicose normal', 'Tratamento': 'SintOMAtivo (aciclovir se HSV)', 'Prognóstico': 'Geralmente benigno' } },
  { id: 'epilepsia', name: 'Epilepsia - Primeira Crise', category: 'Neurologia', attributes: { 'Fisiopatologia': 'Atividade epileptiforme anormal', 'Crise': 'Perda de consciência, movimentos anormais', 'Pós-crise': 'Confusão, fadiga', 'Diagnóstico': 'EEG, TC/RM cerebral', 'Tratamento': 'Após 2 crises ou lesão estrutural', 'Estado': 'Mal epiléptico >5min' } },
  { id: 'guillain', name: 'Síndrome de Guillain-Barré', category: 'Neurologia', attributes: { 'Fisiopatologia': 'Polirradiculoneuropatia inflamatória', 'Sintomas': 'Paralisia ascendente, parestesias', 'Reflexos': 'Areflexia', 'Exames': 'PL (dissociação albuminocitológica)', 'Tratamento': 'Plasmaférese, IVIG', 'Complicação': 'Insuficiência respiratória' } },
  // Endocrinologia
  { id: 'tireotoxicose', name: 'Tireotoxicose', category: 'Endocrinologia', attributes: { 'Fisiopatologia': 'Excesso hormônios tireoide', 'Sintomas': 'Taquicardia, tremor, perda peso', 'Olhos': 'Exoftalmo (Doença Graves)', 'Laboratório': 'TSH suprimido, T4/T3 elevado', 'Tratamento': 'Betabloqueador, antitireoidiano', 'Causa mais comum': 'Doença de Graves' } },
  { id: 'diabetes', name: 'Cetoacidose Diabética', category: 'Endocrinologia', attributes: { 'Fisiopatologia': 'Deficit insulina, hiperglicemia', 'Sintomas': 'Poliúria, polidipsia, náusea', 'Respiração': 'Kussmaul (respiração ácida)', 'Laboratório': 'Glicemia >250, pH <7.3, CETONAS +', 'Tratamento': 'Insulina, fluids, eletrólitos', 'Precipitante': 'Infecção, omissão insulina' } },
  // Outras especialidades
  { id: 'insuficiencia', name: 'Insuficiência Cardíaca', category: 'Cardiologia', attributes: { 'Fisiopatologia': 'Coração não bomba adequadamente', 'Dispneia': 'Ortopneia, PND', 'Edema': 'Periférico, sacral', 'BNP/NT-proBNP': 'Elevado', 'Tratamento': 'Diuréticos, betabloqueador, IECArB', 'Classificação': 'NYHA I-IV, FE reduzida ou preservada' } },
  { id: 'ar', name: 'Artrite Reumatoide', category: 'Reumatologia', attributes: { 'Fisiopatologia': 'Doença autoimune crônica', 'Articulações': 'Sinovite, mãos/pés, simétrica', 'Rigidez matinal': '>1 hora', 'Fator reumatoide': 'Positivo em 70-80%', 'Tratamento': 'DMARDs (metotrexate), biológico', 'Complicações': 'Deformidades, manifestações sistêmicas' } },
  { id: 'lupus', name: 'Lúpus Eritematoso Sistêmico', category: 'Reumatologia', attributes: { 'Fisiopatologia': 'Doença autoimune multissistêmica', 'Manifestações': 'Cutânea, renal, articular, hematológica', 'ANA': 'Positivo (tela)', 'Anti-dsDNA': 'Especifico, atividade doença', 'Tratamento': 'Corticoide, imunossupressor, hidroxicloroquina', 'Critérios': 'SLICC/ACR' } },
  { id: 'anemia', name: 'Anemia Falciforme', category: 'Hematologia', attributes: { 'Fisiopatologia': 'Hemoglobina S, polimerização', 'Crise': 'Drepanocítica (oclusão vascular)', 'Dor': 'Óssea, abdomen, torácica', 'Hemoglobina': 'Baixa (6-8g/dL habitual)', 'Tratamento': 'Hidroxiureia, transfusão, analgesia', 'Complicações': 'AVC, séquestração esplênica, úlcera perna' } },
  { id: 'leucemia', name: 'Leucemia Mieloide Crônica', category: 'Hematologia', attributes: { 'Fisiopatologia': 'Proliferação granulócitos', 'Sintomas': 'Fadiga, esplenomegalia', 'Leucocitose': 'Marcada (>100.000)', 'Philadelphia': 'Cromossomo positivo (BCR-ABL)', 'Tratamento': 'Inibidor Tirosina Quinase (Imatinib)', 'Evolução': 'Crise blástica (agudização)' } },
  { id: 'trombose', name: 'TVP', category: 'Angiologia', attributes: { 'Fisiopatologia': 'Trombo veia profunda', 'Sinais': 'Edema unilateral, dor, eritema', 'Homans': 'Dor à dorsiflexão', 'Dupscan': 'Trombo visualizado', 'Tratamento': 'Anticoagulação (HBPM, warfarin, DOAC)', 'Complicação': 'TEP (embolismo)' } },
];

const MEDICATIONS: ComparisonItem[] = [
  // Antibacterianos
  { id: 'amoxicilina', name: 'Amoxicilina', category: 'Penicilinas', attributes: { 'Classe': 'Beta-lactâmico - Penicilina', 'Espectro': ['Gram+ (Streptococcus)', 'Alguns Gram- (H. influenzae)', 'Anaeróbios orais'], 'Mecanismo': 'Inibe síntese de parede celular', 'Via': 'Oral', 'Dose usual adulto': '500mg 8/8h', 'Indicações principais': ['Otite média', 'Sinusite', 'Faringite', 'ITU não complicated'], 'Efeitos adversos': ['Diarreia', 'Rash', 'Anafilaxia'] } },
  { id: 'azitromicina', name: 'Azitromicina', category: 'Macrolídeos', attributes: { 'Classe': 'Macrolídeo', 'Espectro': ['Gram+ (atípicos)', 'Atípicos (Mycoplasma, Chlamydia)', 'Alguns Gram-'], 'Mecanismo': 'Inibe síntese proteica (50S)', 'Via': 'Oral / IV', 'Dose usual adulto': '500mg 1x/dia por 3-5 dias', 'Indicações principais': ['PAC atípica', 'DSTs', 'DPOC exacerbado'], 'Efeitos adversos': ['Náusea', 'Diarreia', 'Prolongamento QT'] } },
  { id: 'ciprofloxacino', name: 'Ciprofloxacino', category: 'Fluoroquinolonas', attributes: { 'Classe': 'Fluoroquinolona', 'Espectro': ['Gram- (E. coli, Pseudomonas)', 'Alguns Gram+', 'Atípicos'], 'Mecanismo': 'Inibe DNA girase', 'Via': 'Oral / IV', 'Dose usual adulto': '500mg 12/12h', 'Indicações principais': ['ITU complicada', 'Pielonefrite', 'Gastroenterite grave'], 'Efeitos adversos': ['Tendinite/ruptura tendão', 'Neuropatia', 'Prolongamento QT'] } },
  { id: 'metronidazol', name: 'Metronidazol', category: 'Nitroimidazóis', attributes: { 'Classe': 'Nitroimidazol', 'Espectro': ['Anaeróbios', 'Protozoários (Giardia, Trichomonas)', 'H. pylori'], 'Mecanismo': 'DNA ruptura após metabolização', 'Via': 'Oral / IV / Tópico', 'Dose usual adulto': '250-500mg 8/8h', 'Indicações principais': ['Vaginose bacteriana', 'Amebíase', 'Giardíase', 'Abscesso hepático'], 'Efeitos adversos': ['Metálica no gosto', 'Náusea', 'Neutropenia', 'Interação com álcool'] } },
  { id: 'ceftriaxona', name: 'Ceftriaxona', category: 'Cefalosporinas', attributes: { 'Classe': 'Cefalosporina 3ª geração', 'Espectro': ['Gram+ (exceto MRSA)', 'Gram- (inclui H. influenzae)', 'Meningococo', 'Pneumococo'], 'Mecanismo': 'Inibe síntese parede celular', 'Via': 'IV / IM', 'Dose usual adulto': '1-2g 1x/dia', 'Indicações principais': ['Meningite', 'Gonorreia', 'ITU complicated', 'Pneumonia'], 'Efeitos adversos': ['Diarreia', 'Rash', 'Colestase', 'Panquimeningite (bebês)'] } },
  { id: 'vancomicina', name: 'Vancomicina', category: 'Glicopeptídeos', attributes: { 'Classe': 'Glicopeptídeo', 'Espectro': ['Gram+ (MRSA, Enterococcus)', 'Clostridioides difficile'], 'Mecanismo': 'Inibe síntese parede celular', 'Via': 'IV / Oral (C. diff)', 'Dose usual adulto': '15-20mg/kg 6/6h (IV)', 'Indicações principais': ['MRSA', 'Endocardite', 'Osteomielite', 'Colite por C. difficile'], 'Efeitos adversos': ['Nefrotoxicidade', 'Red man syndrome', 'Ototoxicidade'] } },
  // Analgesicos e Anti-inflamatórios
  { id: 'dipirona', name: 'Dipirona', category: 'Anti-inflamatórios', attributes: { 'Classe': 'Pirazolona', 'Mecanismo': 'Inibe COX, analgesia central', 'Via': 'Oral / EV / Retal', 'Dose usual adulto': '500mg 6/6h ou 1g 4/4h', 'Indicações principais': ['Dor', 'Febre', 'Cólica', 'Antiemético'], 'Efeitos adversos': ['Hipotensão (EV)', 'Reação anafilática', 'Agranulocitose (rara)'] } },
  { id: 'ibuprofeno', name: 'Ibuprofeno', category: 'AINE', attributes: { 'Classe': 'Derivado propiônico', 'Mecanismo': 'Inibe COX-1 e COX-2', 'Via': 'Oral', 'Dose usual adulto': '200-600mg 6/6h (máx 2400mg/dia)', 'Indicações principais': ['Dor', 'Febre', 'Inflamação', 'Artrite'], 'Efeitos adversos': ['Gastrite/úlcera', 'Nefrotoxicidade', 'Risco cardiovascular'] } },
  // Gastro
  { id: 'omeprazol', name: 'Omeprazol', category: 'Inibidores bomba prótons', attributes: { 'Classe': 'IBP', 'Mecanismo': 'Bloqueia H+/K+ ATPase', 'Via': 'Oral / EV', 'Dose usual adulto': '20-40mg 1x/dia', 'Indicações principais': ['Úlcera gástrica', 'RGE', 'Prevenção gastrite', 'Síndrome Zollinger'], 'Efeitos adversos': ['Diarreia', 'Cefaleia', 'Deficiência B12 (uso prolongado)', 'Fraturas'] } },
  { id: 'metoclopramida', name: 'Metoclopramida', category: 'Antieméticos', attributes: { 'Classe': 'Antagonista dopamina', 'Mecanismo': 'Bloqueia receptores dopamina (CTZ)', 'Via': 'Oral / EV / IM', 'Dose usual adulto': '10mg 6/6h (máx 30mg/dia)', 'Indicações principais': ['Náusea/vômito', 'Gastroparesia', 'Cefaleia refratária'], 'Efeitos adversos': ['Síndrome extrapiramidal', 'Galactorréu', 'Sonolência'] } },
  // Endocrinologia
  { id: 'metformina', name: 'Metformina', category: 'Endocrinologia', attributes: { 'Classe': 'Biguanida', 'Mecanismo': 'Reduz produção hepática glicose', 'Via': 'Oral', 'Dose usual adulto': '500mg 2-3x/dia (máx 2550mg/dia)', 'Indicações principais': ['DM tipo 2', 'Síndrome ovário policístico'], 'Efeitos adversos': ['Distúrbios GI', 'Deficiência B12', 'Acidose lática (rara)'] } },
  { id: 'prednisona', name: 'Prednisona', category: 'Corticosteroides', attributes: { 'Classe': 'Glicocorticoide', 'Mecanismo': 'Ativa genes anti-inflamatórios', 'Via': 'Oral', 'Dose usual adulto': '5-60mg/dia (conforme doença)', 'Indicações principais': ['Asma/DPOC', 'Lúpus', 'Artrite', 'Alergia grave', 'Câncer'], 'Efeitos adversos': ['Hiperglicemia', 'Osteoporose', 'Ganho peso', 'Supressão adrenal'] } },
  // Cardiologia
  { id: 'losartana', name: 'Losartana', category: 'Cardiologia', attributes: { 'Classe': 'Bloqueador receptor angiotensina II', 'Mecanismo': 'Bloqueia receptor AT1', 'Via': 'Oral', 'Dose usual adulto': '50-100mg 1x/dia', 'Indicações principais': ['Hipertensão', 'Insuficiência cardíaca', 'Nefropatia diabética'], 'Efeitos adversos': ['Tontura', 'Hipercalemia', 'Tosse (rara)'] } },
  { id: 'atorvastatina', name: 'Atorvastatina', category: 'Cardiologia', attributes: { 'Classe': 'Estatina', 'Mecanismo': 'Inibe HMG-CoA redutase', 'Via': 'Oral', 'Dose usual adulto': '10-80mg 1x/dia', 'Indicações principais': ['Dislipidemia', 'Prevenção cardiovascular', 'Aterosclerose'], 'Efeitos adversos': ['Mialgia', 'Hepatotoxicidade', 'Diabetes (risco)'] } },
  { id: 'amiodarona', name: 'Amiodarona', category: 'Antiarrítmicos', attributes: { 'Classe': 'Antiarrítmico classe III', 'Mecanismo': 'Bloqueia múltiplos canais', 'Via': 'Oral / EV', 'Dose usual adulto': '200mg 1-3x/dia (manutenção)', 'Indicações principais': ['Fibrilação atrial', 'Taquicardia ventricular', 'PCR'], 'Efeitos adversos': ['Fibrose pulmom', 'Disfunção tireoide', 'Hepatoxicidade', 'Acúmulo tecidual'] } },
  { id: 'heparina', name: 'Heparina', category: 'Anticoagulantes', attributes: { 'Classe': 'Anticoagulante parenteral', 'Mecanismo': 'Potencializa antitrombina III', 'Via': 'SC / EV', 'Dose usual adulto': '5000UI SC 12/12h ou infusão EV', 'Indicações principais': ['TVP/TEP', 'Embolia', 'Cirurgia', 'PAM (síndrome)'], 'Efeitos adversos': ['Sangramento', 'Plaquetopenia (HIT)', 'Osteoporose (uso prolongado)'] } },
  { id: 'enoxaparina', name: 'Enoxaparina', category: 'Anticoagulantes', attributes: { 'Classe': 'HBPM (baixo peso molecular)', 'Mecanismo': 'Inibe fator Xa e IIa', 'Via': 'SC', 'Dose usual adulto': '1mg/kg 12/12h ou 1,5mg/kg 1x/dia', 'Indicações principais': ['TVP/TEP', 'Pós-operatório', 'Angina instável', 'IAM'], 'Efeitos adversos': ['Sangramento', 'Plaquetopenia', 'Hematoma local'] } },
  { id: 'warfarina', name: 'Varfarina', category: 'Anticoagulantes', attributes: { 'Classe': 'Antagonista vitamina K', 'Mecanismo': 'Inibe síntese fatores coagulação', 'Via': 'Oral', 'Dose usual adulto': '2-10mg/dia (ajustar INR)', 'Indicações principais': ['Fibrilação atrial', 'TVP/TEP', 'Próteses valvares'], 'Efeitos adversos': ['Sangramento', 'Necrose cutânea', 'Interações medicamentosas'] } },
  // Pneumologia
  { id: 'salbutamol', name: 'Salbutamol', category: 'Broncodilatadores', attributes: { 'Classe': 'Agonista β2 adrenérgico', 'Mecanismo': 'Relaxa musculatura brônquica', 'Via': 'Inalatório / Oral / EV', 'Dose usual adulto': '100-200mcg inalatório 4/4h ou 2-4mg oral 4/4h', 'Indicações principais': ['Asma', 'DPOC', 'Broncoespasmo'], 'Efeitos adversos': ['Taquicardia', 'Tremor', 'Hipocalemia', 'Paradoxo (broncospasmo)'] } },
  // Outros
  { id: 'morfina', name: 'Morfina', category: 'Opioides', attributes: { 'Classe': 'Opioide forte', 'Mecanismo': 'Ativa receptores opioides μ', 'Via': 'Oral / SC / EV', 'Dose usual adulto': '10mg SC/EV 4/4h ou 10-20mg oral 4/4h', 'Indicações principais': ['Dor intensa', 'IAM', 'Cólica renal', 'Pós-cirúrgico'], 'Efeitos adversos': ['Sedação', 'Náusea', 'Constipação', 'Depressão respiratória'] } },
  { id: 'diazepam', name: 'Diazepam', category: 'Benzodiazepínicos', attributes: { 'Classe': 'Benzodiazepínico', 'Mecanismo': 'Potencia GABA-A', 'Via': 'Oral / EV / Retal', 'Dose usual adulto': '5-10mg 2-3x/dia ou 10mg EV', 'Indicações principais': ['Ansiedade', 'Convulsão', 'Espasmo muscular', 'Abstinência alcoólica'], 'Efeitos adversos': ['Sedação', 'Dependência', 'Tolerância', 'Comprometimento cognitivo'] } },
  { id: 'insulina', name: 'Insulina', category: 'Hipoglicemiantes', attributes: { 'Classe': 'Hormônio pancreático', 'Mecanismo': 'Permite entrada glicose células', 'Via': 'SC', 'Tipos': ['Rápida (regular, aspart, lispro)', 'Intermediária (NPH)', 'Longa (glargina, detemir)'], 'Indicações principais': ['DM tipo 1', 'DM tipo 2', 'Cetoacidose', 'Cirurgia'], 'Efeitos adversos': ['Hipoglicemia', 'Ganho peso', 'Lipodistrofia'] } },
];

const EXAMS: ComparisonItem[] = [
  { id: 'tc', name: 'Tomografia (TC)', category: 'Imagem', attributes: { 'Radiação': 'Sim (alta)', 'Contraste': 'Iodado (quando necessário)', 'Tempo': '5-15 minutos', 'Resolução': 'Excelente para osso e parênquima', 'Indicações': ['Trauma', 'AVC agudo', 'Tórax/Abdome'], 'Contraindicações': ['Gravidez (relativa)', 'Alergia ao contraste', 'IRC grave'], 'Custo': 'Moderado-Alto' } },
  { id: 'rm', name: 'Ressonância (RM)', category: 'Imagem', attributes: { 'Radiação': 'Não', 'Contraste': 'Gadolínio (quando necessário)', 'Tempo': '30-60 minutos', 'Resolução': 'Excelente para partes moles', 'Indicações': ['Neuroimagem', 'Articulações', 'Tumores'], 'Contraindicações': ['Marcapasso', 'Implantes metálicos', 'Claustrofobia'], 'Custo': 'Alto' } },
  { id: 'usg', name: 'Ultrassonografia', category: 'Imagem', attributes: { 'Radiação': 'Não', 'Contraste': 'Não (geralmente)', 'Tempo': '15-30 minutos', 'Resolução': 'Boa para estruturas superficiais', 'Indicações': ['Gestação', 'Abdome', 'Tireoide', 'Vascular'], 'Contraindicações': ['Praticamente nenhuma'], 'Custo': 'Baixo-Moderado' } },
  { id: 'ecg', name: 'Eletrocardiograma (ECG)', category: 'Exames Funcionais', attributes: { 'Invasivo': 'Não', 'Preparo': 'Sem preparo especial', 'Tempo': '5-10 minutos', 'Indicações': ['Arritmias', 'IAM', 'Bloqueios', 'Avaliação geral'], 'Contraindicações': ['Nenhuma'], 'Custo': 'Baixo' } },
  { id: 'eco', name: 'Ecocardiograma', category: 'Exames Funcionais', attributes: { 'Invasivo': 'Não (transtorácico)', 'Preparo': 'Sem preparo', 'Tempo': '20-40 minutos', 'Indicações': ['Insuficiência cardíaca', 'Valvopatias', 'Cardiomiopatias'], 'Contraindicações': ['Nenhuma (transtorácico)'], 'Custo': 'Moderado' } },
  { id: 'cateterismo', name: 'Cateterismo Cardíaco', category: 'Exames Invasivos', attributes: { 'Invasivo': 'Sim', 'Preparo': 'Jejum 6h, creatinina', 'Tempo': '30-60 minutos', 'Indicações': ['Doença coronariana', 'Valvopatias', 'Estudos eletrofisiológicos'], 'Complicações': ['Sangramento', 'Arritmia', 'AVC', 'Nefropatia contraste'], 'Custo': 'Alto' } },
  { id: 'colonoscopia', name: 'Colonoscopia', category: 'Endoscopia', attributes: { 'Invasivo': 'Sim', 'Preparo': 'Dieta líquida + laxativos', 'Tempo': '15-60 minutos', 'Indicações': ['Rastreio CRC', 'Sangramento', 'Diarreia crônica'], 'Complicações': ['Perfuração', 'Sangramento', 'Reação sedação'], 'Custo': 'Moderado-Alto' } },
  { id: 'endoscopia', name: 'Endoscopia Digestiva Alta', category: 'Endoscopia', attributes: { 'Invasivo': 'Sim', 'Preparo': 'Jejum 8h', 'Tempo': '5-15 minutos', 'Indicações': ['Dispepsia', 'Sangramento', 'Pólipos', 'ERGE'], 'Complicações': ['Perfuração', 'Sangramento', 'Reação sedação'], 'Custo': 'Moderado' } },
  { id: 'broncoscopia', name: 'Broncoscopia', category: 'Endoscopia', attributes: { 'Invasivo': 'Sim', 'Preparo': 'Jejum 6h, coagulograma', 'Tempo': '15-30 minutos', 'Indicações': ['Nódulo pulmão', 'Hemoptise', 'Lavage broncoalveolar'], 'Complicações': ['Sangramento', 'Pneumotórax', 'Infecção'], 'Custo': 'Alto' } },
  { id: 'biópsia', name: 'Biópsia', category: 'Patologia', attributes: { 'Invasivo': 'Sim (variável)', 'Preparo': 'Conforme local', 'Tempo': '15-30 minutos', 'Indicações': ['Diagnóstico tumoral', 'Doenças renais', 'Medula óssea'], 'Complicações': ['Sangramento', 'Infecção', 'Dor'], 'Custo': 'Moderado-Alto' } },
  { id: 'espirometria', name: 'Espirometria', category: 'Prova Função Pulmonar', attributes: { 'Invasivo': 'Não', 'Preparo': 'Não fumar 6h, suspender broncodilatador', 'Tempo': '15-20 minutos', 'Indicações': ['Asma', 'DPOC', 'Dispneia', 'Pneumectomia'], 'Contraindicações': ['Pneumotórax', 'Hemoptise recente', 'IAM recente'], 'Custo': 'Baixo-Moderado' } },
  { id: 'gasometria', name: 'Gasometria Arterial', category: 'Laboratório', attributes: { 'Invasivo': 'Sim (sangue arterial)', 'Preparo': 'Nenhum', 'Tempo': '5 minutos', 'Indicações': ['Insuficiência respiratória', 'Acidose', 'Avaliação O2/CO2'], 'Complicações': ['Sangramento', 'Hematoma', 'Lesão arterial (rara)'], 'Custo': 'Baixo' } },
  { id: 'urotc', name: 'Urografia Excretora (Uro-TC)', category: 'Imagem', attributes: { 'Radiação': 'Sim', 'Contraste': 'Iodado EV', 'Tempo': '30-60 minutos', 'Indicações': ['Cálculo urinário', 'Hematuria', 'Tumor bexiga'], 'Contraindicações': ['IRC grave', 'Alergia contraste', 'Gravidez'], 'Custo': 'Moderado-Alto' } },
  { id: 'colangio', name: 'Colangiopancreatografia (CPRE)', category: 'Endoscopia', attributes: { 'Invasivo': 'Sim', 'Preparo': 'Jejum 8h, coagulação', 'Tempo': '30-90 minutos', 'Indicações': ['Coledocolitíase', 'Estenose biliar', 'Pancreatite biliar'], 'Complicações': ['Pancreatite', 'Sangramento', 'Perfuração', 'Colangite'], 'Custo': 'Alto' } },
  { id: 'densitometria', name: 'Densitometria Óssea', category: 'Imagem', attributes: { 'Radiação': 'Sim (baixa)', 'Contraste': 'Não', 'Tempo': '10-15 minutos', 'Indicações': ['Osteoporose', 'Osteopenia', 'Risco fratura'], 'Contraindicações': ['Gravidez'], 'Custo': 'Moderado' } },
  { id: 'mamografia', name: 'Mamografia', category: 'Imagem', attributes: { 'Radiação': 'Sim', 'Contraste': 'Não', 'Tempo': '15-20 minutos', 'Indicações': ['Rastreio cáncer mama', 'Nódulo', 'Avaliação follow-up'], 'Contraindicações': ['Gravidez', 'Implantes silicone (técnica especial)'], 'Custo': 'Moderado' } },
  { id: 'pet', name: 'PET-CT', category: 'Medicina Nuclear', attributes: { 'Radiação': 'Sim (alta - radiofarmaco)', 'Contraste': 'FDG (18F)', 'Tempo': '60-90 minutos', 'Indicações': ['Estadiamento cáncer', 'Pesquisa metástases', 'Linfoma'], 'Contraindicações': ['Glicemia alta', 'Gravidez', 'Amamentação (48h)'], 'Custo': 'Muito alto' } },
  { id: 'cintilografia', name: 'Cintilografia', category: 'Medicina Nuclear', attributes: { 'Radiação': 'Sim (variável)', 'Contraste': 'Radioisótopo', 'Tempo': '30-120 minutos', 'Indicações': ['Perfusão miocárdica', 'Osso', 'Tireoide', 'Renal'], 'Contraindicações': ['Gravidez', 'Amamentação'], 'Custo': 'Moderado-Alto' } },
  { id: 'angio', name: 'Angiotomografia', category: 'Imagem', attributes: { 'Radiação': 'Sim (alta)', 'Contraste': 'Iodado em dose alta', 'Tempo': '10-20 minutos', 'Indicações': ['Trombose', 'Aneurisma', 'Dissecção', 'AVC'], 'Contraindicações': ['IRC', 'Alergia contraste', 'Gravidez'], 'Custo': 'Alto' } },
  { id: 'holter', name: 'Holter 24h', category: 'Exames Funcionais', attributes: { 'Invasivo': 'Não', 'Preparo': 'Barbear toráx', 'Tempo': '24h (monitoramento)', 'Indicações': ['Arritmia', 'Palpitação', 'Síncope', 'Pós-IAM'], 'Contraindicações': ['Nenhuma'], 'Custo': 'Moderado' } },
];

export default function Comparador() {
  const [category, setCategory] = useState<'diseases' | 'medications' | 'exams'>('diseases');
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const items = category === 'diseases' ? DISEASES : category === 'medications' ? MEDICATIONS : EXAMS;
  
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItems = items.filter((item) => selected.includes(item.id));

  const toggleSelection = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const allAttributes = selectedItems.length > 0
    ? [...new Set(selectedItems.flatMap((item) => Object.keys(item.attributes)))]
    : [];

  const getIcon = () => {
    switch (category) {
      case 'diseases': return <Stethoscope className="h-5 w-5" />;
      case 'medications': return <Pill className="h-5 w-5" />;
      case 'exams': return <TestTube className="h-5 w-5" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comparador Inteligente</h1>
          <p className="text-muted-foreground mt-1">Compare doenças, medicamentos e exames lado a lado</p>
        </div>

        <Tabs value={category} onValueChange={(v) => { setCategory(v as any); setSelected([]); }}>
          <TabsList>
            <TabsTrigger value="diseases" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Doenças ({DISEASES.length})
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Medicamentos ({MEDICATIONS.length})
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Exames ({EXAMS.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {getIcon()}
                  Selecione até 3
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredItems.map((item) => (
                    <motion.button key={item.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => toggleSelection(item.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${selected.includes(item.id) ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className={`text-xs ${selected.includes(item.id) ? 'opacity-80' : 'text-muted-foreground'}`}>{item.category}</div>
                    </motion.button>
                  ))}
                </div>
                {selected.length > 0 && <Button variant="outline" className="w-full" onClick={() => setSelected([])}>Limpar seleção</Button>}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {selectedItems.length === 0 ? (
              <Card className="h-[400px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione itens para comparar</p>
                </div>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium text-muted-foreground bg-muted/50">Atributo</th>
                        {selectedItems.map((item) => (
                          <th key={item.id} className="text-left p-4 font-medium min-w-[200px]">
                            <div className="flex items-center justify-between">
                              <div>
                                <div>{item.name}</div>
                                <Badge variant="outline" className="mt-1">{item.category}</Badge>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => toggleSelection(item.id)} className="h-6 w-6 p-0">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allAttributes.map((attr, index) => (
                        <motion.tr key={attr} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="border-b last:border-0">
                          <td className="p-4 font-medium text-muted-foreground bg-muted/30">{attr}</td>
                          {selectedItems.map((item) => {
                            const value = item.attributes[attr];
                            return (
                              <td key={item.id} className="p-4">
                                {Array.isArray(value) ? (
                                  <ul className="list-disc list-inside space-y-1">
                                    {value.map((v, i) => <li key={i} className="text-sm">{v}</li>)}
                                  </ul>
                                ) : value ? <span className="text-sm">{value}</span> : <span className="text-muted-foreground">-</span>}
                              </td>
                            );
                          })}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
