
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface LearningModule {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  category: string | null;
  content: string | null;
  published: boolean | null;
  created_at: string | null;
}

export interface UserModuleProgress {
  module_id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
}

export function usePersonalLearningPaths() {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [progress, setProgress] = useState<Record<string, UserModuleProgress>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setModules([]); setProgress({}); return; }
    async function fetchAll() {
      const { data: mods } = await supabase.from("learning_modules").select("*").eq("published", true);
      setModules(mods || []);

      // progresso do usuário
      const { data: userProg } = await supabase.from('user_module_progress').select('*').eq('user_id', user.id);
      if (userProg) {
        const map: Record<string, UserModuleProgress> = {};
        userProg.forEach((p: any) => map[p.module_id] = p);
        setProgress(map);
      }
    }
    fetchAll();
  }, [user]);

  // Recomenda o próximo módulo não concluído
  const nextModule = modules.find(m => progress[m.id]?.status !== "completed");
  return {
    modules,
    progress,
    nextModule
  };
}
