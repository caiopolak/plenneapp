-- Etapa 1: Corrigir RLS da tabela investments
-- Remove a policy permissiva que permite acesso total

DROP POLICY IF EXISTS "investments_allow_all" ON public.investments;

-- Criar policies específicas por operação
CREATE POLICY "Users can view their own investments"
ON public.investments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments"
ON public.investments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments"
ON public.investments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments"
ON public.investments
FOR DELETE
USING (auth.uid() = user_id);