-- Fix infinite recursion in RLS policies by removing self-referential subqueries

-- 1) Helper function to check membership without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = _workspace_id
      AND wm.user_id = auth.uid()
      AND wm.status = 'active'
  );
$$;

-- 2) WORKSPACES: avoid querying workspace_members directly inside policy
DROP POLICY IF EXISTS "Workspace owner and members can view workspace" ON public.workspaces;
CREATE POLICY "Workspace owner and members can view workspace"
ON public.workspaces
FOR SELECT
USING (
  owner_id = auth.uid()
  OR public.is_workspace_member(id)
);

-- 3) WORKSPACE_MEMBERS: remove self-reference and avoid querying workspaces directly
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;
CREATE POLICY "Members can view workspace members"
ON public.workspace_members
FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_workspace_member(workspace_id)
  OR public.is_workspace_owner(auth.uid(), workspace_id)
);

DROP POLICY IF EXISTS "Workspace owners can manage members" ON public.workspace_members;
CREATE POLICY "Workspace owners can manage members"
ON public.workspace_members
FOR ALL
USING (public.is_workspace_owner(auth.uid(), workspace_id))
WITH CHECK (public.is_workspace_owner(auth.uid(), workspace_id));
