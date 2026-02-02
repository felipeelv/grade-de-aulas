import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase usando variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lqakrpodruyamqjsgjty.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxYWtycG9kcnV5YW1xanNnanR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjk4NjYsImV4cCI6MjA2ODgwNTg2Nn0.tFjB1v6_0HZWJjEQXl_cjw-a3kbhE_iHGqFvKmKkMYc';

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