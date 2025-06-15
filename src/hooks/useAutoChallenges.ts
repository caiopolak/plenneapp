
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface AutoChallenge {
  id: string;
  title: string;
  description: string;
  target_amount: number | null;
  duration_days: number;
  type: "automatic" | "manual";
  created_at: string;
}

export function useAutoChallenges() {
  const [autoChallenges, setAutoChallenges] = useState<AutoChallenge[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setAutoChallenges([]); return; }

    async function fetchChallenges() {
      // Análise rápida de padrão para sugerir desafios automáticos
      const res: AutoChallenge[] = [];
      // Exemplo: desafio para reduzir gasto em delivery
      const { data: lastTx } = await supabase.from('transactions').select('category,amount,date').eq('user_id', user.id).order('date', { ascending: false }).limit(30);
      if (lastTx) {
        const deliveryGasto = lastTx.filter(t => t.category?.toLowerCase().includes('delivery')).reduce((acc, t) => acc + Number(t.amount), 0);
        if (deliveryGasto > 200) {
          res.push({
            id: 'auto_delivery',
            title: "Corte gastos com delivery por 30 dias",
            description: "Desafio: Zero delivery por 30 dias. Experimente cozinhar em casa, sua saúde (e bolso) agradecem.",
            target_amount: 0,
            duration_days: 30,
            type: "automatic",
            created_at: new Date().toISOString()
          });
        }
      }

      // Exemplo: desafio reunir R$ 500 em 45 dias
      res.push({
        id: 'auto_save_500',
        title: "Poupe R$ 500 em 45 dias",
        description: "Meta de economia sugerida para impulsionar seu saldo. Reveja gastos e otimize!",
        target_amount: 500,
        duration_days: 45,
        type: "automatic",
        created_at: new Date().toISOString()
      });

      setAutoChallenges(res);
    }
    fetchChallenges();
  }, [user]);

  return autoChallenges;
}
