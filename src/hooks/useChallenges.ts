import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";

export interface Challenge {
  id: string;
  user_id: string | null;
  workspace_id: string | null;
  creator_id: string | null;
  title: string;
  description: string | null;
  target_amount: number | null;
  duration_days: number;
  status: 'active' | 'completed' | 'paused' | 'failed';
  started_at: string | null;
  completed_at: string | null;
  is_automatic: boolean;
  created_at: string;
}

export interface AutoChallengeSuggestion {
  id: string;
  title: string;
  description: string;
  target_amount: number | null;
  duration_days: number;
  reason: string;
  category: 'spending' | 'saving' | 'investment' | 'habit' | 'emergency_fund' | 'debt';
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  reward_text: string;
}

export function useChallenges() {
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar desafios do usuário - FILTRA POR WORKSPACE
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges', user?.id, workspace?.id],
    queryFn: async () => {
      if (!user || !workspace?.id) return [];

      const { data, error } = await supabase
        .from('financial_challenges')
        .select('*')
        .eq('workspace_id', workspace.id)
        .or(`user_id.eq.${user.id},creator_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Challenge[];
    },
    enabled: !!user && !!workspace?.id
  });

  // Gerar sugestões de desafios automáticos baseados nos dados financeiros - V2.0
  const { data: autoSuggestions = [] } = useQuery({
    queryKey: ['auto-challenges-suggestions', user?.id, workspace?.id],
    queryFn: async (): Promise<AutoChallengeSuggestion[]> => {
      if (!user || !workspace) return [];

      const suggestions: AutoChallengeSuggestion[] = [];

      // Buscar transações do último mês
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('category, amount, type, description, date')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .gte('date', lastMonth.toISOString().split('T')[0]);

      if (!transactions || transactions.length === 0) {
        // Desafio para iniciantes
        suggestions.push({
          id: 'first_transaction',
          title: '🚀 Registre sua primeira transação',
          description: 'Comece a controlar suas finanças registrando seus gastos e receitas.',
          target_amount: null,
          duration_days: 7,
          reason: 'Você ainda não tem transações registradas',
          category: 'habit',
          difficulty: 'easy',
          icon: '🎯',
          reward_text: 'Desbloqueie insights personalizados!'
        });
        return suggestions;
      }

      // Analisar gastos por categoria
      const categorySpending: Record<string, number> = {};
      let totalExpenses = 0;
      let totalIncome = 0;
      const weekdaySpending: Record<number, number> = {};

      transactions.forEach(t => {
        if (t.type === 'expense') {
          const cat = t.category || 'Outros';
          categorySpending[cat] = (categorySpending[cat] || 0) + Number(t.amount);
          totalExpenses += Number(t.amount);
          
          // Analisar por dia da semana
          const dayOfWeek = new Date(t.date).getDay();
          weekdaySpending[dayOfWeek] = (weekdaySpending[dayOfWeek] || 0) + Number(t.amount);
        } else {
          totalIncome += Number(t.amount);
        }
      });

      // Encontrar categoria com maior gasto
      const sortedCategories = Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a);

      // ===== DESAFIO 1: Reduzir maior categoria de gasto =====
      if (sortedCategories.length > 0) {
        const [topCategory, topAmount] = sortedCategories[0];
        const targetReduction = topAmount * 0.2;
        const percentage = ((topAmount / totalExpenses) * 100).toFixed(0);
        
        const percentageNum = parseFloat(percentage);
        suggestions.push({
          id: `reduce_${topCategory.toLowerCase().replace(/\s/g, '_')}`,
          title: `🎯 Reduza ${topCategory} em 20%`,
          description: `${topCategory} representa ${percentage}% dos seus gastos (R$ ${topAmount.toFixed(2)}). Economize R$ ${targetReduction.toFixed(2)}!`,
          target_amount: targetReduction,
          duration_days: 30,
          reason: `${topCategory} é sua maior categoria de gastos`,
          category: 'spending',
          difficulty: percentageNum > 30 ? 'hard' : 'medium',
          icon: '📉',
          reward_text: `Economize R$ ${targetReduction.toFixed(2)} por mês!`
        });
      }

      // ===== DESAFIO 2: Delivery/Alimentação =====
      const deliveryKeywords = ['delivery', 'ifood', 'rappi', 'uber eats', 'restaurante', 'lanchonete', 'fast food'];
      const deliverySpending = transactions
        .filter(t => t.type === 'expense' && deliveryKeywords.some(k => 
          t.description?.toLowerCase().includes(k) || t.category?.toLowerCase().includes(k)
        ))
        .reduce((acc, t) => acc + Number(t.amount), 0);

      if (deliverySpending > 150) {
        suggestions.push({
          id: 'reduce_delivery',
          title: '🍳 Desafio: Cozinhe em Casa',
          description: `Você gastou R$ ${deliverySpending.toFixed(2)} com delivery/restaurantes. Cozinhe em casa por 14 dias!`,
          target_amount: deliverySpending * 0.7,
          duration_days: 14,
          reason: 'Delivery representa um gasto significativo',
          category: 'saving',
          difficulty: 'medium',
          icon: '🍳',
          reward_text: `Economize até R$ ${(deliverySpending * 0.7).toFixed(2)}!`
        });
      }

      // ===== DESAFIO 3: Taxa de Poupança =====
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
      
      if (savingsRate < 15) {
        const targetSavings = totalIncome * 0.15;
        suggestions.push({
          id: 'improve_savings',
          title: '💰 Poupe 15% da Renda',
          description: `Sua taxa de economia está em ${savingsRate.toFixed(1)}%. Aumente para 15% poupando R$ ${targetSavings.toFixed(2)}!`,
          target_amount: targetSavings,
          duration_days: 30,
          reason: 'Taxa de poupança abaixo do recomendado',
          category: 'saving',
          difficulty: savingsRate < 5 ? 'hard' : 'medium',
          icon: '🏦',
          reward_text: 'Construa um futuro financeiro sólido!'
        });
      }

      // ===== DESAFIO 4: Compras por Impulso =====
      const impulseKeywords = ['shopping', 'shein', 'aliexpress', 'mercado livre', 'amazon', 'shopee', 'magalu', 'americanas'];
      const impulseSpending = transactions
        .filter(t => t.type === 'expense' && impulseKeywords.some(k => 
          t.description?.toLowerCase().includes(k)
        ))
        .reduce((acc, t) => acc + Number(t.amount), 0);

      if (impulseSpending > 200) {
        suggestions.push({
          id: 'no_impulse',
          title: '🛑 7 Dias Sem Compras Online',
          description: `Você gastou R$ ${impulseSpending.toFixed(2)} em e-commerce. Pause as compras por 7 dias!`,
          target_amount: null,
          duration_days: 7,
          reason: 'Muitas compras online detectadas',
          category: 'habit',
          difficulty: 'easy',
          icon: '🛒',
          reward_text: 'Evite compras por impulso!'
        });
      }

      // ===== DESAFIO 5: Fins de Semana Caros =====
      const weekendSpending = (weekdaySpending[0] || 0) + (weekdaySpending[6] || 0);
      const weekdayTotal = Object.entries(weekdaySpending)
        .filter(([day]) => day !== '0' && day !== '6')
        .reduce((sum, [, val]) => sum + val, 0);
      
      if (weekendSpending > weekdayTotal * 0.5) {
        suggestions.push({
          id: 'frugal_weekend',
          title: '📅 Fim de Semana Econômico',
          description: `Você gasta muito nos fins de semana (R$ ${weekendSpending.toFixed(2)}). Tente um fim de semana sem gastar!`,
          target_amount: weekendSpending * 0.8,
          duration_days: 3,
          reason: 'Gastos elevados nos fins de semana',
          category: 'spending',
          difficulty: 'easy',
          icon: '🌞',
          reward_text: 'Descubra diversões gratuitas!'
        });
      }

      // ===== DESAFIO 6: Reserva de Emergência =====
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('name, current_amount, target_amount')
        .eq('workspace_id', workspace.id)
        .or(`name.ilike.%reserva%,name.ilike.%emergência%,name.ilike.%emergencia%`);

      const hasEmergencyFund = goals && goals.length > 0 && 
        goals.some(g => Number(g.current_amount) >= Number(g.target_amount) * 0.5);

      if (!hasEmergencyFund) {
        const suggestedAmount = totalExpenses > 0 ? totalExpenses * 0.1 : 500;
        suggestions.push({
          id: 'emergency_fund',
          title: '🛡️ Inicie sua Reserva de Emergência',
          description: `Guarde R$ ${suggestedAmount.toFixed(2)} em 30 dias para começar sua reserva de segurança.`,
          target_amount: suggestedAmount,
          duration_days: 30,
          reason: 'Você ainda não tem reserva de emergência',
          category: 'emergency_fund',
          difficulty: 'medium',
          icon: '🛡️',
          reward_text: 'Tenha paz financeira!'
        });
      }

      // ===== DESAFIO 7: Assinaturas =====
      const subscriptionKeywords = ['netflix', 'spotify', 'amazon prime', 'disney', 'hbo', 'globoplay', 'deezer', 'youtube premium', 'apple'];
      const subscriptionSpending = transactions
        .filter(t => t.type === 'expense' && subscriptionKeywords.some(k => 
          t.description?.toLowerCase().includes(k) || t.category?.toLowerCase().includes('assinatura')
        ))
        .reduce((acc, t) => acc + Number(t.amount), 0);

      if (subscriptionSpending > 100) {
        suggestions.push({
          id: 'review_subscriptions',
          title: '📺 Revise suas Assinaturas',
          description: `Você gasta R$ ${subscriptionSpending.toFixed(2)} em assinaturas. Cancele as que não usa!`,
          target_amount: subscriptionSpending * 0.3,
          duration_days: 7,
          reason: 'Muitas assinaturas ativas',
          category: 'spending',
          difficulty: 'easy',
          icon: '📱',
          reward_text: `Economize até R$ ${(subscriptionSpending * 0.3).toFixed(2)}/mês!`
        });
      }

      // ===== DESAFIO 8: Sem Gastar Nada =====
      if (totalExpenses > 0) {
        suggestions.push({
          id: 'no_spend_day',
          title: '🚫 Dia Zero Gasto',
          description: 'Passe 24 horas sem gastar absolutamente nada. Planeje com antecedência!',
          target_amount: null,
          duration_days: 1,
          reason: 'Desenvolva consciência sobre gastos',
          category: 'habit',
          difficulty: 'easy',
          icon: '💪',
          reward_text: 'Prove que você controla seu dinheiro!'
        });
      }

      // ===== DESAFIO 9: Investir pela Primeira Vez =====
      const { data: investments } = await supabase
        .from('investments')
        .select('id')
        .eq('workspace_id', workspace.id)
        .limit(1);

      if (!investments || investments.length === 0) {
        suggestions.push({
          id: 'first_investment',
          title: '📈 Faça seu Primeiro Investimento',
          description: 'Invista qualquer valor em renda fixa ou Tesouro Direto. Comece pequeno!',
          target_amount: 100,
          duration_days: 30,
          reason: 'Você ainda não possui investimentos',
          category: 'investment',
          difficulty: 'medium',
          icon: '📈',
          reward_text: 'Comece a fazer seu dinheiro trabalhar!'
        });
      }

      // ===== DESAFIO 10: Café Consciente =====
      const coffeeKeywords = ['café', 'starbucks', 'cafeteria', 'coffee'];
      const coffeeSpending = transactions
        .filter(t => t.type === 'expense' && coffeeKeywords.some(k => 
          t.description?.toLowerCase().includes(k)
        ))
        .reduce((acc, t) => acc + Number(t.amount), 0);

      if (coffeeSpending > 80) {
        suggestions.push({
          id: 'coffee_challenge',
          title: '☕ Café de Casa por 2 Semanas',
          description: `Você gastou R$ ${coffeeSpending.toFixed(2)} em cafés fora. Leve de casa por 14 dias!`,
          target_amount: coffeeSpending * 0.8,
          duration_days: 14,
          reason: 'Gastos frequentes com café fora de casa',
          category: 'habit',
          difficulty: 'easy',
          icon: '☕',
          reward_text: `Economize R$ ${(coffeeSpending * 0.8).toFixed(2)}!`
        });
      }

      // Ordenar por relevância (dificuldade + economia potencial)
      return suggestions.sort((a, b) => {
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        const aSavings = a.target_amount || 0;
        const bSavings = b.target_amount || 0;
        
        // Priorizar fáceis com boa economia
        const aScore = (aSavings / 100) - difficultyOrder[a.difficulty];
        const bScore = (bSavings / 100) - difficultyOrder[b.difficulty];
        
        return bScore - aScore;
      }).slice(0, 5); // Limitar a 5 sugestões
    },
    enabled: !!user && !!workspace,
    staleTime: 5 * 60 * 1000 // 5 minutos
  });

  // Criar desafio
  const createChallengeMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      target_amount?: number | null;
      duration_days: number;
      is_automatic?: boolean;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('financial_challenges')
        .insert([{
          user_id: user.id,
          creator_id: user.id,
          workspace_id: workspace?.id,
          title: data.title,
          description: data.description,
          target_amount: data.target_amount || null,
          duration_days: data.duration_days,
          status: 'active',
          started_at: new Date().toISOString(),
          is_automatic: data.is_automatic || false
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast({ title: "🏆 Desafio aceito!", description: "Boa sorte! Você consegue!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao criar desafio", description: error.message, variant: "destructive" });
    }
  });

  // Atualizar status do desafio
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Challenge['status'] }) => {
      const updates: any = { status };
      
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('financial_challenges')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      if (variables.status === 'completed') {
        toast({ title: "🎉 Parabéns!", description: "Desafio concluído com sucesso!" });
      } else {
        toast({ title: "Desafio atualizado" });
      }
    }
  });

  // Deletar desafio
  const deleteChallengeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('financial_challenges')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast({ title: "Desafio removido" });
    }
  });

  // Aceitar sugestão automática
  const acceptSuggestion = async (suggestion: AutoChallengeSuggestion) => {
    await createChallengeMutation.mutateAsync({
      title: suggestion.title,
      description: suggestion.description,
      target_amount: suggestion.target_amount,
      duration_days: suggestion.duration_days,
      is_automatic: true
    });
  };

  // Estatísticas de desafios
  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');
  
  const stats = {
    total: challenges.length,
    active: activeChallenges.length,
    completed: completedChallenges.length,
    failed: challenges.filter(c => c.status === 'failed').length,
    completionRate: challenges.length > 0 
      ? (completedChallenges.length / challenges.length) * 100 
      : 0,
    streak: calculateStreak(completedChallenges),
    totalSaved: calculateTotalSaved(completedChallenges)
  };

  return {
    challenges,
    isLoading,
    autoSuggestions,
    stats,
    activeChallenges,
    completedChallenges,
    createChallengeMutation,
    updateStatusMutation,
    deleteChallengeMutation,
    acceptSuggestion
  };
}

// Calcular sequência de desafios completados
function calculateStreak(completedChallenges: Challenge[]): number {
  if (completedChallenges.length === 0) return 0;
  
  const sorted = [...completedChallenges].sort(
    (a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
  );
  
  let streak = 0;
  let lastDate = new Date();
  
  for (const challenge of sorted) {
    if (!challenge.completed_at) continue;
    
    const completedDate = new Date(challenge.completed_at);
    const daysDiff = Math.floor((lastDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) { // Permite até 7 dias entre desafios para manter streak
      streak++;
      lastDate = completedDate;
    } else {
      break;
    }
  }
  
  return streak;
}

// Calcular total economizado em desafios completados
function calculateTotalSaved(completedChallenges: Challenge[]): number {
  return completedChallenges
    .filter(c => c.target_amount)
    .reduce((sum, c) => sum + Number(c.target_amount || 0), 0);
}
