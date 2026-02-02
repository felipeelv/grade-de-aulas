import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase usando variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://looikgdqsmhecgoeqhhx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvb2lrZ2Rxc21oZWNnb2VxaGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzUyODYsImV4cCI6MjA4NTYxMTI4Nn0._Liv4bdN0t8pyV52Feyk75ehDO9E3lB_9-zHb8psSPs';

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