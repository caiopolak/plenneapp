-- Fix RLS policies on workspace_members to avoid querying auth.users table
-- Use JWT email claims instead to prevent 403 permission denied errors

-- Drop existing problematic policies
DROP POLICY IF EXISTS "workspace_members_select_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_policy" ON public.workspace_members;

-- Recreate SELECT policy using JWT email (no auth.users query)
CREATE POLICY "workspace_members_select_policy"
ON public.workspace_members
FOR SELECT
USING (
  is_workspace_owner(auth.uid(), workspace_id)
  OR user_id = auth.uid()
  OR (
    status = 'invited'
    AND user_id IS NULL
    AND lower(invited_email) = lower(coalesce((auth.jwt() ->> 'email')::text, ''))
  )
);

-- Recreate UPDATE policy using JWT email (no auth.users query)
CREATE POLICY "workspace_members_update_policy"
ON public.workspace_members
FOR UPDATE
USING (
  (
    status = 'invited'
    AND user_id IS NULL
    AND lower(invited_email) = lower(coalesce((auth.jwt() ->> 'email')::text, ''))
  )
  OR is_workspace_owner(auth.uid(), workspace_id)
)
WITH CHECK (
  (
    status = 'active'
    AND user_id = auth.uid()
    AND lower(invited_email) = lower(coalesce((auth.jwt() ->> 'email')::text, ''))
  )
  OR is_workspace_owner(auth.uid(), workspace_id)
);