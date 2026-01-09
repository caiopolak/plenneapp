-- =====================================================
-- ETAPA 1: Corrigir RLS do goal_deposits
-- Adicionar políticas para INSERT, UPDATE e DELETE
-- =====================================================

-- Política para usuários inserirem seus próprios depósitos
CREATE POLICY "goal_deposits_insert_own"
ON public.goal_deposits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem seus próprios depósitos
CREATE POLICY "goal_deposits_update_own"
ON public.goal_deposits
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para usuários excluírem seus próprios depósitos
CREATE POLICY "goal_deposits_delete_own"
ON public.goal_deposits
FOR DELETE
USING (auth.uid() = user_id);