-- Script para verificar os nomes exatos das tabelas
-- Execute no SQL Editor do Supabase para confirmar estrutura

-- Listar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar estrutura das tabelas principais
\d "Disciplinas"
\d "disciplinas"
\d "Disponibilidade professores"
\d "disponibilidade_professores"
\d "horários"
\d "horarios"
\d "professor disciplina"
\d "professor_disciplina"
\d "professores"
\d "turmas"

-- Contar registros em cada tabela (testar acesso)
SELECT 'Disciplinas' as tabela, count(*) as registros FROM "Disciplinas"
UNION ALL
SELECT 'disciplinas' as tabela, count(*) as registros FROM "disciplinas"
UNION ALL
SELECT 'professores' as tabela, count(*) as registros FROM "professores"
UNION ALL
SELECT 'turmas' as tabela, count(*) as registros FROM "turmas"
UNION ALL
SELECT 'horários' as tabela, count(*) as registros FROM "horários"
UNION ALL
SELECT 'Disponibilidade professores' as tabela, count(*) as registros FROM "Disponibilidade professores";
