
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

// Estrutura das dicas
export interface AutoTip {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty_level: string;
  created_at: string;
  automatic?: boolean;
  creator_id?: string; // Corrigir - permitir manualTips
}

export function useAutomaticTips() {
  const [tips, setTips] = useState<AutoTip[]>([]);
  const { user } = useAuth();

  const refetch = async () => {
    if (!user) {
      setTips([]);
      return;
    }
    const lista: AutoTip[] = [];
    // Regras customizadas
    // Se usuário tem mais de 3 metas abertas: dica sobre foco de prioridades
    const { data: goals } = await supabase.from('financial_goals').select('id,user_id').eq('user_id', user.id);
    if (goals && goals.length > 3) {
      lista.push({
        id: 'tip_focus_goals',
        title: "Foco nas suas prioridades",
        content: "Você possui várias metas ativas. Tente focar nas mais importantes para não dispersar esforços e acelerar resultados.",
        category: 'budgeting',
        difficulty_level: 'beginner',
        created_at: new Date().toISOString(),
        automatic: true
      });
    }

    // Se usuário não tem reserva de emergência: sugerir reserva
    const { data: reservagoal } = await supabase.from('financial_goals').select('name').eq('user_id', user.id);
    if (reservagoal && !reservagoal.find(g => g.name.toLowerCase().includes("emergência"))) {
      lista.push({
        id: 'tip_emergency',
        title: "Monte uma reserva de emergência",
        content: "Uma reserva financeira cobre imprevistos e traz tranquilidade. Comece a poupar para formar a sua!",
        category: 'emergency_fund',
        difficulty_level: 'intermediate',
        created_at: new Date().toISOString(),
        automatic: true
      });
    }

    // Dicas manuais do usuário ou públicas
    let { data: manualTips } = await supabase
      .from('financial_tips')
      .select('*')
      .or(`is_public.eq.true,creator_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    // Map manualTips para garantir tipagem e presence do criador_id
    const mappedManualTips: AutoTip[] = (manualTips || []).map(t => ({
      ...t,
      creator_id: t.creator_id,
    }));

    setTips([
      ...lista,
      ...mappedManualTips,
    ]);
  };

  useEffect(() => {
    refetch();
  }, [user]);

  return { tips, refetch, setTips };
}
