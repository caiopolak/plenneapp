-- Add DELETE policy for transactions so users can delete their own or workspace transactions
DO $$
BEGIN
  -- Enable RLS (safety) if not already enabled
  ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN
  -- ignore if already enabled
  NULL;
END $$;

-- Create policy allowing users to delete their own transactions or those in workspaces they belong to
DO $$
BEGIN
  CREATE POLICY "transactions_delete_user_or_workspace"
  ON public.transactions
  FOR DELETE
  USING (
    (user_id = auth.uid())
    OR (
      (workspace_id IS NOT NULL)
      AND (
        workspace_id IN (
          SELECT wm.workspace_id
          FROM public.workspace_members wm
          WHERE wm.user_id = auth.uid() AND wm.status = 'active'
        )
      )
    )
  );
EXCEPTION WHEN others THEN
  -- If policy already exists, do nothing
  NULL;
END $$;