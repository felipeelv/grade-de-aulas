const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://qdjjoyxxlsufyarukame.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkampveXh4bHN1ZnlhcnVrYW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjM0MDYsImV4cCI6MjA2ODc5OTQwNn0.sOafxnG2z6J8Rn-iwhkHbvbv60tcr2u1WDweWdNMST8';

console.log('🔧 Usando credenciais:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Disciplinas iniciais
const disciplinasIniciais = [
  { nome: 'Arte', cor: '#3B82F6' },
  { nome: 'Biologia', cor: '#10B981' },
  { nome: 'Ciências', cor: '#F59E0B' },
  { nome: 'ETEC', cor: '#EF4444' },
  { nome: 'Educação Cristã', cor: '#8B5CF6' },
  { nome: 'Educação física', cor: '#F97316' },
  { nome: 'Estudos Sociais', cor: '#06B6D4' },
  { nome: 'Filosofia', cor: '#84CC16' },
  { nome: 'Física', cor: '#EC4899' },
  { nome: 'Inglês', cor: '#6366F1' },
  { nome: 'Interpretação', cor: '#14B8A6' },
  { nome: 'Matemática', cor: '#F59E0B' },
  { nome: 'Matemática 1', cor: '#EF4444' },
  { nome: 'Português', cor: '#8B5CF6' },
  { nome: 'Química', cor: '#F97316' },
  { nome: 'Redação', cor: '#06B6D4' }
];

async function initSupabase() {
  try {
    console.log('🚀 Inicializando Supabase...');
    
    // Verificar se as tabelas existem
    console.log('📋 Verificando/Criando tabelas...');
    
    // Executar SQL para criar tabelas
    const { data, error } = await supabase
      .from('disciplinas')
      .select('*')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('❌ Tabelas não existem. É necessário criar manualmente no painel do Supabase.');
      console.log('📋 Script SQL necessário:');
      console.log(`
-- Execute este script no editor SQL do Supabase:

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

-- Habilitar Row Level Security
ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso público
CREATE POLICY "Acesso público disciplinas" ON disciplinas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público professores" ON professores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público turmas" ON turmas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público horarios" ON horarios FOR ALL USING (true) WITH CHECK (true);

-- Inserir disciplinas iniciais
${disciplinasIniciais.map(d => `INSERT INTO disciplinas (nome, cor) VALUES ('${d.nome}', '${d.cor}');`).join('\n')}
      `);
      return false;
    }
    
    if (error) {
      console.error('❌ Erro ao verificar tabelas:', error);
      return false;
    }
    
    console.log('✅ Tabelas verificadas com sucesso!');
    
    // Verificar se há disciplinas
    const { data: disciplinas, error: erroDisciplinas } = await supabase
      .from('disciplinas')
      .select('*');
    
    if (erroDisciplinas) {
      console.error('❌ Erro ao buscar disciplinas:', erroDisciplinas);
      return false;
    }
    
    console.log(`📚 ${disciplinas.length} disciplinas encontradas`);
    
    // Inserir disciplinas se não existirem
    if (disciplinas.length === 0) {
      console.log('📚 Inserindo disciplinas iniciais...');
      const { error: erroInsercao } = await supabase
        .from('disciplinas')
        .insert(disciplinasIniciais);
      
      if (erroInsercao) {
        console.error('❌ Erro ao inserir disciplinas:', erroInsercao);
        return false;
      }
      
      console.log('✅ Disciplinas inseridas com sucesso!');
    }
    
    console.log('🎉 Supabase inicializado com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
    return false;
  }
}

// Executar
initSupabase().then(success => {
  if (success) {
    console.log('✅ Inicialização concluída!');
  } else {
    console.log('❌ Falha na inicialização');
  }
  process.exit(success ? 0 : 1);
});
