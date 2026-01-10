-- ====================================================================
-- SISTEMA DE TRIAL E CONTADOR DE USO DO ASSISTENTE IA
-- ====================================================================

-- 1. Adicionar campos de trial na tabela subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS trial_start_date timestamptz,
ADD COLUMN IF NOT EXISTS trial_end_date timestamptz,
ADD COLUMN IF NOT EXISTS is_trial boolean DEFAULT false;

-- 2. Criar tabela para rastrear uso do assistente IA
CREATE TABLE IF NOT EXISTS public.user_assistant_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  month_year text NOT NULL, -- formato: '2026-01'
  questions_count integer DEFAULT 0,
  last_question_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- 3. Habilitar RLS
ALTER TABLE public.user_assistant_usage ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de segurança
CREATE POLICY "Users can view own usage" 
ON public.user_assistant_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" 
ON public.user_assistant_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" 
ON public.user_assistant_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 5. Trigger para updated_at
CREATE TRIGGER update_user_assistant_usage_updated_at
BEFORE UPDATE ON public.user_assistant_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_assistant_usage_user_month 
ON public.user_assistant_usage(user_id, month_year);

CREATE INDEX IF NOT EXISTS idx_subscriptions_trial 
ON public.subscriptions(user_id, is_trial, trial_end_date);

-- 7. Função para iniciar trial de 7 dias para novos usuários
CREATE OR REPLACE FUNCTION public.start_pro_trial(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_had_trial boolean;
BEGIN
  -- Verificar se usuário já teve trial
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = p_user_id AND (is_trial = true OR trial_start_date IS NOT NULL)
  ) INTO v_has_had_trial;
  
  IF v_has_had_trial THEN
    RETURN false; -- Usuário já teve trial
  END IF;
  
  -- Atualizar subscription para trial Pro
  UPDATE public.subscriptions
  SET 
    plan = 'pro',
    is_trial = true,
    trial_start_date = now(),
    trial_end_date = now() + interval '7 days',
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$;

-- 8. Função para verificar e expirar trials
CREATE OR REPLACE FUNCTION public.check_expired_trials()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Expirar trials que passaram da data
  UPDATE public.subscriptions
  SET 
    plan = 'free',
    is_trial = false,
    updated_at = now()
  WHERE 
    is_trial = true 
    AND trial_end_date < now();
END;
$$;

-- 9. Função para incrementar contador de uso do assistente
CREATE OR REPLACE FUNCTION public.increment_assistant_usage(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month_year text;
  v_current_count integer;
  v_plan text;
  v_max_count integer;
BEGIN
  v_month_year := to_char(now(), 'YYYY-MM');
  
  -- Obter plano do usuário
  SELECT plan INTO v_plan
  FROM public.subscriptions
  WHERE user_id = p_user_id AND status = 'active';
  
  v_plan := COALESCE(v_plan, 'free');
  
  -- Definir limite baseado no plano
  CASE v_plan
    WHEN 'free' THEN v_max_count := 5;
    WHEN 'pro' THEN v_max_count := 50;
    WHEN 'business' THEN v_max_count := -1; -- Ilimitado
    ELSE v_max_count := 5;
  END CASE;
  
  -- Inserir ou atualizar contagem
  INSERT INTO public.user_assistant_usage (user_id, month_year, questions_count, last_question_at)
  VALUES (p_user_id, v_month_year, 1, now())
  ON CONFLICT (user_id, month_year) 
  DO UPDATE SET 
    questions_count = user_assistant_usage.questions_count + 1,
    last_question_at = now(),
    updated_at = now()
  RETURNING questions_count INTO v_current_count;
  
  RETURN json_build_object(
    'current_count', v_current_count,
    'max_count', v_max_count,
    'plan', v_plan,
    'can_ask', v_max_count = -1 OR v_current_count <= v_max_count
  );
END;
$$;

-- 10. Função para obter uso atual do assistente
CREATE OR REPLACE FUNCTION public.get_assistant_usage(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month_year text;
  v_current_count integer;
  v_plan text;
  v_max_count integer;
BEGIN
  v_month_year := to_char(now(), 'YYYY-MM');
  
  -- Obter plano do usuário
  SELECT plan INTO v_plan
  FROM public.subscriptions
  WHERE user_id = p_user_id AND status = 'active';
  
  v_plan := COALESCE(v_plan, 'free');
  
  -- Definir limite baseado no plano
  CASE v_plan
    WHEN 'free' THEN v_max_count := 5;
    WHEN 'pro' THEN v_max_count := 50;
    WHEN 'business' THEN v_max_count := -1;
    ELSE v_max_count := 5;
  END CASE;
  
  -- Obter contagem atual
  SELECT COALESCE(questions_count, 0) INTO v_current_count
  FROM public.user_assistant_usage
  WHERE user_id = p_user_id AND month_year = v_month_year;
  
  v_current_count := COALESCE(v_current_count, 0);
  
  RETURN json_build_object(
    'current_count', v_current_count,
    'max_count', v_max_count,
    'plan', v_plan,
    'remaining', CASE WHEN v_max_count = -1 THEN -1 ELSE GREATEST(0, v_max_count - v_current_count) END,
    'can_ask', v_max_count = -1 OR v_current_count < v_max_count
  );
END;
$$;