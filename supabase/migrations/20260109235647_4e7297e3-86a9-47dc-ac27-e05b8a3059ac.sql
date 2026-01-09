-- =====================================================
-- CORREÇÃO DE POLÍTICAS RLS - Segurança Aprimorada
-- =====================================================

-- 1. FINANCIAL_TIPS: Manter SELECT público mas restringir modificações
-- Já existe: financial_tips_public_select para SELECT com qual:true (intencional para dicas públicas)
-- Adicionar políticas para INSERT/UPDATE/DELETE apenas para criadores

DROP POLICY IF EXISTS "financial_tips_insert" ON public.financial_tips;
DROP POLICY IF EXISTS "financial_tips_update" ON public.financial_tips;
DROP POLICY IF EXISTS "financial_tips_delete" ON public.financial_tips;

CREATE POLICY "financial_tips_insert" 
ON public.financial_tips 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "financial_tips_update" 
ON public.financial_tips 
FOR UPDATE 
TO authenticated
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "financial_tips_delete" 
ON public.financial_tips 
FOR DELETE 
TO authenticated
USING (auth.uid() = creator_id);

-- 2. LESSON_MATERIALS: Restringir acesso apenas para usuários autenticados
DROP POLICY IF EXISTS "Users can view lesson materials" ON public.lesson_materials;

CREATE POLICY "Authenticated users can view lesson materials" 
ON public.lesson_materials 
FOR SELECT 
TO authenticated
USING (true);

-- Admin pode gerenciar materiais
DROP POLICY IF EXISTS "Admin insert lesson materials" ON public.lesson_materials;
DROP POLICY IF EXISTS "Admin update lesson materials" ON public.lesson_materials;
DROP POLICY IF EXISTS "Admin delete lesson materials" ON public.lesson_materials;

CREATE POLICY "Admin insert lesson materials" 
ON public.lesson_materials 
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));

CREATE POLICY "Admin update lesson materials" 
ON public.lesson_materials 
FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));

CREATE POLICY "Admin delete lesson materials" 
ON public.lesson_materials 
FOR DELETE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));

-- 3. NOTIFICATION_SETTINGS: Corrigir para acesso baseado em usuário
DROP POLICY IF EXISTS "Allow only service_role" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can view own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can insert own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can update own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can delete own notification settings" ON public.notification_settings;

CREATE POLICY "Users can view own notification settings" 
ON public.notification_settings 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings" 
ON public.notification_settings 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" 
ON public.notification_settings 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification settings" 
ON public.notification_settings 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 4. WORKSPACE_MEMBERS: Adicionar políticas para operações de modificação
DROP POLICY IF EXISTS "Workspace owners can manage members" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can insert their own membership" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace admins can manage members" ON public.workspace_members;

CREATE POLICY "Workspace owners can manage members" 
ON public.workspace_members 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w 
    WHERE w.id = workspace_id AND w.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspaces w 
    WHERE w.id = workspace_id AND w.owner_id = auth.uid()
  )
);

-- Usuários podem ver membros dos workspaces que participam
DROP POLICY IF EXISTS "members_can_select_own" ON public.workspace_members;

CREATE POLICY "Members can view workspace members" 
ON public.workspace_members 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.workspace_members wm2 
    WHERE wm2.workspace_id = workspace_id 
    AND wm2.user_id = auth.uid() 
    AND wm2.status = 'active'
  )
);

-- 5. CHALLENGE_PROGRESS: Adicionar políticas separadas por operação
DROP POLICY IF EXISTS "User sees their own challenge progress" ON public.challenge_progress;

CREATE POLICY "Users can view own challenge progress" 
ON public.challenge_progress 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge progress" 
ON public.challenge_progress 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress" 
ON public.challenge_progress 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenge progress" 
ON public.challenge_progress 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);