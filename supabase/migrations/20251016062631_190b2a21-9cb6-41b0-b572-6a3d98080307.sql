-- Drop existing incomplete policy
DROP POLICY IF EXISTS "Members can view own membership" ON public.workspace_members;

-- Create security definer function to check if user is workspace admin/owner
CREATE OR REPLACE FUNCTION public.is_workspace_admin(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- User is admin if they are the workspace owner OR have admin role in workspace_members
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces 
    WHERE id = _workspace_id AND owner_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _workspace_id 
      AND user_id = _user_id 
      AND role = 'admin' 
      AND status = 'active'
  );
$$;

-- Policy 1: Members can view all members in their workspace
CREATE POLICY "workspace_members_select_policy"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (
  -- User can see members if they are an active member of the workspace
  workspace_id IN (
    SELECT workspace_id 
    FROM public.workspace_members 
    WHERE user_id = auth.uid() 
      AND status = 'active'
  )
  OR
  -- OR if they have a pending invitation to this workspace (to see who invited them)
  (invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND status = 'invited')
);

-- Policy 2: Only workspace admins can INSERT invitations
CREATE POLICY "workspace_members_insert_policy"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only workspace admins can invite new members
  public.is_workspace_admin(auth.uid(), workspace_id)
  AND
  -- Must be creating an invitation (status = invited, no user_id yet)
  status = 'invited'
  AND
  user_id IS NULL
  AND
  invited_email IS NOT NULL
);

-- Policy 3: UPDATE policy - covers multiple scenarios
CREATE POLICY "workspace_members_update_policy"
ON public.workspace_members
FOR UPDATE
TO authenticated
USING (
  -- User can update if they are invited and the invitation is for their email
  (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'invited'
    AND user_id IS NULL
  )
  OR
  -- OR if they are a workspace admin (can change roles, remove members)
  public.is_workspace_admin(auth.uid(), workspace_id)
)
WITH CHECK (
  -- When accepting invitation: user can only set their own user_id and activate
  (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND user_id = auth.uid()
    AND status = 'active'
  )
  OR
  -- When admin is managing: can change role or status (but not steal ownership)
  (
    public.is_workspace_admin(auth.uid(), workspace_id)
    AND user_id IS NOT DISTINCT FROM (SELECT user_id FROM public.workspace_members WHERE id = workspace_members.id)
  )
);

-- Policy 4: Only workspace admins can DELETE members
CREATE POLICY "workspace_members_delete_policy"
ON public.workspace_members
FOR DELETE
TO authenticated
USING (
  -- Only workspace admins can delete member records
  public.is_workspace_admin(auth.uid(), workspace_id)
  AND
  -- Cannot delete yourself if you're the owner
  NOT (
    user_id = auth.uid() 
    AND workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  )
);