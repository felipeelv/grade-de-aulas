-- Script SQL para inicializar o banco de dados Supabase
-- Execute este script no editor SQL do Supabase

-- Criação das tabelas para o sistema de grade de horários colaborativo

-- Tabela de disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cor VARCHAR(7) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de professores
CREATE TABLE IF NOT EXISTS professores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    disciplina_ids JSONB NOT NULL DEFAULT '[]',
    disponibilidade JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de turmas
CREATE TABLE IF NOT EXISTS turmas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    segmento VARCHAR(50) NOT NULL,
    ano VARCHAR(10) NOT NULL,
    turma VARCHAR(2) NOT NULL,
    periodo VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de horários
CREATE TABLE IF NOT EXISTS horarios (
    id SERIAL PRIMARY KEY,
    disciplina_id INTEGER NOT NULL,
    professor_id INTEGER NOT NULL,
    turma_id INTEGER NOT NULL,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 5),
    aula INTEGER NOT NULL CHECK (aula >= 1 AND aula <= 6),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_disciplinas_updated_at ON disciplinas;
CREATE TRIGGER update_disciplinas_updated_at 
    BEFORE UPDATE ON disciplinas 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_professores_updated_at ON professores;
CREATE TRIGGER update_professores_updated_at 
    BEFORE UPDATE ON professores 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_turmas_updated_at ON turmas;
CREATE TRIGGER update_turmas_updated_at 
    BEFORE UPDATE ON turmas 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_horarios_updated_at ON horarios;
CREATE TRIGGER update_horarios_updated_at 
    BEFORE UPDATE ON horarios 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso público (todos podem ler e escrever)
DROP POLICY IF EXISTS "Acesso público disciplinas" ON disciplinas;
CREATE POLICY "Acesso público disciplinas" ON disciplinas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso público professores" ON professores;
CREATE POLICY "Acesso público professores" ON professores FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso público turmas" ON turmas;
CREATE POLICY "Acesso público turmas" ON turmas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso público horarios" ON horarios;
CREATE POLICY "Acesso público horarios" ON horarios FOR ALL USING (true) WITH CHECK (true);

-- Inserir dados iniciais das disciplinas
INSERT INTO disciplinas (nome, cor) VALUES
('Arte', '#3B82F6'),
('Biologia', '#10B981'),
('Ciências', '#F59E0B'),
('ETEC', '#EF4444'),
('Educação Cristã', '#8B5CF6'),
('Educação física', '#F97316'),
('Estudos Sociais', '#06B6D4'),
('Filosofia', '#84CC16'),
('Física', '#EC4899'),
('Inglês', '#6366F1'),
('Interpretação', '#14B8A6'),
('Matemática', '#F59E0B'),
('Matemática 1', '#EF4444'),
('Português', '#8B5CF6'),
('Química', '#F97316'),
('Redação', '#06B6D4')
ON CONFLICT DO NOTHING;

-- Verificar se as tabelas foram criadas corretamente
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('disciplinas', 'professores', 'turmas', 'horarios');

-- Verificar se as disciplinas foram inseridas
SELECT COUNT(*) as total_disciplinas FROM disciplinas;