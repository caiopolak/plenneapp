# 🤖 Automação de Transações - Guia de Configuração

## 📋 O Que Foi Implementado

### ✅ Edge Function: `process-scheduled-transactions`

Esta função processa automaticamente:

1. **Transações Recorrentes** (weekly/monthly/yearly)
   - Cria novas ocorrências baseadas no padrão configurado
   - Respeita a data final se configurada
   - Atualiza a data da transação template

2. **Transações Agendadas** (incoming_transactions)
   - Converte transações pendentes quando a data chega
   - Auto-confirma e cria a transação real
   - Atualiza status para 'confirmed'

## 🚀 Configuração do Cron Job

Para ativar a automação, você precisa configurar um cron job no Supabase.

### Passo 1: Acessar o SQL Editor

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard/project/kmejplnwnajjaxsqzmwz)
2. Clique em "SQL Editor" no menu lateral

### Passo 2: Executar o SQL de Configuração

Cole e execute o seguinte SQL:

```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar o cron job para processar transações (executa diariamente às 00:05)
SELECT cron.schedule(
  'process-scheduled-transactions-daily',
  '5 0 * * *', -- Todo dia às 00:05 (5 minutos após meia-noite)
  $$
  SELECT
    net.http_post(
        url:='https://kmejplnwnajjaxsqzmwz.supabase.co/functions/v1/process-scheduled-transactions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZWpwbG53bmFqamF4c3F6bXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NjY4MjEsImV4cCI6MjA2NTQ0MjgyMX0.5e03IisJueMCZZBPDlRNkBntrVj3AeSfG4o2Gl6-Aow"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

### Passo 3: Verificar o Cron Job

Para verificar se o cron job foi criado:

```sql
SELECT * FROM cron.job;
```

Você deve ver o job `process-scheduled-transactions-daily` listado.

## 🧪 Testar Manualmente

Você pode testar a função manualmente antes de esperar o cron:

### Opção 1: Via Dashboard Supabase
1. Vá em "Edge Functions" → "process-scheduled-transactions"
2. Clique em "Invoke function"
3. Use `{}` como body
4. Clique em "Send request"

### Opção 2: Via SQL
```sql
SELECT
  net.http_post(
      url:='https://kmejplnwnajjaxsqzmwz.supabase.co/functions/v1/process-scheduled-transactions',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZWpwbG53bmFqamF4c3F6bXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NjY4MjEsImV4cCI6MjA2NTQ0MjgyMX0.5e03IisJueMCZZBPDlRNkBntrVj3AeSfG4o2Gl6-Aow"}'::jsonb,
      body:='{}'::jsonb
  ) as request_id;
```

## 📊 Monitoramento

### Ver Logs da Edge Function
1. Acesse "Edge Functions" → "process-scheduled-transactions"
2. Clique na aba "Logs"
3. Você verá registros de cada execução

### Ver Histórico do Cron
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process-scheduled-transactions-daily')
ORDER BY start_time DESC 
LIMIT 10;
```

## 🔧 Ajustar Frequência

### Executar a cada hora (em vez de diariamente)
```sql
SELECT cron.unschedule('process-scheduled-transactions-daily');

SELECT cron.schedule(
  'process-scheduled-transactions-hourly',
  '0 * * * *', -- Todo início de hora
  $$ /* mesmo código */ $$
);
```

### Executar 2x por dia (manhã e tarde)
```sql
SELECT cron.unschedule('process-scheduled-transactions-daily');

SELECT cron.schedule(
  'process-scheduled-transactions-twice-daily',
  '0 6,18 * * *', -- Às 6h e 18h
  $$ /* mesmo código */ $$
);
```

## 🗑️ Desabilitar/Remover Cron Job

### Desabilitar temporariamente
```sql
SELECT cron.unschedule('process-scheduled-transactions-daily');
```

### Reativar
Execute novamente o SQL do Passo 2.

## ✅ Checklist de Verificação

- [ ] Edge function `process-scheduled-transactions` está deployada
- [ ] Extensões `pg_cron` e `pg_net` habilitadas no Supabase
- [ ] Cron job criado e aparece em `SELECT * FROM cron.job`
- [ ] Teste manual executado com sucesso
- [ ] Logs da edge function acessíveis

## 🎯 Resultados Esperados

Após configurar, o sistema irá:

1. ✅ **Todo dia às 00:05:**
   - Processar transações recorrentes pendentes
   - Auto-confirmar transações agendadas que chegaram na data
   
2. ✅ **Sem intervenção manual:**
   - Salário mensal criado automaticamente
   - Contas recorrentes lançadas no dia certo
   - Transações agendadas confirmadas automaticamente

3. ✅ **Visibilidade total:**
   - Logs detalhados de cada execução
   - Contadores de sucesso/erro
   - Histórico completo no Supabase

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs da edge function
2. Confira se o cron job está ativo
3. Teste manualmente a função
4. Verifique se as extensões estão habilitadas

---

**Última atualização:** ${new Date().toISOString().split('T')[0]}
