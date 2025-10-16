-- Fix search_path for check_plan_limits function with parameters
CREATE OR REPLACE FUNCTION public.check_plan_limits(user_uuid uuid, resource_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_plan subscription_plan;
  transaction_count INTEGER;
BEGIN
  -- Buscar plano do usuário
  SELECT s.plan INTO user_plan
  FROM public.subscriptions s
  WHERE s.user_id = user_uuid AND s.status = 'active';
  
  -- Se não encontrou assinatura, assumir free
  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;
  
  -- Verificar limites baseados no tipo de recurso
  IF resource_type = 'transactions' THEN
    -- Contar transações do mês atual para plano free
    IF user_plan = 'free' THEN
      SELECT COUNT(*) INTO transaction_count
      FROM public.transactions
      WHERE user_id = user_uuid 
        AND date >= date_trunc('month', CURRENT_DATE)
        AND date < date_trunc('month', CURRENT_DATE) + interval '1 month';
      
      RETURN transaction_count < 100; -- Limite de 100 transações por mês no plano free
    END IF;
  END IF;
  
  -- Planos pro e business não têm limites por enquanto
  RETURN TRUE;
END;
$function$;