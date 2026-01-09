-- Adicionar coluna de áudio às aulas
ALTER TABLE public.education_lessons 
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS audio_file_url TEXT;

-- Adicionar coluna de progresso de percentual na tabela de progresso
ALTER TABLE public.user_lesson_progress 
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_spent_minutes INTEGER DEFAULT 0;