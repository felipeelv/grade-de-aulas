-- Script de inicialização para o Supabase
-- Execute este script no SQL Editor do Supabase (https://lqakrpodruyamqjsgjty.supabase.co)

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
  ano_letivo VARCHAR(10) NOT NULL,
  cor VARCHAR(7) NOT NULL,
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

-- Habilitar RLS (Row Level Security)
ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Acesso público disciplinas" ON disciplinas;
DROP POLICY IF EXISTS "Acesso público professores" ON professores;
DROP POLICY IF EXISTS "Acesso público turmas" ON turmas;
DROP POLICY IF EXISTS "Acesso público horarios" ON horarios;

-- Políticas para acesso público (permitir tudo para anon e authenticated)
CREATE POLICY "Acesso público disciplinas" ON disciplinas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público professores" ON professores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público turmas" ON turmas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público horarios" ON horarios FOR ALL USING (true) WITH CHECK (true);

-- Inserir disciplinas iniciais
INSERT INTO disciplinas (nome, cor) VALUES
  ('Matemática', '#3b82f6'),
  ('Português', '#ef4444'),
  ('História', '#8b5cf6'),
  ('Geografia', '#10b981'),
  ('Ciências', '#f59e0b'),
  ('Inglês', '#06b6d4'),
  ('Educação Física', '#84cc16'),
  ('Artes', '#ec4899'),
  ('Filosofia', '#6366f1'),
  ('Sociologia', '#14b8a6'),
  ('Química', '#f97316'),
  ('Física', '#8b5cf6'),
  ('Biologia', '#22c55e'),
  ('Literatura', '#dc2626'),
  ('Redação', '#7c3aed'),
  ('Informática', '#0ea5e9')
ON CONFLICT (nome) DO NOTHING;

-- Verificar se as tabelas foram criadas
SELECT 'disciplinas' as tabela, count(*) as registros FROM disciplinas
UNION ALL
SELECT 'professores' as tabela, count(*) as registros FROM professores
UNION ALL
SELECT 'turmas' as tabela, count(*) as registros FROM turmas
UNION ALL
SELECT 'horarios' as tabela, count(*) as registros FROM horarios;
