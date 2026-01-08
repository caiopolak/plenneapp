import { useEffect, useState, useCallback, useRef } from 'react';
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

// Chave para armazenar alertas lidos no localStorage
const READ_ALERTS_KEY = 'plenne_read_alerts';
const DISMISSED_ALERTS_KEY = 'plenne_dismissed_alerts';

function getReadAlerts(): Set<string> {
  try {
    const stored = localStorage.getItem(READ_ALERTS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadAlerts(alertIds: Set<string>) {
  try {
    localStorage.setItem(READ_ALERTS_KEY, JSON.stringify([...alertIds]));
  } catch {
    // Ignore
  }
}

function getDismissedAlerts(): Set<string> {
  try {
    const stored = localStorage.getItem(DISMISSED_ALERTS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissedAlerts(alertIds: Set<string>) {
  try {
    localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify([...alertIds]));
  } catch {
    // Ignore
  }
}

export function useIntelligentAlerts() {
  const [alerts, setAlerts] = useState<IntelligentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();
  const lastFetchRef = useRef<number>(0);
  const cacheRef = useRef<IntelligentAlert[]>([]);

  const generateIntelligentAlerts = useCallback(async (): Promise<IntelligentAlert[]> => {
    if (!user || !workspace?.id) return [];

    const readAlerts = getReadAlerts();
    const dismissedAlerts = getDismissedAlerts();
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
        .lte('date', currentDate.toISOString().split('T')[0]);

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
            const alertId = `budget-exceeded-${budget.id}`;
            if (!dismissedAlerts.has(alertId)) {
              alertsList.push({
                id: alertId,
                title: 'Orçamento Excedido',
                message: `Você gastou R$ ${spent.toFixed(2)} em ${budget.category}, excedendo o limite de R$ ${budget.amount_limit.toFixed(2)} em ${(percentage - 100).toFixed(1)}%`,
                alert_type: 'budget',
                priority: 'high',
                is_read: readAlerts.has(alertId),
                created_at: new Date().toISOString(),
                action_url: '/app/budgets',
                is_automatic: true
              });
            }
          } else if (percentage > 80) {
            const alertId = `budget-warning-${budget.id}`;
            if (!dismissedAlerts.has(alertId)) {
              alertsList.push({
                id: alertId,
                title: 'Orçamento Próximo do Limite',
                message: `Você já gastou ${percentage.toFixed(1)}% do orçamento de ${budget.category}. Cuidado para não estourar!`,
                alert_type: 'budget',
                priority: 'medium',
                is_read: readAlerts.has(alertId),
                created_at: new Date().toISOString(),
                action_url: '/app/budgets',
                is_automatic: true
              });
            }
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
          const alertId = `spending-increase-${currentDate.getMonth()}`;
          if (!dismissedAlerts.has(alertId)) {
            const increase = ((currentTotal - lastTotal) / lastTotal) * 100;
            alertsList.push({
              id: alertId,
              title: 'Gastos Aumentaram Este Mês',
              message: `Seus gastos este mês aumentaram ${increase.toFixed(1)}% comparado ao mês passado. Que tal revisar onde pode economizar?`,
              alert_type: 'spending',
              priority: 'medium',
              is_read: readAlerts.has(alertId),
              created_at: new Date().toISOString(),
              action_url: '/app/analytics',
              is_automatic: true
            });
          }
        }
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
            const alertId = `goal-deadline-${goal.id}`;
            if (!dismissedAlerts.has(alertId)) {
              alertsList.push({
                id: alertId,
                title: `Meta "${goal.name}" Próxima do Prazo`,
                message: `Faltam apenas ${daysRemaining} dias e você está com ${progress.toFixed(1)}% da meta. Que tal fazer um aporte extra?`,
                alert_type: 'goal',
                priority: 'high',
                is_read: readAlerts.has(alertId),
                created_at: new Date().toISOString(),
                action_url: '/app/goals',
                is_automatic: true
              });
            }
          }

          // Meta sem progresso há muito tempo
          if (progress === 0 && differenceInDays(currentDate, new Date(goal.created_at)) > 30) {
            const alertId = `goal-stagnant-${goal.id}`;
            if (!dismissedAlerts.has(alertId)) {
              alertsList.push({
                id: alertId,
                title: `Meta "${goal.name}" Parada`,
                message: `Você criou esta meta há mais de 30 dias mas ainda não fez nenhum aporte. Que tal começar com uma pequena quantia?`,
                alert_type: 'goal',
                priority: 'medium',
                is_read: readAlerts.has(alertId),
                created_at: new Date().toISOString(),
                action_url: '/app/goals',
                is_automatic: true
              });
            }
          }
        });
      }

      // 4. DICA DE RESERVA DE EMERGÊNCIA (apenas se não tiver)
      const emergencyGoal = goals?.find(g => 
        g.name.toLowerCase().includes('emergência') || 
        g.name.toLowerCase().includes('reserva')
      );

      if (!emergencyGoal && currentExpenses && currentExpenses.length > 0) {
        const alertId = 'emergency-fund-tip';
        if (!dismissedAlerts.has(alertId)) {
          const monthlyExpense = currentExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
          const suggestedReserve = monthlyExpense * 6;
          
          alertsList.push({
            id: alertId,
            title: 'Crie sua Reserva de Emergência',
            message: `Baseado nos seus gastos mensais (R$ ${monthlyExpense.toFixed(2)}), você deveria ter uma reserva de R$ ${suggestedReserve.toFixed(2)} para 6 meses de segurança.`,
            alert_type: 'tip',
            priority: 'high',
            is_read: readAlerts.has(alertId),
            created_at: new Date().toISOString(),
            action_url: '/app/goals',
            is_automatic: true
          });
        }
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
          .lte('date', currentDate.toISOString().split('T')[0]);

        if (currentIncome && currentIncome.length > 0) {
          const totalIncome = currentIncome.reduce((sum, t) => sum + Number(t.amount), 0);
          const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;

          if (savingsRate < 10 && totalIncome > totalExpenses) {
            const alertId = `low-savings-rate-${currentDate.getMonth()}`;
            if (!dismissedAlerts.has(alertId)) {
              alertsList.push({
                id: alertId,
                title: 'Oportunidade de Poupança',
                message: `Você está poupando apenas ${savingsRate.toFixed(1)}% da sua renda. Especialistas recomendam pelo menos 20%. Que tal criar um orçamento mais rígido?`,
                alert_type: 'tip',
                priority: 'medium',
                is_read: readAlerts.has(alertId),
                created_at: new Date().toISOString(),
                action_url: '/app/budgets',
                is_automatic: true
              });
            }
          } else if (savingsRate >= 20) {
            const alertId = `good-savings-rate-${currentDate.getMonth()}`;
            if (!dismissedAlerts.has(alertId)) {
              alertsList.push({
                id: alertId,
                title: 'Parabéns pela Disciplina!',
                message: `Você está poupando ${savingsRate.toFixed(1)}% da sua renda! Isso é excelente. Continue assim e considere investir o excedente.`,
                alert_type: 'tip',
                priority: 'low',
                is_read: readAlerts.has(alertId),
                created_at: new Date().toISOString(),
                action_url: '/app/investments',
                is_automatic: true
              });
            }
          }
        }
      }

      return alertsList;
    } catch (error) {
      console.error('Erro ao gerar alertas inteligentes:', error);
      return [];
    }
  }, [user, workspace]);

  const fetchAlerts = useCallback(async () => {
    // Evitar fetches muito frequentes (cache de 30 segundos)
    const now = Date.now();
    if (now - lastFetchRef.current < 30000 && cacheRef.current.length > 0) {
      setAlerts(cacheRef.current);
      setLoading(false);
      return;
    }

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

      // Combinar e ordenar por prioridade e data
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const allAlerts = [...automaticAlerts, ...formattedManualAlerts]
        .sort((a, b) => {
          // Não lidos primeiro
          if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
          // Por prioridade
          const pA = priorityOrder[a.priority] || 1;
          const pB = priorityOrder[b.priority] || 1;
          if (pA !== pB) return pA - pB;
          // Por data
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      cacheRef.current = allAlerts;
      lastFetchRef.current = now;
      setAlerts(allAlerts);
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [user, workspace, generateIntelligentAlerts]);

  const markAsRead = useCallback(async (alertId: string) => {
    if (!user) return;
    
    // Atualizar estado local imediatamente
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, is_read: true } : alert
    ));

    // Se for alerta automático, salvar no localStorage
    const alert = alerts.find(a => a.id === alertId);
    if (alert?.is_automatic) {
      const readAlerts = getReadAlerts();
      readAlerts.add(alertId);
      saveReadAlerts(readAlerts);
    } else {
      // Se for alerta manual, atualizar no banco
      await supabase
        .from('financial_alerts')
        .update({ is_read: true })
        .eq('id', alertId)
        .eq('user_id', user.id);
    }
    
    // Atualizar cache
    cacheRef.current = cacheRef.current.map(alert => 
      alert.id === alertId ? { ...alert, is_read: true } : alert
    );
  }, [user, alerts]);

  const deleteAlert = useCallback(async (alertId: string) => {
    if (!user) return;
    
    // Remover localmente primeiro
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    cacheRef.current = cacheRef.current.filter(alert => alert.id !== alertId);
    
    // Se for alerta automático, marcar como dispensado no localStorage
    const alert = alerts.find(a => a.id === alertId);
    if (alert?.is_automatic) {
      const dismissedAlerts = getDismissedAlerts();
      dismissedAlerts.add(alertId);
      saveDismissedAlerts(dismissedAlerts);
    } else {
      // Se for alerta manual, deletar do banco
      try {
        await supabase
          .from('financial_alerts')
          .delete()
          .eq('id', alertId)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Erro ao deletar alerta do banco:', error);
      }
    }
  }, [user, alerts]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    const unreadAlerts = alerts.filter(a => !a.is_read);
    if (unreadAlerts.length === 0) return;

    // Atualizar estado local
    setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })));
    cacheRef.current = cacheRef.current.map(alert => ({ ...alert, is_read: true }));

    // Salvar alertas automáticos no localStorage
    const readAlerts = getReadAlerts();
    unreadAlerts.filter(a => a.is_automatic).forEach(a => readAlerts.add(a.id));
    saveReadAlerts(readAlerts);

    // Atualizar alertas manuais no banco
    const manualAlertIds = unreadAlerts.filter(a => !a.is_automatic).map(a => a.id);
    if (manualAlertIds.length > 0) {
      await supabase
        .from('financial_alerts')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .in('id', manualAlertIds);
    }
  }, [user, alerts]);

  useEffect(() => {
    if (user) {
      fetchAlerts();
    } else {
      setAlerts([]);
      cacheRef.current = [];
      setLoading(false);
    }
  }, [user, workspace, fetchAlerts]);

  return {
    alerts,
    loading,
    markAsRead,
    deleteAlert,
    markAllAsRead,
    refetch: fetchAlerts,
    unreadCount: alerts.filter(a => !a.is_read).length
  };
}
