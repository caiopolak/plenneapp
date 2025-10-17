-- Create triggers if missing and backfill essential data so users always have a workspace and membership

-- 1) Ensure trigger: when a workspace is created, create owner membership (admin/active)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_workspace_created'
  ) THEN
    CREATE TRIGGER on_workspace_created
    AFTER INSERT ON public.workspaces
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace_membership();
  END IF;
END$$;

-- 2) Ensure trigger: when a user is created in auth.users, create profile & subscription
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END$$;

-- 3) Backfill profiles for existing users that don't have one yet
INSERT INTO public.profiles (id, email, full_name)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'full_name', u.email)
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 4) Backfill subscriptions for users missing one
INSERT INTO public.subscriptions (user_id, plan, status)
SELECT u.id, 'free', 'active'
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
WHERE s.user_id IS NULL;

-- 5) Create a default personal workspace for users with no workspace and no membership
WITH candidates AS (
  SELECT u.id AS user_id
  FROM auth.users u
  LEFT JOIN public.workspace_members wm ON wm.user_id = u.id AND wm.status = 'active'
  LEFT JOIN public.workspaces w ON w.owner_id = u.id
  GROUP BY u.id
  HAVING COUNT(wm.id) = 0 AND COUNT(w.id) = 0
)
INSERT INTO public.workspaces (owner_id, name, type)
SELECT user_id, 'Pessoal', 'personal' FROM candidates;

-- 6) Ensure owner membership exists for all workspaces
INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
SELECT w.id, w.owner_id, 'admin', 'active'
FROM public.workspaces w
LEFT JOIN public.workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = w.owner_id
WHERE wm.id IS NULL;