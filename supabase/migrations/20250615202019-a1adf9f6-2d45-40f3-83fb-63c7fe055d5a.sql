
-- Remover constraints antigas e adicionar ON DELETE CASCADE em financial_goals, transactions, investments, etc:

ALTER TABLE public.financial_goals DROP CONSTRAINT IF EXISTS financial_goals_workspace_id_fkey;
ALTER TABLE public.financial_goals ADD CONSTRAINT financial_goals_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_workspace_id_fkey;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.investments DROP CONSTRAINT IF EXISTS investments_workspace_id_fkey;
ALTER TABLE public.investments ADD CONSTRAINT investments_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_workspace_id_fkey;
ALTER TABLE public.budgets ADD CONSTRAINT budgets_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.data_imports DROP CONSTRAINT IF EXISTS data_imports_workspace_id_fkey;
ALTER TABLE public.data_imports ADD CONSTRAINT data_imports_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.workspace_members DROP CONSTRAINT IF EXISTS workspace_members_workspace_id_fkey;
ALTER TABLE public.workspace_members ADD CONSTRAINT workspace_members_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.transaction_categories DROP CONSTRAINT IF EXISTS transaction_categories_workspace_id_fkey;
ALTER TABLE public.transaction_categories ADD CONSTRAINT transaction_categories_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;
