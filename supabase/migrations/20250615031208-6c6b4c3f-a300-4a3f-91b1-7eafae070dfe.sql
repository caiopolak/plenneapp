
-- Permitir INSERT de workspaces apenas para usuários autenticados
CREATE POLICY "Users can insert their own workspace"
  ON public.workspaces
  FOR INSERT
  WITH CHECK (
    owner_id = auth.uid()
  );

-- Trigger para automaticamente criar o membership ao criar um novo workspace (exceto o pessoal já criado pela trigger principal)
CREATE OR REPLACE FUNCTION public.handle_new_workspace_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cuidado para não duplicar membership do workspace pessoal, só cria se não existir
  IF NOT EXISTS (
    SELECT 1 FROM public.workspace_members WHERE workspace_id = NEW.id AND user_id = NEW.owner_id
  ) THEN
    INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
    VALUES (NEW.id, NEW.owner_id, 'admin', 'active');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_workspace_created_membership ON public.workspaces;
CREATE TRIGGER on_workspace_created_membership
AFTER INSERT ON public.workspaces
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_workspace_membership();
