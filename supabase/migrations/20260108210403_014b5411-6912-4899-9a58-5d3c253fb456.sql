-- Drop the restrictive migration_admin_all policy
DROP POLICY IF EXISTS "migration_admin_all" ON public.budgets;

-- Enable RLS (if not already enabled)
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own budgets
CREATE POLICY "Users can view their own budgets"
ON public.budgets
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for users to insert their own budgets  
CREATE POLICY "Users can insert their own budgets"
ON public.budgets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own budgets
CREATE POLICY "Users can update their own budgets"
ON public.budgets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own budgets
CREATE POLICY "Users can delete their own budgets"
ON public.budgets
FOR DELETE
USING (auth.uid() = user_id);