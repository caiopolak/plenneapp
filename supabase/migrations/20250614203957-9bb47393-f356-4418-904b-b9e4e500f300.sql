
-- 1. Tabela de categorias customizadas
CREATE TABLE IF NOT EXISTS public.transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  workspace_id UUID REFERENCES workspaces(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Políticas RLS: Somente o usuário pode ver/alterar suas categorias
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver categorias próprias" ON public.transaction_categories
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuários podem criar categorias próprias" ON public.transaction_categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar categorias próprias" ON public.transaction_categories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar categorias próprias" ON public.transaction_categories
  FOR DELETE USING (user_id = auth.uid());

-- 2. Campos de recorrência avançada em transações
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT NULL, -- ex: 'monthly', 'weekly', 'custom', etc.
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE NULL;

-- 3. Já existe a tabela data_imports para registrar importações em lote (aproveitaremos essa)

