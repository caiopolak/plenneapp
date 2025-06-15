
-- Tabela de dicas financeiras
create table public.financial_tips (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null,
  title text not null,
  content text not null,
  category text,
  difficulty_level text, -- "beginner", "intermediate", "advanced"
  is_public boolean default true,
  created_at timestamp with time zone default now()
);

-- Tabela de alertas financeiros
create table public.financial_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  message text not null,
  alert_type text, -- "spending", "goal", "investment", "tip", "challenge"
  priority text default 'medium', -- "low", "medium", "high"
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Tabela de desafios financeiros
create table public.financial_challenges (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null,
  title text not null,
  description text,
  target_amount numeric,
  duration_days integer not null,
  status text default 'active', -- "active", "completed", "failed", "paused"
  created_at timestamp with time zone default now()
);

-- Tabela progresso/desempenho do usuário em desafios
create table public.challenge_progress (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references public.financial_challenges(id) on delete cascade,
  user_id uuid not null,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  status text default 'active' -- "active", "completed", "failed", "paused"
);

-- Tabela módulos/aulas/trilhas, trilha/lib de aprendizado
create table public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  level text, -- "beginner", "intermediate", "advanced"
  category text,
  content text, -- markdown ou JSON para flexibilidade
  published boolean default false,
  created_at timestamp with time zone default now()
);

-- Progresso do usuário nos módulos/aulas
create table public.user_module_progress (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.learning_modules(id) on delete cascade,
  user_id uuid not null,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  status text default 'in_progress' -- "in_progress", "completed"
);

-- Habilitar RLS para todas
alter table public.financial_tips enable row level security;
alter table public.financial_alerts enable row level security;
alter table public.financial_challenges enable row level security;
alter table public.challenge_progress enable row level security;
alter table public.learning_modules enable row level security;
alter table public.user_module_progress enable row level security;

-- Políticas RLS para garantir acesso/control dos dados pessoais

-- financial_tips: quem criou gerencia, dicas públicas são visíveis a todos
create policy "Public tips are visible to all" on public.financial_tips for select using (is_public or creator_id = auth.uid());
create policy "User manages own tips" on public.financial_tips for all using (creator_id = auth.uid());

-- financial_alerts: cada usuário vê só seus alertas
create policy "User can manage own alerts" on public.financial_alerts for all using (user_id = auth.uid());

-- financial_challenges: público vê só desafios públicos (futuros) ou seus próprios (proprietário)
create policy "User manages their own challenges" on public.financial_challenges for all using (creator_id = auth.uid());

-- challenge_progress: só o usuário vê seu progresso
create policy "User sees their own challenge progress" on public.challenge_progress for all using (user_id = auth.uid());

-- learning_modules: todos podem ver módulos publicados, apenas criador edita os seus
create policy "All can view published modules" on public.learning_modules for select using (published or true);
create policy "User manages own modules" on public.learning_modules for all using (true);

-- user_module_progress: cada usuário só vê o próprio progresso
create policy "User sees own module progress" on public.user_module_progress for all using (user_id = auth.uid());

