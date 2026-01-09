-- 1. Criar enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Criar tabela user_roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Função segura para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Função para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- 5. RLS policies para user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.is_admin(auth.uid()));

-- 6. Tabela de materiais para aulas (PDFs, arquivos complementares)
CREATE TABLE public.lesson_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.education_lessons(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'pdf', 'video', 'image', 'document'
    file_size INTEGER, -- em bytes
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ver materiais
CREATE POLICY "Users can view lesson materials"
ON public.lesson_materials
FOR SELECT
TO authenticated
USING (true);

-- Apenas admins podem gerenciar materiais
CREATE POLICY "Admins can manage lesson materials"
ON public.lesson_materials
FOR ALL
USING (public.is_admin(auth.uid()));

-- 7. Adicionar coluna video_file_url para upload direto na tabela education_lessons
ALTER TABLE public.education_lessons 
ADD COLUMN IF NOT EXISTS video_file_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 8. Tabela para progresso de aulas do usuário
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES public.education_lessons(id) ON DELETE CASCADE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    progress_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lesson progress"
ON public.user_lesson_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress"
ON public.user_lesson_progress
FOR ALL
USING (auth.uid() = user_id);

-- 9. Atualizar tabela de desafios para persistência
ALTER TABLE public.financial_challenges
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS workspace_id UUID,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_automatic BOOLEAN DEFAULT false;

-- RLS para desafios
DROP POLICY IF EXISTS "Users can view own challenges" ON public.financial_challenges;
DROP POLICY IF EXISTS "Users can manage own challenges" ON public.financial_challenges;

CREATE POLICY "Users can view own challenges"
ON public.financial_challenges
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = creator_id);

CREATE POLICY "Users can manage own challenges"
ON public.financial_challenges
FOR ALL
USING (auth.uid() = user_id OR auth.uid() = creator_id);

-- 10. Criar bucket para uploads de cursos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'course-materials', 
    'course-materials', 
    true,
    104857600, -- 100MB
    ARRAY['video/mp4', 'video/webm', 'application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para course-materials
CREATE POLICY "Anyone can view course materials"
ON storage.objects
FOR SELECT
USING (bucket_id = 'course-materials');

CREATE POLICY "Admins can upload course materials"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'course-materials' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update course materials"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'course-materials' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete course materials"
ON storage.objects
FOR DELETE
USING (bucket_id = 'course-materials' AND public.is_admin(auth.uid()));