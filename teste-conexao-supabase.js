// TESTE DE CONEXÃO SIMPLES COM SUPABASE
// Execute este arquivo para testar se o RLS está funcionando

import { createClient } from '@supabase/supabase-js';

// Substitua pelas suas credenciais do Supabase
const SUPABASE_URL = 'SUA_URL_AQUI';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_AQUI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testarConexao() {
  console.log('🔄 Testando conexão com Supabase...');
  
  try {
    // Teste 1: Verificar tabelas
    console.log('\n📋 Testando acesso às tabelas...');
    
    const tabelasParaTestar = [
      'disciplinas',
      'disponibilidade_professores', 
      'horarios',
      'professor_disciplinas',
      'professores',
      'turmas'
    ];
    
    for (const tabela of tabelasParaTestar) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('count(*)')
          .limit(1);
          
        if (error) {
          console.log(`❌ Erro na tabela ${tabela}:`, error.message);
        } else {
          console.log(`✅ Tabela ${tabela}: Acesso OK`);
        }
      } catch (e) {
        console.log(`❌ Erro na tabela ${tabela}:`, e.message);
      }
    }
    
    // Teste 2: Inserir uma disciplina de teste
    console.log('\n📝 Testando inserção de dados...');
    
    const { data: disciplinaTeste, error: erroInsercao } = await supabase
      .from('disciplinas')
      .insert([{
        nome: 'Teste Conexão',
        cor: '#FF0000'
      }])
      .select()
      .single();
      
    if (erroInsercao) {
      console.log('❌ Erro ao inserir:', erroInsercao.message);
    } else {
      console.log('✅ Inserção OK:', disciplinaTeste);
      
      // Remover o teste
      await supabase
        .from('disciplinas')
        .delete()
        .eq('id', disciplinaTeste.id);
        
      console.log('✅ Remoção OK: Dados de teste limpos');
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('Se você viu ✅ em todos os itens, sua configuração está correta!');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

testarConexao();
