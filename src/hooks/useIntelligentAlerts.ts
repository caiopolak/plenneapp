import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { differenceInDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface IntelligentAlert {
  id: string;
  title: string;
  message: string;
  alert_type: 'spending' | 'goal' | 'investment' | 'tip' | 'challenge' | 'budget';
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
  action_url?: string;
  is_automatic: boolean;
}

export function useIntelligentAlerts() {
  const [alerts, setAlerts] = useState<IntelligentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();

  const generateIntelligentAlerts = async (): Promise<IntelligentAlert[]> => {
    if (!user) return [];
    // Se não houver workspace, só buscar alertas do usuário sem análises contextuais
    if (!workspace?.id) return [];

    const currentDate = new Date();
    const currentMonth = startOfMonth(currentDate);
    const lastMonth = startOfMonth(subMonths(currentDate, 1));
    const alertsList: IntelligentAlert[] = [];

    try {
      // 1. ALERTAS DE ORÇAMENTO EXCEDIDO
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('year', currentDate.getFullYear())
        .eq('month', currentDate.getMonth() + 1);

      const { data: currentExpenses } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('workspace_id', workspace.id)
        .eq('type', 'expense')
        .gte('date', currentMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth(currentDate).toISOString().split('T')[0]);

      // Analisar orçamentos
      if (budgets && currentExpenses) {
        const expensesByCategory = currentExpenses.reduce((acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
          return acc;
        }, {} as Record<string, number>);

        budgets.forEach(budget => {
          const spent = expensesByCategory[budget.category] || 0;
          const percentage = (spent / budget.amount_limit) * 100;
          
          if (percentage > 100) {
            alertsList.push({
              id: `budget-exceeded-${budget.id}`,
              title: '🚨 Orçamento Excedido',
              message: `Você gastou R$ ${spent.toFixed(2)} em ${budget.category}, excedendo o limite de R$ ${budget.amount_limit.toFixed(2)} em ${(percentage - 100).toFixed(1)}%`,
              alert_type: 'budget',
              priority: 'high',
              is_read: false,
              created_at: new Date().toISOString(),
              action_url: '/app/budgets',
              is_automatic: true
            });
          } else if (percentage > 80) {
            alertsList.push({
              id: `budget-warning-${budget.id}`,
              title: '⚠️ Orçamento Próximo do Limite',
              message: `Você já gastou ${percentage.toFixed(1)}% do orçamento de ${budget.category}. Cuidado para não estourar!`,
              alert_type: 'budget',
              priority: 'medium',
              is_read: false,
              created_at: new Date().toISOString(),
              action_url: '/app/budgets',
              is_automatic: true
            });
          }
        });
      }

      // 2. ALERTAS DE GASTOS ELEVADOS (Comparação mensal)
      const { data: lastMonthExpenses } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('workspace_id', workspace.id)
        .eq('type', 'expense')
        .gte('date', lastMonth.toISOString().split('T')[0])
        .lt('date', currentMonth.toISOString().split('T')[0]);

      if (currentExpenses && lastMonthExpenses) {
        const currentTotal = currentExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
        const lastTotal = lastMonthExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

        if (lastTotal > 0 && currentTotal > lastTotal * 1.3) {
          const increase = ((currentTotal - lastTotal) / lastTotal) * 100;
          alertsList.push({
            id: 'spending-increase',
            title: '📈 Gastos Aumentaram',
            message: `Seus gastos este mês aumentaram ${increase.toFixed(1)}% comparado ao mês passado. Que tal revisar onde pode economizar?`,
            alert_type: 'spending',
            priority: 'medium',
            is_read: false,
            created_at: new Date().toISOString(),
            action_url: '/app/analytics',
            is_automatic: true
          });
        }

        // Análise por categoria
        const currentByCategory = currentExpenses.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {} as Record<string, number>);

        const lastByCategory = lastMonthExpenses.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {} as Record<string, number>);

        // Detectar categorias com aumento significativo
        Object.entries(currentByCategory).forEach(([category, currentAmount]) => {
          const lastAmount = lastByCategory[category] || 0;
          if (lastAmount > 0 && currentAmount > lastAmount * 1.5 && currentAmount > 300) {
            const increase = ((currentAmount - lastAmount) / lastAmount) * 100;
            alertsList.push({
              id: `category-increase-${category}`,
              title: `💳 Gasto Alto em ${category}`,
              message: `Seus gastos com ${category} aumentaram ${increase.toFixed(1)}% este mês (R$ ${currentAmount.toFixed(2)}). Considere estabelecer um limite.`,
              alert_type: 'spending',
              priority: 'medium',
              is_read: false,
              created_at: new Date().toISOString(),
              action_url: '/app/budgets',
              is_automatic: true
            });
          }
        });
      }

      // 3. ALERTAS DE METAS
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('workspace_id', workspace.id)
        .not('target_date', 'is', null);

      if (goals) {
        goals.forEach(goal => {
          const targetDate = new Date(goal.target_date);
          const currentAmount = Number(goal.current_amount || 0);
          const targetAmount = Number(goal.target_amount);
          const progress = (currentAmount / targetAmount) * 100;
          const daysRemaining = differenceInDays(targetDate, currentDate);

          // Meta próxima do vencimento
          if (daysRemaining <= 30 && daysRemaining > 0 && progress < 70) {
            alertsList.push({
              id: `goal-deadline-${goal.id}`,
              title: `⏰ Meta "${goal.name}" Próxima do Prazo`,
              message: `Faltam apenas ${daysRemaining} dias e você está com ${progress.toFixed(1)}% da meta. Que tal fazer um aporte extra?`,
              alert_type: 'goal',
              priority: 'high',
              is_read: false,
              created_at: new Date().toISOString(),
              action_url: '/app/goals',
              is_automatic: true
            });
          }

          // Meta sem progresso há muito tempo
          if (progress === 0 && differenceInDays(currentDate, new Date(goal.created_at)) > 30) {
            alertsList.push({
              id: `goal-stagnant-${goal.id}`,
              title: `🎯 Meta "${goal.name}" Parada`,
              message: `Você criou esta meta há mais de 30 dias mas ainda não fez nenhum aporte. Que tal começar com uma pequena quantia?`,
              alert_type: 'goal',
              priority: 'medium',
              is_read: false,
              created_at: new Date().toISOString(),
              action_url: '/app/goals',
              is_automatic: true
            });
          }
        });
      }

      // 4. DICAS BASEADAS NO PERFIL
      const { data: profile } = await supabase
        .from('profiles')
        .select('risk_profile')
        .eq('id', user.id)
        .single();

      // Dica de reserva de emergência
      const emergencyGoal = goals?.find(g => 
        g.name.toLowerCase().includes('emergência') || 
        g.name.toLowerCase().includes('reserva')
      );

      if (!emergencyGoal && currentExpenses && currentExpenses.length > 0) {
        const monthlyExpense = currentExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
        const suggestedReserve = monthlyExpense * 6;
        
        alertsList.push({
          id: 'emergency-fund-tip',
          title: '🛡️ Crie sua Reserva de Emergência',
          message: `Baseado nos seus gastos mensais (R$ ${monthlyExpense.toFixed(2)}), você deveria ter uma reserva de R$ ${suggestedReserve.toFixed(2)} para 6 meses de segurança.`,
          alert_type: 'tip',
          priority: 'high',
          is_read: false,
          created_at: new Date().toISOString(),
          action_url: '/app/goals',
          is_automatic: true
        });
      }

      // 5. OPORTUNIDADES DE ECONOMIA
      if (currentExpenses && currentExpenses.length > 5) {
        const totalExpenses = currentExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
        const { data: currentIncome } = await supabase
          .from('transactions')
          .select('amount')
          .eq('workspace_id', workspace.id)
          .eq('type', 'income')
          .gte('date', currentMonth.toISOString().split('T')[0])
          .lte('date', endOfMonth(currentDate).toISOString().split('T')[0]);

        if (currentIncome && currentIncome.length > 0) {
          const totalIncome = currentIncome.reduce((sum, t) => sum + Number(t.amount), 0);
          const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;

          if (savingsRate < 10 && totalIncome > totalExpenses) {
            alertsList.push({
              id: 'low-savings-rate',
              title: '💰 Oportunidade de Poupança',
              message: `Você está poupando apenas ${savingsRate.toFixed(1)}% da sua renda. Especialistas recomendam pelo menos 20%. Que tal criar um orçamento mais rígido?`,
              alert_type: 'tip',
              priority: 'medium',
              is_read: false,
              created_at: new Date().toISOString(),
              action_url: '/app/budgets',
              is_automatic: true
            });
          } else if (savingsRate >= 20) {
            alertsList.push({
              id: 'good-savings-rate',
              title: '🎉 Parabéns pela Disciplina!',
              message: `Você está poupando ${savingsRate.toFixed(1)}% da sua renda! Isso é excelente. Continue assim e considere investir o excedente.`,
              alert_type: 'tip',
              priority: 'low',
              is_read: false,
              created_at: new Date().toISOString(),
              action_url: '/app/investments',
              is_automatic: true
            });
          }
        }
      }

      return alertsList;
    } catch (error) {
      console.error('Erro ao gerar alertas inteligentes:', error);
      return [];
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Buscar alertas automáticos
      const automaticAlerts = await generateIntelligentAlerts();

      // Buscar alertas manuais do banco
      if (!user?.id) {
        setAlerts([]);
        return;
      }

      const { data: manualAlerts } = await supabase
        .from('financial_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const formattedManualAlerts: IntelligentAlert[] = (manualAlerts || []).map(alert => {
        const allowedTypes = ['spending', 'goal', 'investment', 'tip', 'challenge', 'budget'] as const;
        const allowedPriorities = ['low', 'medium', 'high'] as const;
        
        return {
          id: alert.id,
          title: alert.title,
          message: alert.message,
          alert_type: allowedTypes.includes(alert.alert_type as any) ? alert.alert_type as IntelligentAlert['alert_type'] : 'tip',
          priority: allowedPriorities.includes(alert.priority as any) ? alert.priority as IntelligentAlert['priority'] : 'medium',
          is_read: alert.is_read || false,
          created_at: alert.created_at,
          is_automatic: false
        };
      });

      // Combinar e ordenar por data
      const allAlerts = [...automaticAlerts, ...formattedManualAlerts]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAlerts(allAlerts);
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    if (!user) return;
    
    // Se for alerta automático, apenas marcar localmente
    if (alertId.includes('-')) {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
      return;
    }

    // Se for alerta manual, atualizar no banco
    await supabase
      .from('financial_alerts')
      .update({ is_read: true })
      .eq('id', alertId)
      .eq('user_id', user.id);
    
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, is_read: true } : alert
    ));
  };

  const deleteAlert = async (alertId: string) => {
    if (!user) return;
    
    // Sempre remover localmente primeiro
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    
    // Se for alerta manual, deletar do banco também
    if (!alertId.includes('-')) {
      try {
        await supabase
          .from('financial_alerts')
          .delete()
          .eq('id', alertId)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Erro ao deletar alerta do banco:', error);
        // Se der erro, recarregar alertas
        fetchAlerts();
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchAlerts();
    } else {
      setAlerts([]);
      setLoading(false);
    }
  }, [user, workspace]);

  return {
    alerts,
    loading,
    markAsRead,
    deleteAlert,
    refetch: fetchAlerts
  };
}