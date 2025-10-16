-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "workspace_members_select_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete_policy" ON public.workspace_members;

-- Drop the problematic function
DROP FUNCTION IF EXISTS public.is_workspace_admin(uuid, uuid);

-- Create a better admin check function that uses workspace owners table
-- This avoids recursion by not querying workspace_members
CREATE OR REPLACE FUNCTION public.is_workspace_owner(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces 
    WHERE id = _workspace_id AND owner_id = _user_id
  );
$$;

-- Policy 1: SELECT - Users can see members in workspaces they belong to
-- This policy is simple and doesn't cause recursion
CREATE POLICY "workspace_members_select_policy"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (
  -- User can see if they are the workspace owner
  public.is_workspace_owner(auth.uid(), workspace_id)
  OR
  -- OR if this row is about them (their own membership record)
  user_id = auth.uid()
  OR
  -- OR if they have a pending invitation (to see who invited them)
  (invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND status = 'invited')
);

-- Policy 2: INSERT - Only workspace owners can create invitations
CREATE POLICY "workspace_members_insert_policy"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only workspace owners can invite new members
  public.is_workspace_owner(auth.uid(), workspace_id)
  AND
  -- Must be creating an invitation (status = invited, no user_id yet)
  status = 'invited'
  AND
  user_id IS NULL
  AND
  invited_email IS NOT NULL
);

-- Policy 3: UPDATE - Two scenarios: accepting invitation OR admin management
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
  -- OR if they are the workspace owner (can change roles, remove members)
  public.is_workspace_owner(auth.uid(), workspace_id)
)
WITH CHECK (
  -- When accepting invitation: user can only set their own user_id and activate
  (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND user_id = auth.uid()
    AND status = 'active'
  )
  OR
  -- When owner is managing: can change role or status
  (
    public.is_workspace_owner(auth.uid(), workspace_id)
  )
);

-- Policy 4: DELETE - Only workspace owners can delete members
CREATE POLICY "workspace_members_delete_policy"
ON public.workspace_members
FOR DELETE
TO authenticated
USING (
  -- Only workspace owners can delete member records
  public.is_workspace_owner(auth.uid(), workspace_id)
  AND
  -- Cannot delete yourself if you're the owner
  user_id != auth.uid()
);