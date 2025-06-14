
-- Adicionar limites e tipo de plano na tabela de subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN usage_limits JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN max_members INTEGER DEFAULT 1;

-- Criar tabela de workspaces (para multiusuario: família/empresa)
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('personal', 'family', 'business')) DEFAULT 'personal',
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar coluna workspace_id nas entidades principais
ALTER TABLE public.profiles ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);
ALTER TABLE public.transactions ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);
ALTER TABLE public.financial_goals ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);
ALTER TABLE public.investments ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);

-- Tabela de membros do workspace
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  invited_email TEXT,
  status TEXT CHECK (status IN ('active', 'invited', 'removed')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Tabela para uploads/importação de dados (controle de importação)
CREATE TABLE public.data_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('csv', 'excel')) NOT NULL,
  filename TEXT,
  status TEXT CHECK (status IN ('pending','completed','failed')) DEFAULT 'pending',
  log TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar policies RLS para multiusuário (workspace-based) em todas as tabelas relacionadas
-- Exemplo para transactions:
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workspace members can access their transactions"
  ON public.transactions
  USING (
    workspace_id IS NOT NULL AND
    workspace_id IN (
      SELECT workspace_id 
      FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status='active'
    )
  );

CREATE POLICY "Workspace members can insert their transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (
    workspace_id IS NOT NULL AND
    workspace_id IN (
      SELECT workspace_id 
      FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status='active'
    )
  );

CREATE POLICY "Workspace members can update own transactions"
  ON public.transactions
  FOR UPDATE
  USING (
    workspace_id IS NOT NULL AND
    workspace_id IN (
      SELECT workspace_id 
      FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status='active'
    )
  );

CREATE POLICY "Workspace members can delete own transactions"
  ON public.transactions
  FOR DELETE
  USING (
    workspace_id IS NOT NULL AND
    workspace_id IN (
      SELECT workspace_id 
      FROM public.workspace_members 
      WHERE user_id = auth.uid() AND status='active'
    )
  );

-- Repita lógica acima para as tabelas: financial_goals, investments, data_imports

-- Criar policies de SELECT/UPDATE para workspaces, workspace_members e data_imports para os membros apenas

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workspace owner and members can view workspace"
  ON public.workspaces
  FOR SELECT
  USING (
    id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND status='active')
    OR owner_id = auth.uid()
  );

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view own membership"
  ON public.workspace_members
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- Políticas para data_imports
ALTER TABLE public.data_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only workspace members can view data imports"
  ON public.data_imports
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND status='active'
    )
  );
CREATE POLICY "Só autor insere importação"
  ON public.data_imports
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
  );

-- Adicionar índices para performance
CREATE INDEX ON public.transactions(workspace_id, user_id);
CREATE INDEX ON public.workspace_members(user_id, workspace_id);

-- CHECK: Adaptação de triggers/funções se necessário (exemplo: ao criar usuário, criar workspace pessoal/default e membro)

