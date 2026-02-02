# 🚀 Configuração do Supabase - Sistema de Grade de Horários

## ⚠️ Status Atual
- **Sistema funcionando em modo LOCAL** com localStorage
- Para ativar o modo COLABORATIVO, configure o Supabase conforme instruções abaixo

## 📋 Passo a Passo para Configurar Supabase

### 1. **Acesse o Projeto Supabase**
- URL: https://lqakrpodruyamqjsgjty.supabase.co
- Faça login no Supabase Dashboard

### 2. **Execute o Script SQL**
- Vá para: **SQL Editor** no painel lateral
- Copie e cole o conteúdo do arquivo `supabase-setup.sql`
- Clique em **Run** para executar

### 3. **Verificar Configuração**
- Após executar o script, verifique se as tabelas foram criadas:
  - `disciplinas` (deve ter 16 registros)
  - `professores` (vazia inicialmente)  
  - `turmas` (vazia inicialmente)
  - `horarios` (vazia inicialmente)

### 4. **Testar Sistema**
- Recarregue a página do sistema
- Deve aparecer **"Status: Colaborativo"** em vez de "Local"
- Os dados serão sincronizados em tempo real

## 🔧 Credenciais Configuradas
```
URL: https://lqakrpodruyamqjsgjty.supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxYWtycG9kcnV5YW1xanNnanR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjk4NjYsImV4cCI6MjA2ODgwNTg2Nn0.tFjB1v6_0HZWJjEQXl_cjw-a3kbhE_iHGqFvKmKkMYc
```

## ✅ Funcionalidades Ativas (Modo Local)
- ✅ Cadastro de professores, turmas e disciplinas
- ✅ Grade interativa com drag & drop  
- ✅ Exclusão de professores corrigida
- ✅ Detecção de conflitos
- ✅ Persistência local (dados mantidos no navegador)

## 🌟 Funcionalidades Adicionais (Modo Colaborativo)
- 🔄 Sincronização em tempo real
- 👥 Acesso multiusuário
- 💾 Backup automático na nuvem
- 📱 Acesso de qualquer dispositivo

## 🐛 Resolução de Problemas

### Erro 401 (Unauthorized)
- Verificar se o projeto Supabase está ativo
- Confirmar se as políticas RLS foram aplicadas
- Executar novamente o script SQL

### Dados não aparecem
- Limpar cache do navegador
- Verificar se as tabelas têm dados
- Conferir console do navegador para erros
