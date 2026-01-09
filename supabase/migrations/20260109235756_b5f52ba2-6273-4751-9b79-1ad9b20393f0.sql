-- Corrigir função get_user_role_from_jwt sem parâmetros
-- Adicionar SET search_path = public

CREATE OR REPLACE FUNCTION public.get_user_role_from_jwt()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    'user'
  );
$$;