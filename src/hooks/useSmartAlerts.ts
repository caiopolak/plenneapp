
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { differenceInDays } from 'date-fns';

// Estrutura do alerta
export interface SmartAlert {
  id: string;
  title: string;
  message: string;
  alert_type: 'spending' | 'goal' | 'investment' | 'tip' | 'challenge';
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
}

function castToSmartAlert(alert: any): SmartAlert {
  // Força os tipos literais válidos
  const allowedTypes = ['spending', 'goal', 'investment', 'tip', 'challenge'] as const;
  const allowedPriorities = ['low', 'medium', 'high'] as const;
  let type: SmartAlert['alert_type'] = allowedTypes.includes(alert.alert_type) ? alert.alert_type : 'tip';
  let priority: SmartAlert['priority'] = allowedPriorities.includes(alert.priority) ? alert.priority : 'medium';
  return {
    id: alert.id,
    title: alert.title,
    message: alert.message,
    alert_type: type,
    priority: priority,
    is_read: Boolean(alert.is_read),
    created_at: alert.created_at,
  };
}

export function useSmartAlerts() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return setAlerts([]);

    async function fetchAlerts() {
      let { data: userAlerts } = await supabase
        .from('financial_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const customAlerts: SmartAlert[] = [];

      // Exemplo de regras automáticas: (pode/poderá ser expandido)
      // Gastos elevados: buscar transações recentes acima da média
      const { data: recentTxs } = await supabase
        .from('transactions')
        .select('amount,category,date')
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

      if (recentTxs && recentTxs.length > 0) {
        const comida = recentTxs.filter(t => t.category?.toLowerCase().includes('aliment'));
        const mediaComida = comida.reduce((acc, t) => acc + Number(t.amount), 0) / (comida.length || 1);
        if (mediaComida > 200) {
          customAlerts.push({
            id: 'high_spending_food',
            title: 'Gasto alto em alimentação',
            message: `Seu gasto médio em alimentação na última semana ficou em R$ ${mediaComida.toFixed(2)}. Que tal cozinhar mais em casa?`,
            alert_type: "spending",
            priority: "high",
            is_read: false,
            created_at: new Date().toISOString(),
          });
        }
      }

      // Metas próximas de vencer sem atingir objetivo
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('id,target_amount,current_amount,name,target_date')
        .eq('user_id', user.id);

      if (goals) {
        for (const g of goals) {
          if (g.target_date) {
            const dias = differenceInDays(new Date(g.target_date), new Date());
            if (dias <= 30 && g.current_amount < g.target_amount * 0.7) {
              customAlerts.push({
                id: `goal_${g.id}`,
                title: `Meta próxima do prazo`,
                message: `Meta "${g.name}" têm só ${dias} dias e está em ${((g.current_amount / g.target_amount) * 100).toFixed(1)}% do valor.`,
                alert_type: "goal",
                priority: "medium",
                is_read: false,
                created_at: new Date().toISOString(),
              });
            }
          }
        }
      }

      // Outros exemplos: investimento novo disponível (mock)
      customAlerts.push({
        id: 'inv_123',
        title: 'Novo investimento disponível',
        message: 'Ações do Tesouro Direto com rendimento de 13% ao ano liberadas.',
        alert_type: 'investment',
        priority: 'medium',
        is_read: false,
        created_at: new Date().toISOString()
      });

      // Merge: dados do banco (manual) + automáticos
      // Forçar cast dos tipos do banco
      const supabaseAlerts: SmartAlert[] = (userAlerts || []).map(castToSmartAlert);

      setAlerts([
        ...customAlerts,
        ...supabaseAlerts,
      ]);
    }

    fetchAlerts();
  }, [user]);

  return alerts;
}
