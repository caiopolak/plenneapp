import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface IntelligentTip {
  id: string;
  title: string;
  content: string;
  category: 'budgeting' | 'saving' | 'investment' | 'emergency_fund' | 'spending' | 'general';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  priority: 'low' | 'medium' | 'high';
  is_automatic: boolean;
  reason?: string;
  action_url?: string;
  created_at: string;
}

export function useIntelligentTips() {
  const [tips, setTips] = useState<IntelligentTip[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();

  const generateIntelligentTips = async (): Promise<IntelligentTip[]> => {
    if (!user || !workspace?.id) return [];

    const currentDate = new Date();
    const currentMonth = startOfMonth(currentDate);
    const lastMonth = startOfMonth(subMonths(currentDate, 1));
    const tipsList: IntelligentTip[] = [];

    try {
      // Buscar dados do usuário
      const [
        { data: profile },
        { data: goals },
        { data: transactions },
        { data: budgets },
        { data: investments }
      ] = await Promise.all([
        supabase.from('profiles').select('risk_profile').eq('id', user.id).single(),
        supabase.from('financial_goals').select('*').eq('workspace_id', workspace.id),
        supabase.from('transactions').select('*').eq('workspace_id', workspace.id).gte('date', subMonths(currentDate, 3).toISOString().split('T')[0]),
        supabase.from('budgets').select('*').eq('workspace_id', workspace.id),
        supabase.from('investments').select('*').eq('workspace_id', workspace.id)
      ]);

      const currentExpenses = transactions?.filter(t => 
        t.type === 'expense' && 
        new Date(t.date) >= currentMonth && 
        new Date(t.date) <= endOfMonth(currentDate)
      ) || [];

      const currentIncome = transactions?.filter(t => 
        t.type === 'income' && 
        new Date(t.date) >= currentMonth && 
        new Date(t.date) <= endOfMonth(currentDate)
      ) || [];

      // 1. DICAS DE RESERVA DE EMERGÊNCIA
      const emergencyGoal = goals?.find(g => 
        g.name.toLowerCase().includes('emergência') || 
        g.name.toLowerCase().includes('reserva')
      );

      if (!emergencyGoal && currentExpenses.length > 0) {
        const monthlyExpense = currentExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
        const suggestedReserve = monthlyExpense * 6;
        
        tipsList.push({
          id: 'emergency-fund-create',
          title: '🛡️ Crie sua Reserva de Emergência',
          content: `Você ainda não tem uma reserva de emergência. Com base nos seus gastos mensais (R$ ${monthlyExpense.toFixed(2)}), você deveria ter R$ ${suggestedReserve.toFixed(2)} guardados para 6 meses de segurança. Comece poupando 10% da sua renda mensal.`,
          category: 'emergency_fund',
          difficulty_level: 'beginner',
          priority: 'high',
          is_automatic: true,
          reason: 'Não possui reserva de emergência',
          action_url: '/app/goals',
          created_at: new Date().toISOString()
        });
      }

      // 2. DICAS DE ORÇAMENTO
      if (!budgets || budgets.length === 0) {
        if (currentExpenses.length > 5) {
          // Analisar categorias de gasto
          const expensesByCategory = currentExpenses.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
            return acc;
          }, {} as Record<string, number>);

          const topCategories = Object.entries(expensesByCategory)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([cat, amount]) => `${cat} (R$ ${amount.toFixed(2)})`)
            .join(', ');

          tipsList.push({
            id: 'budget-create',
            title: '📊 Crie Orçamentos para Controlar Gastos',
            content: `Você tem várias transações mas nenhum orçamento definido. Suas principais categorias de gasto são: ${topCategories}. Criar orçamentos ajuda a controlar gastos e atingir objetivos financeiros.`,
            category: 'budgeting',
            difficulty_level: 'beginner',
            priority: 'medium',
            is_automatic: true,
            reason: 'Usuário ativo sem orçamentos definidos',
            action_url: '/app/budgets',
            created_at: new Date().toISOString()
          });
        }
      }

      // 3. DICAS DE METAS FINANCEIRAS
      if (goals && goals.length > 3) {
        const activeGoals = goals.filter(g => Number(g.current_amount || 0) < Number(g.target_amount));
        if (activeGoals.length > 2) {
          tipsList.push({
            id: 'goals-focus',
            title: '🎯 Foque nas Metas Mais Importantes',
            content: `Você tem ${activeGoals.length} metas ativas. Para ter mais sucesso, tente focar em 1-2 metas principais por vez. Isso aumenta suas chances de atingir os objetivos mais rapidamente.`,
            category: 'saving',
            difficulty_level: 'intermediate',
            priority: 'medium',
            is_automatic: true,
            reason: 'Muitas metas ativas simultaneamente',
            action_url: '/app/goals',
            created_at: new Date().toISOString()
          });
        }
      }

      // 4. DICAS DE ECONOMIA BASEADAS EM GASTOS
      if (currentExpenses.length > 0 && currentIncome.length > 0) {
        const totalExpenses = currentExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
        const totalIncome = currentIncome.reduce((sum, t) => sum + Number(t.amount), 0);
        const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;

        if (savingsRate < 10 && totalIncome > totalExpenses) {
          tipsList.push({
            id: 'improve-savings-rate',
            title: '💰 Melhore sua Taxa de Poupança',
            content: `Você está poupando apenas ${savingsRate.toFixed(1)}% da sua renda. A regra 50-30-20 sugere: 50% necessidades, 30% desejos, 20% poupança. Tente cortar alguns gastos supérfluos.`,
            category: 'saving',
            difficulty_level: 'beginner',
            priority: 'high',
            is_automatic: true,
            reason: 'Taxa de poupança abaixo do recomendado',
            action_url: '/app/analytics',
            created_at: new Date().toISOString()
          });
        }

        // Análise de categorias específicas
        const expensesByCategory = currentExpenses.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {} as Record<string, number>);

        // Gastos com alimentação
        const foodExpenses = expensesByCategory['Alimentação'] || 0;
        if (foodExpenses > totalIncome * 0.15) {
          tipsList.push({
            id: 'food-budget-tip',
            title: '🍽️ Otimize seus Gastos com Alimentação',
            content: `Seus gastos com alimentação (R$ ${foodExpenses.toFixed(2)}) representam ${((foodExpenses/totalIncome)*100).toFixed(1)}% da sua renda. Tente cozinhar mais em casa, fazer lista de compras e aproveitar promoções.`,
            category: 'spending',
            difficulty_level: 'beginner',
            priority: 'medium',
            is_automatic: true,
            reason: 'Gastos com alimentação acima de 15% da renda',
            action_url: '/app/budgets',
            created_at: new Date().toISOString()
          });
        }

        // Gastos com transporte
        const transportExpenses = expensesByCategory['Transporte'] || 0;
        if (transportExpenses > totalIncome * 0.15) {
          tipsList.push({
            id: 'transport-budget-tip',
            title: '🚗 Revise seus Gastos com Transporte',
            content: `Seus gastos com transporte (R$ ${transportExpenses.toFixed(2)}) estão altos. Considere transporte público, caronas compartilhadas ou trabalho remoto alguns dias da semana.`,
            category: 'spending',
            difficulty_level: 'beginner',
            priority: 'medium',
            is_automatic: true,
            reason: 'Gastos com transporte acima de 15% da renda',
            action_url: '/app/analytics',
            created_at: new Date().toISOString()
          });
        }
      }

      // 5. DICAS DE INVESTIMENTO
      const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
      if (totalInvested === 0 && currentIncome.length > 0) {
        const monthlyIncome = currentIncome.reduce((sum, t) => sum + Number(t.amount), 0);
        if (monthlyIncome > 2000) {
          tipsList.push({
            id: 'start-investing',
            title: '📈 Comece a Investir',
            content: `Você ainda não tem investimentos registrados. Com uma renda de R$ ${monthlyIncome.toFixed(2)}, considere começar com investimentos de baixo risco como Tesouro Direto ou CDB.`,
            category: 'investment',
            difficulty_level: profile?.risk_profile === 'conservative' ? 'beginner' : 'intermediate',
            priority: 'medium',
            is_automatic: true,
            reason: 'Não possui investimentos e tem renda suficiente',
            action_url: '/app/investments',
            created_at: new Date().toISOString()
          });
        }
      }

      // 6. DICAS BASEADAS NO PERFIL DE RISCO
      if (profile?.risk_profile === 'conservative' && totalInvested > 0) {
        tipsList.push({
          id: 'conservative-diversification',
          title: '🛡️ Diversifique com Segurança',
          content: 'Como você tem perfil conservador, considere diversificar entre Tesouro Direto, CDB e fundos de renda fixa. Mantenha sempre uma parte em aplicações de alta liquidez.',
          category: 'investment',
          difficulty_level: 'intermediate',
          priority: 'low',
          is_automatic: true,
          reason: 'Perfil conservador com investimentos',
          action_url: '/app/investments',
          created_at: new Date().toISOString()
        });
      }

      // 7. DICAS DE PLANEJAMENTO
      const currentMonthTransactions = transactions?.filter(t => 
        new Date(t.date) >= currentMonth && new Date(t.date) <= endOfMonth(currentDate)
      ) || [];

      if (currentMonthTransactions.length > 20) {
        tipsList.push({
          id: 'automate-finances',
          title: '⚙️ Automatize suas Finanças',
          content: `Você fez ${currentMonthTransactions.length} transações este mês. Considere automatizar pagamentos recorrentes e usar débito automático para contas fixas.`,
          category: 'general',
          difficulty_level: 'intermediate',
          priority: 'low',
          is_automatic: true,
          reason: 'Muitas transações manuais',
          action_url: '/app/settings',
          created_at: new Date().toISOString()
        });
      }

      return tipsList;
    } catch (error) {
      console.error('Erro ao gerar dicas inteligentes:', error);
      return [];
    }
  };

  const fetchTips = async () => {
    setLoading(true);
    try {
      // Gerar dicas automáticas
      const automaticTips = await generateIntelligentTips();

      // Buscar dicas manuais do banco
      const { data: manualTips } = await supabase
        .from('financial_tips')
        .select('*')
        .or(`is_public.eq.true,creator_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      const formattedManualTips: IntelligentTip[] = (manualTips || []).map(tip => {
        const allowedCategories = ['budgeting', 'saving', 'investment', 'emergency_fund', 'spending', 'general'] as const;
        const allowedLevels = ['beginner', 'intermediate', 'advanced'] as const;
        
        return {
          id: tip.id,
          title: tip.title,
          content: tip.content,
          category: allowedCategories.includes(tip.category as any) ? tip.category as IntelligentTip['category'] : 'general',
          difficulty_level: allowedLevels.includes(tip.difficulty_level as any) ? tip.difficulty_level as IntelligentTip['difficulty_level'] : 'beginner',
          priority: 'medium' as const,
          is_automatic: false,
          created_at: tip.created_at
        };
      });

      // Combinar e ordenar por prioridade e data
      const allTips = [...automaticTips, ...formattedManualTips]
        .sort((a, b) => {
          // Primeiro por prioridade
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          
          // Depois por data
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      setTips(allTips);
    } catch (error) {
      console.error('Erro ao buscar dicas:', error);
      setTips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && workspace) {
      fetchTips();
    } else {
      setTips([]);
      setLoading(false);
    }
  }, [user, workspace]);

  return {
    tips,
    loading,
    refetch: fetchTips
  };
}