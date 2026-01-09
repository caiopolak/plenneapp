-- Corrigir função get_user_role_from_jwt que está sem search_path
-- A versão com parâmetro jwt_token está sem configuração

CREATE OR REPLACE FUNCTION public.get_user_role_from_jwt(jwt_token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Esta função é um placeholder que retorna 'user' por padrão
  -- A verificação real é feita pela função sem parâmetro
  RETURN 'user';
END;
$$;