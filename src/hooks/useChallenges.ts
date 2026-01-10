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
  category: string;
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

  // Gerar sugestões de desafios automáticos baseados nos dados financeiros
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
        .select('category, amount, type, description')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .gte('date', lastMonth.toISOString().split('T')[0]);

      if (!transactions || transactions.length === 0) return [];

      // Analisar gastos por categoria
      const categorySpending: Record<string, number> = {};
      let totalExpenses = 0;
      let totalIncome = 0;

      transactions.forEach(t => {
        if (t.type === 'expense') {
          const cat = t.category || 'Outros';
          categorySpending[cat] = (categorySpending[cat] || 0) + Number(t.amount);
          totalExpenses += Number(t.amount);
        } else {
          totalIncome += Number(t.amount);
        }
      });

      // Encontrar categoria com maior gasto
      const sortedCategories = Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a);

      // Desafio 1: Reduzir maior categoria de gasto em 20%
      if (sortedCategories.length > 0) {
        const [topCategory, topAmount] = sortedCategories[0];
        const targetReduction = topAmount * 0.2;
        
        suggestions.push({
          id: `reduce_${topCategory.toLowerCase().replace(/\s/g, '_')}`,
          title: `Reduza seus gastos com ${topCategory}`,
          description: `Você gastou R$ ${topAmount.toFixed(2)} em ${topCategory} no último mês. Desafie-se a reduzir 20% desse valor!`,
          target_amount: targetReduction,
          duration_days: 30,
          reason: `Baseado na análise das suas transações, ${topCategory} é sua maior categoria de gastos`,
          category: 'spending'
        });
      }

      // Desafio 2: Verificar se tem delivery/alimentação alta
      const deliveryKeywords = ['delivery', 'ifood', 'rappi', 'uber eats', 'restaurante'];
      const deliverySpending = transactions
        .filter(t => t.type === 'expense' && deliveryKeywords.some(k => 
          t.description?.toLowerCase().includes(k) || t.category?.toLowerCase().includes(k)
        ))
        .reduce((acc, t) => acc + Number(t.amount), 0);

      if (deliverySpending > 200) {
        suggestions.push({
          id: 'reduce_delivery',
          title: 'Desafio Zero Delivery por 2 semanas',
          description: `Você gastou R$ ${deliverySpending.toFixed(2)} com delivery/restaurantes. Experimente cozinhar em casa por 14 dias!`,
          target_amount: deliverySpending,
          duration_days: 14,
          reason: 'Delivery e restaurantes representam uma parcela significativa dos seus gastos',
          category: 'saving'
        });
      }

      // Desafio 3: Poupar baseado na taxa de economia
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
      
      if (savingsRate < 20) {
        const targetSavings = totalIncome * 0.1; // 10% da renda
        suggestions.push({
          id: 'save_10_percent',
          title: 'Poupe 10% da sua renda este mês',
          description: `Sua taxa de economia está em ${savingsRate.toFixed(1)}%. Vamos aumentar para pelo menos 10%!`,
          target_amount: targetSavings,
          duration_days: 30,
          reason: 'Especialistas recomendam poupar pelo menos 20% da renda',
          category: 'saving'
        });
      }

      // Desafio 4: Compras por impulso
      const impulseKeywords = ['shopping', 'shein', 'aliexpress', 'mercado livre', 'amazon', 'shopee'];
      const impulseSpending = transactions
        .filter(t => t.type === 'expense' && impulseKeywords.some(k => 
          t.description?.toLowerCase().includes(k)
        ))
        .reduce((acc, t) => acc + Number(t.amount), 0);

      if (impulseSpending > 300) {
        suggestions.push({
          id: 'no_impulse_buying',
          title: '7 dias sem compras online',
          description: 'Antes de comprar, espere 24h. Você vai perceber que muitas compras são por impulso!',
          target_amount: null,
          duration_days: 7,
          reason: `Você gastou R$ ${impulseSpending.toFixed(2)} em compras online no último mês`,
          category: 'spending'
        });
      }

      // Desafio 5: Reserva de emergência
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('name, current_amount, target_amount')
        .eq('workspace_id', workspace.id)
        .ilike('name', '%reserva%');

      const hasEmergencyFund = goals && goals.length > 0 && 
        goals.some(g => Number(g.current_amount) >= Number(g.target_amount) * 0.5);

      if (!hasEmergencyFund) {
        suggestions.push({
          id: 'emergency_fund',
          title: 'Comece sua reserva de emergência',
          description: 'Guarde R$ 500 em 45 dias para começar sua reserva de emergência.',
          target_amount: 500,
          duration_days: 45,
          reason: 'Você ainda não tem uma reserva de emergência configurada',
          category: 'emergency_fund'
        });
      }

      return suggestions;
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
      toast({ title: "Desafio criado com sucesso!" });
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
  const stats = {
    total: challenges.length,
    active: challenges.filter(c => c.status === 'active').length,
    completed: challenges.filter(c => c.status === 'completed').length,
    completionRate: challenges.length > 0 
      ? (challenges.filter(c => c.status === 'completed').length / challenges.length) * 100 
      : 0
  };

  return {
    challenges,
    isLoading,
    autoSuggestions,
    stats,
    createChallengeMutation,
    updateStatusMutation,
    deleteChallengeMutation,
    acceptSuggestion
  };
}
