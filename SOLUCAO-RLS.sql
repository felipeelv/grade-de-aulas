-- SOLUÇÃO DEFINITIVA - Execute no SQL Editor do Supabase
-- URL: https://lqakrpodruyamqjsgjty.supabase.co

-- ========== CORRIGIR POLÍTICAS RLS ==========

-- 1. Habilitar RLS nas tabelas
ALTER TABLE "Disciplinas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "professores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "turmas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "horários" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Disponibilidade professores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "professor disciplina" ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "acesso_publico_disciplinas" ON "Disciplinas";
DROP POLICY IF EXISTS "acesso_publico_professores" ON "professores";
DROP POLICY IF EXISTS "acesso_publico_turmas" ON "turmas";
DROP POLICY IF EXISTS "acesso_publico_horarios" ON "horários";
DROP POLICY IF EXISTS "acesso_publico_disponibilidade" ON "Disponibilidade professores";
DROP POLICY IF EXISTS "acesso_publico_professor_disciplina" ON "professor disciplina";

-- 3. Criar políticas para acesso público total
CREATE POLICY "acesso_publico_disciplinas" ON "Disciplinas"
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "acesso_publico_professores" ON "professores"
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "acesso_publico_turmas" ON "turmas"
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "acesso_publico_horarios" ON "horários"
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "acesso_publico_disponibilidade" ON "Disponibilidade professores"
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "acesso_publico_professor_disciplina" ON "professor disciplina"
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Teste final - verificar acesso
SELECT 'Disciplinas' as tabela, count(*) as registros FROM "Disciplinas"
UNION ALL
SELECT 'professores' as tabela, count(*) as registros FROM "professores"
UNION ALL
SELECT 'turmas' as tabela, count(*) as registros FROM "turmas"
UNION ALL
SELECT 'horários' as tabela, count(*) as registros FROM "horários";
