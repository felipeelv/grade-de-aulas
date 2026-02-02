# 🚀 Instruções de Deploy - Sistema Colaborativo

## 📋 Pré-requisitos

### 1. Projeto Supabase Configurado
- ✅ Projeto ID: `qdhjoyxxlsufyarukame`
- ✅ URL: `https://qdhjoyxxlsufyarukame.supabase.co`
- ✅ Chave Anon configurada

### 2. Banco de Dados Inicializado
Execute o script SQL no painel do Supabase:
```sql
-- Copie o conteúdo de src/utils/inicializarSupabase.sql
-- e execute no editor SQL do Supabase
```

## 🛠️ Deploy

### 1. Build do Projeto
```bash
cd sistema-grade-horarios
npm run build
```

### 2. Deploy Automático
O sistema está configurado para deploy automático com as variáveis de ambiente corretas.

### 3. Verificação
Após o deploy:
1. ✅ Verificar se carrega sem erros
2. ✅ Testar status de conexão (deve mostrar "Colaborativo")
3. ✅ Adicionar um professor de teste
4. ✅ Abrir em outra aba e verificar sincronização

## 🔍 Troubleshooting

### Problema: Conexão "Local" ao invés de "Colaborativo"
**Solução:**
1. Verificar variáveis de ambiente no `.env.local`
2. Confirmar que as tabelas existem no Supabase
3. Verificar políticas RLS estão configuradas

### Problema: Erro ao carregar dados
**Solução:**
1. Executar script SQL de inicialização
2. Verificar logs do console do navegador
3. Confirmar permissões das tabelas

### Problema: Sincronização não funciona
**Solução:**
1. Verificar se Real-time está habilitado no Supabase
2. Confirmar que as políticas permitem acesso
3. Testar conexão de rede

## 📊 Monitoramento

### Indicadores de Status
- 🟢 **Colaborativo**: Sistema funcionando perfeitamente
- 🟡 **Local**: Fallback ativo, verificar conexão
- 🔄 **Carregando**: Inicializando, aguarde

### Logs Importantes
```javascript
// Console do navegador deve mostrar:
"✅ Conexão com Supabase estabelecida com sucesso"
"✅ Sistema colaborativo inicializado"
"📡 Configurando sincronização em tempo real..."
```

## 🎯 Testes de Aceitação

### Teste 1: Colaboração Básica
1. Abrir sistema em duas abas
2. Adicionar professor na aba 1
3. Verificar aparição na aba 2
4. ✅ Sucesso: Sincronização funcionando

### Teste 2: Exclusão de Professores
1. Clicar no botão de exclusão (lixeira)
2. Confirmar no modal
3. Verificar remoção em todas as abas
4. ✅ Sucesso: Modal e exclusão funcionando

### Teste 3: Lixeira Drag & Drop
1. Ir para seção Horários
2. Ativar modo edição
3. Arrastar horário para lixeira
4. Confirmar remoção
5. ✅ Sucesso: Drag & drop funcionando

### Teste 4: Responsividade
1. Testar em desktop (1920x1080)
2. Testar em tablet (768px)
3. Testar em mobile (375px)
4. ✅ Sucesso: Interface adaptada

## 📈 Métricas de Sucesso

- ✅ **Performance**: Carregamento < 3 segundos
- ✅ **Sincronização**: Mudanças aparecem < 1 segundo
- ✅ **Responsividade**: Funciona em todos os dispositivos
- ✅ **Estabilidade**: Sem erros no console
- ✅ **Usabilidade**: Todas as funcionalidades funcionais

## 🔐 Segurança

### Configuração Atual
- **RLS Habilitado**: ✅ Todas as tabelas
- **Políticas Públicas**: ✅ Para demonstração
- **HTTPS**: ✅ Supabase fornece automaticamente

### Para Produção
```sql
-- Substituir políticas públicas por:
CREATE POLICY "authenticated_access" ON tabela 
FOR ALL USING (auth.role() = 'authenticated');
```

---

**Sistema pronto para demonstração e uso colaborativo! 🎉**