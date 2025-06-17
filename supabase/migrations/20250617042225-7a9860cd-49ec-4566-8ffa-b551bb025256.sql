
-- ========================================
-- CORRIGINDO POLÍTICAS RLS (sem IF NOT EXISTS)
-- ========================================

-- FINANCIAL_GOALS - Primeiro remover políticas existentes e recriar
DROP POLICY IF EXISTS "Users can view own goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.financial_goals;

-- Habilitar RLS se não estiver
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- Criar políticas para financial_goals
CREATE POLICY "Users can view own goals" ON public.financial_goals
  FOR SELECT USING (
    user_id = auth.uid() OR 
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert own goals" ON public.financial_goals
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    (workspace_id IS NULL OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'active'
    ))
  );

CREATE POLICY "Users can update own goals" ON public.financial_goals
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete own goals" ON public.financial_goals
  FOR DELETE USING (
    user_id = auth.uid() OR 
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- INVESTMENTS - Remover políticas existentes e recriar
DROP POLICY IF EXISTS "Users can view own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can insert own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can update own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can delete own investments" ON public.investments;

-- Habilitar RLS se não estiver
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Criar políticas para investments
CREATE POLICY "Users can view own investments" ON public.investments
  FOR SELECT USING (
    user_id = auth.uid() OR 
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert own investments" ON public.investments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    (workspace_id IS NULL OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'active'
    ))
  );

CREATE POLICY "Users can update own investments" ON public.investments
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can delete own investments" ON public.investments
  FOR DELETE USING (
    user_id = auth.uid() OR 
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
