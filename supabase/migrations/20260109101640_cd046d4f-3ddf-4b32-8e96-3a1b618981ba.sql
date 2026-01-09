-- Corrigir função para verificar role do usuário consultando a tabela diretamente
CREATE OR REPLACE FUNCTION public.get_user_role_from_jwt()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    'user'
  );
$$;

-- Recriar políticas de lessons usando a função corrigida
DROP POLICY IF EXISTS "Authenticated (admin): manage lessons UPDATE" ON public.education_lessons;
DROP POLICY IF EXISTS "Authenticated (admin): manage lessons INSERT" ON public.education_lessons;
DROP POLICY IF EXISTS "Authenticated (admin): manage lessons DELETE" ON public.education_lessons;
DROP POLICY IF EXISTS "Authenticated: view lessons (consolidated)" ON public.education_lessons;

-- Política SELECT: todos podem ver aulas gratuitas, admins veem todas
CREATE POLICY "View lessons" ON public.education_lessons
FOR SELECT USING (
  is_free = true OR 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Política INSERT: apenas admins
CREATE POLICY "Admin insert lessons" ON public.education_lessons
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Política UPDATE: apenas admins
CREATE POLICY "Admin update lessons" ON public.education_lessons
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Política DELETE: apenas admins
CREATE POLICY "Admin delete lessons" ON public.education_lessons
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);