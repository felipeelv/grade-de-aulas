import { supabase } from '../lib/supabase';
import { disciplinas as disciplinasIniciais } from '../data/mockData';

// Script para inicializar as tabelas do Supabase
export const initSupabase = async () => {
  try {
    console.log('🚀 Inicializando tabelas do Supabase...');
    
    // Verificar se as tabelas existem e têm dados
    const { data: disciplinasExistentes, error: erroDisciplinas } = await supabase
      .from('disciplinas')
      .select('count(*)')
      .single();
      
    if (erroDisciplinas) {
      console.log('📋 Criando tabelas...');
      
      // Criar tabelas (caso não existam)
      const sql = `
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
        
        -- Habilitar RLS
        ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
        ALTER TABLE professores ENABLE ROW LEVEL SECURITY;
        ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
        ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;
        
        -- Políticas para acesso público
        CREATE POLICY IF NOT EXISTS "Acesso público disciplinas" ON disciplinas FOR ALL USING (true) WITH CHECK (true);
        CREATE POLICY IF NOT EXISTS "Acesso público professores" ON professores FOR ALL USING (true) WITH CHECK (true);
        CREATE POLICY IF NOT EXISTS "Acesso público turmas" ON turmas FOR ALL USING (true) WITH CHECK (true);
        CREATE POLICY IF NOT EXISTS "Acesso público horarios" ON horarios FOR ALL USING (true) WITH CHECK (true);
      `;
      
      // Executar SQL
      const { error: erroSQL } = await supabase.rpc('exec_sql', { sql });
      
      if (erroSQL) {
        console.error('❌ Erro ao criar tabelas:', erroSQL);
        throw erroSQL;
      }
      
      console.log('✅ Tabelas criadas com sucesso!');
    }
    
    // Inserir disciplinas iniciais se não existirem
    const { data: countDisciplinas } = await supabase
      .from('disciplinas')
      .select('count(*)', { count: 'exact' });
      
    if (!countDisciplinas || countDisciplinas.length === 0) {
      console.log('📚 Inserindo disciplinas iniciais...');
      
      const { error: erroInsercao } = await supabase
        .from('disciplinas')
        .insert(disciplinasIniciais.map(d => ({
          nome: d.nome,
          cor: d.cor
        })));
        
      if (erroInsercao) {
        console.error('❌ Erro ao inserir disciplinas:', erroInsercao);
      } else {
        console.log('✅ Disciplinas inseridas com sucesso!');
      }
    }
    
    console.log('🎉 Inicialização do Supabase concluída!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro na inicialização do Supabase:', error);
    return false;
  }
};