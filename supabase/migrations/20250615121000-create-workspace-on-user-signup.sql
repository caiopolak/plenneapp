
-- Trigger para criar workspace pessoal e membership no signup

CREATE OR REPLACE FUNCTION public.handle_new_user_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Cria workspace pessoal
  INSERT INTO public.workspaces (owner_id, name, type)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Seu Financeiro'), 'personal')
    RETURNING id INTO new_workspace_id;

  -- Atualiza perfil já existente para incluir workspace_id
  UPDATE public.profiles SET workspace_id=new_workspace_id WHERE id=NEW.id;

  -- Insere membership
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
    VALUES (new_workspace_id, NEW.id, 'admin', 'active');
  
  RETURN NEW;
END;
$$;

-- Drop do trigger antigo e criação do novo mais completo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_workspace();

