import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CourseModule {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  published: boolean | null;
  created_at: string | null;
  content: string | null;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  video_file_url: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  order_index: number | null;
  is_free: boolean | null;
  created_at: string | null;
}

export interface LessonMaterial {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  order_index: number;
  created_at: string | null;
}

export interface UserLessonProgress {
  lesson_id: string;
  completed: boolean;
  progress_seconds: number;
  completed_at: string | null;
}

export function useCourseModules() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar módulos publicados
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['course-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CourseModule[];
    }
  });

  // Buscar aulas de um módulo específico
  const useLessons = (moduleId: string | null) => {
    return useQuery({
      queryKey: ['course-lessons', moduleId],
      queryFn: async () => {
        if (!moduleId) return [];
        
        const { data, error } = await supabase
          .from('education_lessons')
          .select('*')
          .eq('module_id', moduleId)
          .order('order_index', { ascending: true });
        
        if (error) throw error;
        return data as Lesson[];
      },
      enabled: !!moduleId
    });
  };

  // Buscar materiais de uma aula
  const useMaterials = (lessonId: string | null) => {
    return useQuery({
      queryKey: ['lesson-materials', lessonId],
      queryFn: async () => {
        if (!lessonId) return [];
        
        const { data, error } = await supabase
          .from('lesson_materials')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('order_index', { ascending: true });
        
        if (error) throw error;
        return data as LessonMaterial[];
      },
      enabled: !!lessonId
    });
  };

  // Buscar progresso do usuário
  const { data: userProgress = {} } = useQuery({
    queryKey: ['user-lesson-progress', user?.id],
    queryFn: async () => {
      if (!user) return {};
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const progressMap: Record<string, UserLessonProgress> = {};
      data?.forEach((p: any) => {
        progressMap[p.lesson_id] = p;
      });
      return progressMap;
    },
    enabled: !!user
  });

  // Criar módulo
  const createModuleMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; category?: string; level?: string; published?: boolean }) => {
      const { error } = await supabase
        .from('learning_modules')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-modules'] });
      toast({ title: "Módulo criado com sucesso!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao criar módulo", description: error.message, variant: "destructive" });
    }
  });

  // Atualizar módulo
  const updateModuleMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CourseModule> & { id: string }) => {
      const { error } = await supabase
        .from('learning_modules')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-modules'] });
      toast({ title: "Módulo atualizado!" });
    }
  });

  // Deletar módulo
  const deleteModuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('learning_modules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-modules'] });
      toast({ title: "Módulo removido!" });
    }
  });

  // Criar aula
  const createLessonMutation = useMutation({
    mutationFn: async (data: { title: string; module_id: string; description?: string; content?: string; video_url?: string; duration_minutes?: number; is_free?: boolean; order_index?: number }) => {
      const { error } = await supabase
        .from('education_lessons')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-lessons', variables.module_id] });
      toast({ title: "Aula criada com sucesso!" });
    }
  });

  // Atualizar aula
  const updateLessonMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Lesson> & { id: string }) => {
      const { error } = await supabase
        .from('education_lessons')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-lessons'] });
      toast({ title: "Aula atualizada!" });
    }
  });

  // Deletar aula
  const deleteLessonMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('education_lessons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-lessons'] });
      toast({ title: "Aula removida!" });
    }
  });

  // Criar material
  const createMaterialMutation = useMutation({
    mutationFn: async (data: { lesson_id: string; title: string; file_url: string; file_type: string; description?: string; file_size?: number; order_index?: number }) => {
      const { error } = await supabase
        .from('lesson_materials')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-materials', variables.lesson_id] });
      toast({ title: "Material adicionado!" });
    }
  });

  // Deletar material
  const deleteMaterialMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lesson_materials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-materials'] });
      toast({ title: "Material removido!" });
    }
  });

  // Atualizar progresso
  const updateProgressMutation = useMutation({
    mutationFn: async ({ lessonId, completed, progressSeconds }: { lessonId: string; completed?: boolean; progressSeconds?: number }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: completed || false,
          progress_seconds: progressSeconds || 0,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-lesson-progress'] });
    }
  });

  // Upload de arquivo para storage
  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('course-materials')
      .upload(path, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('course-materials')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  };

  return {
    modules,
    modulesLoading,
    userProgress,
    useLessons,
    useMaterials,
    createModuleMutation,
    updateModuleMutation,
    deleteModuleMutation,
    createLessonMutation,
    updateLessonMutation,
    deleteLessonMutation,
    createMaterialMutation,
    deleteMaterialMutation,
    updateProgressMutation,
    uploadFile
  };
}
