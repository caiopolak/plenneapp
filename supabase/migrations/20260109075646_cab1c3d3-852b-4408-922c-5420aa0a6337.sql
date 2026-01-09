-- Corrigir RLS de financial_goals para garantir que usuários só vejam suas próprias metas

-- Remover política permissiva
DROP POLICY IF EXISTS "financial_goals_allow_read_auth" ON public.financial_goals;

-- Criar política correta para SELECT
CREATE POLICY "Users can view their own goals"
ON public.financial_goals
FOR SELECT
USING (auth.uid() = user_id);

-- Garantir políticas para outras operações
DROP POLICY IF EXISTS "Users can insert their own goals" ON public.financial_goals;
CREATE POLICY "Users can insert their own goals"
ON public.financial_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own goals" ON public.financial_goals;
CREATE POLICY "Users can update their own goals"
ON public.financial_goals
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own goals" ON public.financial_goals;
CREATE POLICY "Users can delete their own goals"
ON public.financial_goals
FOR DELETE
USING (auth.uid() = user_id);