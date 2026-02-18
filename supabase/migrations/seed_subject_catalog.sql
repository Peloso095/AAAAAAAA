-- =============================================================================
-- CRIAÇÃO DA TABELA subject_catalog E SEED COMPLETO
-- Execute este script no Supabase SQL Editor
-- =============================================================================

-- 1. CRIAR TABELA CATÁLOGO DE MATÉRIAS
CREATE TABLE IF NOT EXISTS public.subject_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    group_type TEXT NOT NULL CHECK (group_type IN ('grad', 'resid')),
    group_key TEXT NOT NULL,
    group_label TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (group_type, group_key, name)
);

-- 2. ÍNDICE PARA BUSCAS
CREATE INDEX IF NOT EXISTS idx_subject_catalog_group ON public.subject_catalog(group_type, group_key);

-- 3. POLÍTICA RLS (pode ser lido por todos, modificado apenas por admins)
ALTER TABLE public.subject_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read subject catalog" ON public.subject_catalog;
CREATE POLICY "Anyone can read subject catalog" ON public.subject_catalog FOR SELECT USING (true);

-- 4. CRIAR CONSTRAINT UNIQUE EM subjects PARA EVITAR DUPLICADOS
-- Primeiro, verificar se já existe
DO $$ 
BEGIN
    -- Tenta criar constraint se não existir
    ALTER TABLE public.subjects 
    ADD CONSTRAINT subjects_user_id_name_key UNIQUE (user_id, name);
EXCEPTION
    WHEN duplicate_table THEN NULL;
END
$$;

-- =============================================================================
-- SEED: GRADUAÇÃO - 1º AO 6º ANO
-- =============================================================================

-- 1º Ano – Básico / Ciências Fundamentais
INSERT INTO public.subject_catalog (name, group_type, group_key, group_label, description) VALUES
('Anatomia Humana (Macroscópica)', 'grad', '1ano', '1º Ano – Básico / Ciências Fundamentais', 'Foco: Anatomia, bioquímica, fisiologia e introdução à saúde.'),
('Histologia', 'grad', '1ano', '1º Ano – Básico / Ciências Fundamentais', 'Foco: Anatomia, bioquímica, fisiologia e introdução à saúde.'),
('Embriologia', 'grad', '1ano', '1º Ano – Básico / Ciências Fundamentais', 'Foco: Anatomia, bioquímica, fisiologia e introdução à saúde.'),
('Bioquímica', 'grad', '1ano', '1º Ano – Básico / Ciências Fundamentais', 'Foco: Anatomia, bioquímica, fisiologia e introdução à saúde.'),
('Biologia Molecular', 'grad', '1ano', '1º Ano – Básico / Ciências Fundamentais', 'Foco: Anatomia, bioquímica, fisiologia e introdução à saúde.'),
('Genética', 'grad', '1ano', '1º Ano – Básico / Ciências Fundamentais', 'Foco: Anatomia, bioquímica, fisiologia e introdução à saúde.'),
('Fisiologia Geral', 'grad', '1ano', '1º Ano – Básico / Ciências Fundamentais', 'Foco: Anatomia, bioquímica, fisiologia e introdução à saúde.'),
('Biofísica', 'grad', '1ano', '1º Ano – Básico / Ciências Fundamentais', 'Foco: Anatomia, bioquímica, fisiologia e introdução à saúde.'),
('Psicologia Médica', 'grad', '1ano', '1º Ano – Básico / Ciências Fundamentais', 'Foco: Anatomia, bioquímica, fisiologia e introdução à saúde.'),
('Sociologia / Antropologia da Saúde', 'grad', '1ano', '1º Ano – Básico / Ciências Fundamentais', 'Foco: Anatomia, bioquímica, fisiologia e introdução à saúde.'),
('Introdução à Medicina / Ética Médica', 'grad', '1ano', '1º Ano – Básico / Ciências Fundamentais', 'Foco: Anatomia, bioquímica, fisiologia e introdução à saúde.'),
('Comunicação em Saúde', 'grad', '1ano', '1º Ano – Básico / Ciências Fundamentais', 'Foco: Anatomia, bioquímica, fisiologia e introdução à saúde.')
ON CONFLICT (group_type, group_key, name) DO NOTHING;

-- 2º Ano – Básico / Ciências Biomédicas
INSERT INTO public.subject_catalog (name, group_type, group_key, group_label, description) VALUES
('Fisiologia dos Sistemas (Cardiovascular, Respiratório, Renal, Digestivo, Endócrino, Nervoso)', 'grad', '2ano', '2º Ano – Básico / Ciências Biomédicas', 'Foco: Fisiologia avançada, farmacologia e patologia básica.'),
('Farmacologia Geral', 'grad', '2ano', '2º Ano – Básico / Ciências Biomédicas', 'Foco: Fisiologia avançada, farmacologia e patologia básica.'),
('Patologia Geral', 'grad', '2ano', '2º Ano – Básico / Ciências Biomédicas', 'Foco: Fisiologia avançada, farmacologia e patologia básica.'),
('Microbiologia', 'grad', '2ano', '2º Ano – Básico / Ciências Biomédicas', 'Foco: Fisiologia avançada, farmacologia e patologia básica.'),
('Imunologia', 'grad', '2ano', '2º Ano – Básico / Ciências Biomédicas', 'Foco: Fisiologia avançada, farmacologia e patologia básica.'),
('Parasitologia', 'grad', '2ano', '2º Ano – Básico / Ciências Biomédicas', 'Foco: Fisiologia avançada, farmacologia e patologia básica.'),
('Semiologia (introdução ao exame clínico)', 'grad', '2ano', '2º Ano – Básico / Ciências Biomédicas', 'Foco: Fisiologia avançada, farmacologia e patologia básica.'),
('Epidemiologia', 'grad', '2ano', '2º Ano – Básico / Ciências Biomédicas', 'Foco: Fisiologia avançada, farmacologia e patologia básica.'),
('Ética Médica e Bioética', 'grad', '2ano', '2º Ano – Básico / Ciências Biomédicas', 'Foco: Fisiologia avançada, farmacologia e patologia básica.'),
('Saúde Pública e Políticas de Saúde', 'grad', '2ano', '2º Ano – Básico / Ciências Biomédicas', 'Foco: Fisiologia avançada, farmacologia e patologia básica.')
ON CONFLICT (group_type, group_key, name) DO NOTHING;

-- 3º Ano – Clínica / Início da Prática Médica
INSERT INTO public.subject_catalog (name, group_type, group_key, group_label, description) VALUES
('Clínica Médica I (Cardiologia, Pneumologia)', 'grad', '3ano', '3º Ano – Clínica / Início da Prática Médica', 'Foco: Clínica médica, contato com pacientes, internato inicial.'),
('Pediatria I', 'grad', '3ano', '3º Ano – Clínica / Início da Prática Médica', 'Foco: Clínica médica, contato com pacientes, internato inicial.'),
('Cirurgia Geral I', 'grad', '3ano', '3º Ano – Clínica / Início da Prática Médica', 'Foco: Clínica médica, contato com pacientes, internato inicial.'),
('Ginecologia e Obstetrícia I', 'grad', '3ano', '3º Ano – Clínica / Início da Prática Médica', 'Foco: Clínica médica, contato com pacientes, internato inicial.'),
('Neurologia I', 'grad', '3ano', '3º Ano – Clínica / Início da Prática Médica', 'Foco: Clínica médica, contato com pacientes, internato inicial.'),
('Psiquiatria I', 'grad', '3ano', '3º Ano – Clínica / Início da Prática Médica', 'Foco: Clínica médica, contato com pacientes, internato inicial.'),
('Semiologia Avançada', 'grad', '3ano', '3º Ano – Clínica / Início da Prática Médica', 'Foco: Clínica médica, contato com pacientes, internato inicial.'),
('Diagnóstico por Imagem I (Radiologia básica)', 'grad', '3ano', '3º Ano – Clínica / Início da Prática Médica', 'Foco: Clínica médica, contato com pacientes, internato inicial.'),
('Farmacologia aplicada', 'grad', '3ano', '3º Ano – Clínica / Início da Prática Médica', 'Foco: Clínica médica, contato com pacientes, internato inicial.'),
('Patologia Sistemática', 'grad', '3ano', '3º Ano – Clínica / Início da Prática Médica', 'Foco: Clínica médica, contato com pacientes, internato inicial.')
ON CONFLICT (group_type, group_key, name) DO NOTHING;

-- 4º Ano – Clínica Avançada / Especialidades
INSERT INTO public.subject_catalog (name, group_type, group_key, group_label, description) VALUES
('Clínica Médica II (Gastroenterologia, Nefrologia, Endocrinologia)', 'grad', '4ano', '4º Ano – Clínica Avançada / Especialidades', 'Foco: Estágios clínicos supervisionados e especialidades médicas.'),
('Cirurgia II (Traumatologia, Urologia)', 'grad', '4ano', '4º Ano – Clínica Avançada / Especialidades', 'Foco: Estágios clínicos supervisionados e especialidades médicas.'),
('Pediatria II', 'grad', '4ano', '4º Ano – Clínica Avançada / Especialidades', 'Foco: Estágios clínicos supervisionados e especialidades médicas.'),
('Ginecologia e Obstetrícia II', 'grad', '4ano', '4º Ano – Clínica Avançada / Especialidades', 'Foco: Estágios clínicos supervisionados e especialidades médicas.'),
('Neurologia II', 'grad', '4ano', '4º Ano – Clínica Avançada / Especialidades', 'Foco: Estágios clínicos supervisionados e especialidades médicas.'),
('Psiquiatria II', 'grad', '4ano', '4º Ano – Clínica Avançada / Especialidades', 'Foco: Estágios clínicos supervisionados e especialidades médicas.'),
('Infectologia', 'grad', '4ano', '4º Ano – Clínica Avançada / Especialidades', 'Foco: Estágios clínicos supervisionados e especialidades médicas.'),
('Dermatologia', 'grad', '4ano', '4º Ano – Clínica Avançada / Especialidades', 'Foco: Estágios clínicos supervisionados e especialidades médicas.'),
('Oftalmologia', 'grad', '4ano', '4º Ano – Clínica Avançada / Especialidades', 'Foco: Estágios clínicos supervisionados e especialidades médicas.'),
('Otorrinolaringologia', 'grad', '4ano', '4º Ano – Clínica Avançada / Especialidades', 'Foco: Estágios clínicos supervisionados e especialidades médicas.'),
('Medicina Preventiva e Social', 'grad', '4ano', '4º Ano – Clínica Avançada / Especialidades', 'Foco: Estágios clínicos supervisionados e especialidades médicas.'),
('Urgência e Emergência', 'grad', '4ano', '4º Ano – Clínica Avançada / Especialidades', 'Foco: Estágios clínicos supervisionados e especialidades médicas.')
ON CONFLICT (group_type, group_key, name) DO NOTHING;

-- 5º Ano – Internato Hospitalar
INSERT INTO public.subject_catalog (name, group_type, group_key, group_label, description) VALUES
('Clínica Médica III (Prática hospitalar)', 'grad', '5ano', '5º Ano – Internato Hospitalar', 'Foco: Estágios intensivos em hospitais, atendimento de pacientes reais.'),
('Cirurgia III (Prática hospitalar)', 'grad', '5ano', '5º Ano – Internato Hospitalar', 'Foco: Estágios intensivos em hospitais, atendimento de pacientes reais.'),
('Pediatria III (Internato pediátrico)', 'grad', '5ano', '5º Ano – Internato Hospitalar', 'Foco: Estágios intensivos em hospitais, atendimento de pacientes reais.'),
('Ginecologia e Obstetrícia III', 'grad', '5ano', '5º Ano – Internato Hospitalar', 'Foco: Estágios intensivos em hospitais, atendimento de pacientes reais.'),
('Medicina de Família e Comunidade', 'grad', '5ano', '5º Ano – Internato Hospitalar', 'Foco: Estágios intensivos em hospitais, atendimento de pacientes reais.'),
('Psiquiatria Clínica', 'grad', '5ano', '5º Ano – Internato Hospitalar', 'Foco: Estágios intensivos em hospitais, atendimento de pacientes reais.'),
('Emergências Médicas', 'grad', '5ano', '5º Ano – Internato Hospitalar', 'Foco: Estágios intensivos em hospitais, atendimento de pacientes reais.'),
('Anestesiologia', 'grad', '5ano', '5º Ano – Internato Hospitalar', 'Foco: Estágios intensivos em hospitais, atendimento de pacientes reais.'),
('Radiologia e Diagnóstico por Imagem avançado', 'grad', '5ano', '5º Ano – Internato Hospitalar', 'Foco: Estágios intensivos em hospitais, atendimento de pacientes reais.'),
('Terapia Intensiva', 'grad', '5ano', '5º Ano – Internato Hospitalar', 'Foco: Estágios intensivos em hospitais, atendimento de pacientes reais.')
ON CONFLICT (group_type, group_key, name) DO NOTHING;

-- 6º Ano – Internato Final / Preparação para Residência
INSERT INTO public.subject_catalog (name, group_type, group_key, group_label, description) VALUES
('Clínica Médica IV (Prática avançada)', 'grad', '6ano', '6º Ano – Internato Final / Preparação para Residência', 'Foco: Rotação por todas as especialidades, prática independente supervisionada.'),
('Cirurgia IV (Prática avançada)', 'grad', '6ano', '6º Ano – Internato Final / Preparação para Residência', 'Foco: Rotação por todas as especialidades, prática independente supervisionada.'),
('Pediatria IV', 'grad', '6ano', '6º Ano – Internato Final / Preparação para Residência', 'Foco: Rotação por todas as especialidades, prática independente supervisionada.'),
('Ginecologia e Obstetrícia IV', 'grad', '6ano', '6º Ano – Internato Final / Preparação para Residência', 'Foco: Rotação por todas as especialidades, prática independente supervisionada.'),
('Emergência e UTI', 'grad', '6ano', '6º Ano – Internato Final / Preparação para Residência', 'Foco: Rotação por todas as especialidades, prática independente supervisionada.'),
('Medicina do Trabalho', 'grad', '6ano', '6º Ano – Internato Final / Preparação para Residência', 'Foco: Rotação por todas as especialidades, prática independente supervisionada.'),
('Saúde Coletiva', 'grad', '6ano', '6º Ano – Internato Final / Preparação para Residência', 'Foco: Rotação por todas as especialidades, prática independente supervisionada.'),
('Ética, Bioética e Legislação Médica', 'grad', '6ano', '6º Ano – Internato Final / Preparação para Residência', 'Foco: Rotação por todas as especialidades, prática independente supervisionada.'),
('Revisão para Exames (Residência / CRM)', 'grad', '6ano', '6º Ano – Internato Final / Preparação para Residência', 'Foco: Rotação por todas as especialidades, prática independente supervisionada.'),
('Estágio em áreas optativas (Cardiologia, Endocrinologia, Oncologia, etc.)', 'grad', '6ano', '6º Ano – Internato Final / Preparação para Residência', 'Foco: Rotação por todas as especialidades, prática independente supervisionada.')
ON CONFLICT (group_type, group_key, name) DO NOTHING;

-- =============================================================================
-- SEED: RESIDÊNCIA
-- =============================================================================

-- 1. Clínica Médica
INSERT INTO public.subject_catalog (name, group_type, group_key, group_label, description) VALUES
('Cardiologia: insuficiência cardíaca, hipertensão, arritmias, infarto', 'resid', 'resid_clinica_medica', 'Residência: Clínica Médica', 'Foco: Adultos, doenças mais comuns, urgências e crônicas.'),
('Pneumologia: asma, DPOC, pneumonia, tuberculose', 'resid', 'resid_clinica_medica', 'Residência: Clínica Médica', 'Foco: Adultos, doenças mais comuns, urgências e crônicas.'),
('Gastroenterologia: hepatites, cirrose, úlcera, doenças inflamatórias intestinais', 'resid', 'resid_clinica_medica', 'Residência: Clínica Médica', 'Foco: Adultos, doenças mais comuns, urgências e crônicas.'),
('Endocrinologia: diabetes, doenças da tireoide, obesity', 'resid', 'resid_clinica_medica', 'Residência: Clínica Médica', 'Foco: Adultos, doenças mais comuns, urgências e crônicas.'),
('Nefrologia: insuficiência renal, glomerulopatias', 'resid', 'resid_clinica_medica', 'Residência: Clínica Médica', 'Foco: Adultos, doenças mais comuns, urgências e crônicas.'),
('Infectologia: HIV, infecções bacterianas, fúngicas e parasitárias', 'resid', 'resid_clinica_medica', 'Residência: Clínica Médica', 'Foco: Adultos, doenças mais comuns, urgências e crônicas.'),
('Reumatologia: artrite, lúpus, vasculites', 'resid', 'resid_clinica_medica', 'Residência: Clínica Médica', 'Foco: Adultos, doenças mais comuns, urgências e crônicas.'),
('Oncologia clínica: cânceres mais comuns, quimioterapia', 'resid', 'resid_clinica_medica', 'Residência: Clínica Médica', 'Foco: Adultos, doenças mais comuns, urgências e crônicas.'),
('Medicina Intensiva / Emergências: choque, sepse, suporte vital', 'resid', 'resid_clinica_medica', 'Residência: Clínica Médica', 'Foco: Adultos, doenças mais comuns, urgências e crônicas.')
ON CONFLICT (group_type, group_key, name) DO NOTHING;

-- 2. Cirurgia Geral
INSERT INTO public.subject_catalog (name, group_type, group_key, group_label, description) VALUES
('Cirurgia abdominal: apendicite, colecistite, hérnias', 'resid', 'resid_cirurgia_geral', 'Residência: Cirurgia Geral', 'Foco: Procedimentos cirúrgicos, pré e pós-operatório.'),
('Trauma: politrauma, fraturas, hemorragias', 'resid', 'resid_cirurgia_geral', 'Residência: Cirurgia Geral', 'Foco: Procedimentos cirúrgicos, pré e pós-operatório.'),
('Cirurgia torácica, vascular, pediátrica', 'resid', 'resid_cirurgia_geral', 'Residência: Cirurgia Geral', 'Foco: Procedimentos cirúrgicos, pré e pós-operatório.'),
('Anestesiologia básica e manejo de pacientes em sala de cirurgia', 'resid', 'resid_cirurgia_geral', 'Residência: Cirurgia Geral', 'Foco: Procedimentos cirúrgicos, pré e pós-operatório.'),
('Técnicas de sutura, drenagem, laparoscopia', 'resid', 'resid_cirurgia_geral', 'Residência: Cirurgia Geral', 'Foco: Procedimentos cirúrgicos, pré e pós-operatório.')
ON CONFLICT (group_type, group_key, name) DO NOTHING;

-- 3. Pediatria
INSERT INTO public.subject_catalog (name, group_type, group_key, group_label, description) VALUES
('Crescimento e desenvolvimento infantil', 'resid', 'resid_pediatria', 'Residência: Pediatria', 'Foco: Crianças, neonatos e adolescentes.'),
('Imunizações', 'resid', 'resid_pediatria', 'Residência: Pediatria', 'Foco: Crianças, neonatos e adolescentes.'),
('Doenças infecciosas pediátricas', 'resid', 'resid_pediatria', 'Residência: Pediatria', 'Foco: Crianças, neonatos e adolescentes.'),
('Cardiologia e pneumologia infantil', 'resid', 'resid_pediatria', 'Residência: Pediatria', 'Foco: Crianças, neonatos e adolescentes.'),
('Emergências pediátricas', 'resid', 'resid_pediatria', 'Residência: Pediatria', 'Foco: Crianças, neonatos e adolescentes.'),
('Nutrição, endocrinologia e metabologia infantil', 'resid', 'resid_pediatria', 'Residência: Pediatria', 'Foco: Crianças, neonatos e adolescentes.')
ON CONFLICT (group_type, group_key, name) DO NOTHING;

-- 4. Ginecologia e Obstetrícia
INSERT INTO public.subject_catalog (name, group_type, group_key, group_label, description) VALUES
('Obstetrícia: pré-natal, parto normal e cesariana, complicações gestacionais', 'resid', 'resid_go', 'Residência: Ginecologia e Obstetrícia', 'Foco: Saúde da mulher, gestação e parto.'),
('Ginecologia: infertilidade, distúrbios menstruais, câncer ginecológico', 'resid', 'resid_go', 'Residência: Ginecologia e Obstetrícia', 'Foco: Saúde da mulher, gestação e parto.'),
('Urgências obstétricas e ginecológicas', 'resid', 'resid_go', 'Residência: Ginecologia e Obstetrícia', 'Foco: Saúde da mulher, gestação e parto.'),
('Reprodução assistida', 'resid', 'resid_go', 'Residência: Ginecologia e Obstetrícia', 'Foco: Saúde da mulher, gestação e parto.')
ON CONFLICT (group_type, group_key, name) DO NOTHING;

-- 5. Psiquiatria
INSERT INTO public.subject_catalog (name, group_type, group_key, group_label, description) VALUES
('Depressão, ansiedade, bipolaridade, esquizofrenia', 'resid', 'resid_psiquiatria', 'Residência: Psiquiatria', 'Foco: Transtornos mentais e comportamentais.'),
('Dependência química', 'resid', 'resid_psiquiatria', 'Residência: Psiquiatria', 'Foco: Transtornos mentais e comportamentais.'),
('Transtornos de personalidade', 'resid', 'resid_psiquiatria', 'Residência: Psiquiatria', 'Foco: Transtornos mentais e comportamentais.'),
('Psicofarmacologia e psicoterapia', 'resid', 'resid_psiquiatria', 'Residência: Psiquiatria', 'Foco: Transtornos mentais e comportamentais.'),
('Emergências psiquiátricas', 'resid', 'resid_psiquiatria', 'Residência: Psiquiatria', 'Foco: Transtornos mentais e comportamentais.')
ON CONFLICT (group_type, group_key, name) DO NOTHING;

-- 6. Medicina de Família e Comunidade
INSERT INTO public.subject_catalog (name, group_type, group_key, group_label, description) VALUES
('Doenças crônicas: diabetes, hipertensão, obesity', 'resid', 'resid_medicina_familia', 'Residência: Medicina de Família e Comunidade', 'Foco: Atenção primária e preventiva.'),
('Saúde da criança, do adolescente, do adulto e do idoso', 'resid', 'resid_medicina_familia', 'Residência: Medicina de Família e Comunidade', 'Foco: Atenção primária e preventiva.'),
('Estratégias de prevenção, vacinação, educação em saúde', 'resid', 'resid_medicina_familia', 'Residência: Medicina de Família e Comunidade', 'Foco: Atenção primária e preventiva.'),
('Planejamento familiar', 'resid', 'resid_medicina_familia', 'Residência: Medicina de Família e Comunidade', 'Foco: Atenção primária e preventiva.'),
('Manejo de pequenos procedimentos ambulatoriais', 'resid', 'resid_medicina_familia', 'Residência: Medicina de Família e Comunidade', 'Foco: Atenção primária e preventiva.')
ON CONFLICT (group_type, group_key, name) DO NOTHING;

-- 7. Outras Especialidades
INSERT INTO public.subject_catalog (name, group_type, group_key, group_label, description) VALUES
('Ortopedia: fraturas, luxações, cirurgia ortopédica', 'resid', 'resid_outras', 'Residência: Outras Especialidades', 'Foco: Especialidades específicas.'),
('Oftalmologia: doenças oculares, cirurgias de catarata, retina', 'resid', 'resid_outras', 'Residência: Outras Especialidades', 'Foco: Especialidades específicas.'),
('Dermatologia: doenças de pele, câncer de pele, procedimentos dermatológicos', 'resid', 'resid_outras', 'Residência: Outras Especialidades', 'Foco: Especialidades específicas.'),
('Anestesiologia: técnicas anestésicas, monitorização, UTI', 'resid', 'resid_outras', 'Residência: Outras Especialidades', 'Foco: Especialidades específicas.'),
('Cardiologia / Neurologia / Oncologia / Endocrinologia: foco avançado nas subáreas', 'resid', 'resid_outras', 'Residência: Outras Especialidades', 'Foco: Especialidades específicas.')
ON CONFLICT (group_type, group_key, name) DO NOTHING;

-- Verificar resultado
SELECT group_type, group_key, group_label, COUNT(*) as total
FROM public.subject_catalog
GROUP BY group_type, group_key, group_label
ORDER BY group_type, group_key;

-- Total de matérias
SELECT COUNT(*) as total_materias FROM public.subject_catalog;
