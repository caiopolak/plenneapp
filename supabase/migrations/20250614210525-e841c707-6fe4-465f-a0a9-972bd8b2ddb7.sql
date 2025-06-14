
-- Tabela para orçamentos mensais por categoria (corrigindo: 'limit' → 'amount_limit')
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  workspace_id uuid references workspaces(id),
  category text not null,
  year int not null,
  month int not null,
  amount_limit numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Habilitar Row Level Security
alter table public.budgets enable row level security;

-- Políticas RLS (apenas o próprio usuário pode ver/manipular)
create policy "Usuários podem ver seus próprios orçamentos"
  on public.budgets for select
  using (user_id = auth.uid());

create policy "Usuários podem inserir orçamentos"
  on public.budgets for insert
  with check (user_id = auth.uid());

create policy "Usuários podem atualizar seus próprios orçamentos"
  on public.budgets for update
  using (user_id = auth.uid());

create policy "Usuários podem deletar seus próprios orçamentos"
  on public.budgets for delete
  using (user_id = auth.uid());
