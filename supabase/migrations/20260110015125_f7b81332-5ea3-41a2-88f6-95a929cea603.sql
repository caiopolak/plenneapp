-- Drop the conflicting/redundant policies that cause infinite recursion
DROP POLICY IF EXISTS "workspaces_select" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_insert" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_update" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_delete" ON public.workspaces;

-- The remaining policies should be sufficient:
-- "Workspace owner and members can view workspace" for SELECT
-- "Users can insert their own workspace" for INSERT
-- "Owner pode editar workspace" for UPDATE
-- "Owner pode deletar workspace" for DELETE