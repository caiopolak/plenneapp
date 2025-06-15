
-- 1) Tabela de histórico de aportes por meta
CREATE TABLE public.goal_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES financial_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS para garantir que usuário só acessa seus próprios aportes
ALTER TABLE public.goal_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário só vê seus próprios aportes" ON public.goal_deposits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuário só insere seus próprios aportes" ON public.goal_deposits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuário só deleta seus próprios aportes" ON public.goal_deposits
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Usuário só edita seus próprios aportes" ON public.goal_deposits
  FOR UPDATE USING (auth.uid() = user_id);

-- 2) Campo observação em financial_goals
ALTER TABLE public.financial_goals ADD COLUMN note TEXT;

