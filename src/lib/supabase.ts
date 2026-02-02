import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase usando variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hvtzrwnlotornlgdxlpe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_UQIfyw-J7GcvFiCX8wIT8g_8mz9lGHf';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configuração do Supabase não encontrada nas variáveis de ambiente');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Verificar conexão
export const verificarConexao = async () => {
  try {
    const { data, error } = await supabase.from('disciplinas').select('count(*)');
    if (error) {
      console.error('Erro na conexão com Supabase:', error);
      return false;
    }
    console.log('✅ Conexão com Supabase estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Falha na conexão com Supabase:', error);
    return false;
  }
};