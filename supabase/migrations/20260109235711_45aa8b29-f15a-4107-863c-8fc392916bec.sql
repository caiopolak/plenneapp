-- Corrigir learning_modules: manter SELECT público mas restringir modificações para admin
DROP POLICY IF EXISTS "Public full access - intentional" ON public.learning_modules;

-- Permitir SELECT público para todos verem os módulos de aprendizado
CREATE POLICY "Anyone can view learning modules" 
ON public.learning_modules 
FOR SELECT 
USING (true);

-- Apenas admin pode inserir módulos
CREATE POLICY "Admin can insert learning modules" 
ON public.learning_modules 
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));

-- Apenas admin pode atualizar módulos
CREATE POLICY "Admin can update learning modules" 
ON public.learning_modules 
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

-- Apenas admin pode deletar módulos
CREATE POLICY "Admin can delete learning modules" 
ON public.learning_modules 
FOR DELETE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));