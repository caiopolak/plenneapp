import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Lightbulb, TrendingUp, Target, AlertTriangle } from "lucide-react";

interface SmartTip {
  id: string;
  title: string;
  content: string;
  category: 'spending' | 'saving' | 'investment' | 'budget';
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export function SmartFinancialTips() {
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();

  const { data: userFinancialData } = useQuery({
    queryKey: ['user-financial-data', user?.id, workspace?.id],
    queryFn: async () => {
      if (!user) return null;

      // Buscar transações dos últimos 3 meses
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace?.id)
        .gte('date', threeMonthsAgo.toISOString().split('T')[0]);

      // Buscar metas
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace?.id);

      // Buscar orçamentos
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace?.id);

      return { transactions: transactions || [], goals: goals || [], budgets: budgets || [] };
    },
    enabled: !!user && !!workspace
  });

  const generateSmartTips = (): SmartTip[] => {
    if (!userFinancialData) return [];

    const tips: SmartTip[] = [];
    const { transactions, goals, budgets } = userFinancialData;

    // Análise de gastos
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const avgMonthlyExpense = totalExpenses / 3;

    // Análise por categoria
    const expensesByCategory = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const highestExpenseCategory = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)[0];

    if (highestExpenseCategory && highestExpenseCategory[1] > avgMonthlyExpense * 0.3) {
      tips.push({
        id: 'high-category-spending',
        title: 'Atenção aos gastos com ' + highestExpenseCategory[0],
        content: `Você gastou R$ ${highestExpenseCategory[1].toFixed(2)} com ${highestExpenseCategory[0]} nos últimos 3 meses. Considere revisar esses gastos e criar um orçamento específico para esta categoria.`,
        category: 'spending',
        priority: 'high',
        reason: 'Categoria representa mais de 30% dos gastos mensais'
      });
    }

    // Análise de receitas vs despesas
    const income = transactions.filter(t => t.type === 'income');
    const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0);
    const avgMonthlyIncome = totalIncome / 3;

    if (avgMonthlyExpense > avgMonthlyIncome * 0.8) {
      tips.push({
        id: 'high-expense-ratio',
        title: 'Taxa de gastos elevada',
        content: 'Seus gastos representam mais de 80% da sua renda. Considere reduzir gastos desnecessários e aumentar sua reserva de emergência.',
        category: 'budget',
        priority: 'high',
        reason: 'Relação gastos/renda acima do recomendado'
      });
    }

    // Análise de metas
    const activeGoals = goals.filter(g => Number(g.current_amount) < Number(g.target_amount));
    
    if (activeGoals.length > 0) {
      const goalProgress = activeGoals.map(g => ({
        name: g.name,
        progress: (Number(g.current_amount) / Number(g.target_amount)) * 100
      }));

      const slowGoals = goalProgress.filter(g => g.progress < 20);
      
      if (slowGoals.length > 0) {
        tips.push({
          id: 'slow-goal-progress',
          title: 'Acelere o progresso das suas metas',
          content: `Algumas metas como "${slowGoals[0].name}" estão com progresso lento. Considere criar aportes automáticos ou revisar os valores das metas.`,
          category: 'saving',
          priority: 'medium',
          reason: 'Metas com menos de 20% de progresso'
        });
      }
    }

    // Análise de orçamentos
    if (budgets.length === 0 && expenses.length > 10) {
      tips.push({
        id: 'create-budget',
        title: 'Crie orçamentos para suas categorias',
        content: 'Você tem várias transações mas ainda não definiu orçamentos. Criar orçamentos ajuda a controlar gastos e atingir objetivos financeiros.',
        category: 'budget',
        priority: 'medium',
        reason: 'Usuário ativo sem orçamentos definidos'
      });
    }

    // Dicas de investimento
    if (avgMonthlyIncome > avgMonthlyExpense && totalIncome > 5000) {
      const surplus = avgMonthlyIncome - avgMonthlyExpense;
      if (surplus > 500) {
        tips.push({
          id: 'investment-opportunity',
          title: 'Oportunidade de investimento',
          content: `Você tem uma sobra mensal de aproximadamente R$ ${surplus.toFixed(2)}. Considere investir parte desse valor para fazer seu dinheiro crescer.`,
          category: 'investment',
          priority: 'medium',
          reason: 'Sobra mensal significativa identificada'
        });
      }
    }

    return tips;
  };

  const smartTips = generateSmartTips();

  const getIcon = (category: string) => {
    switch (category) {
      case 'spending': return AlertTriangle;
      case 'saving': return Target;
      case 'investment': return TrendingUp;
      case 'budget': return Lightbulb;
      default: return Lightbulb;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (smartTips.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#f8961e]" />
            Dicas Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Continue registrando suas transações para receber dicas personalizadas!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[#f8961e]" />
          Dicas Inteligentes Baseadas no Seu Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {smartTips.map((tip) => {
          const Icon = getIcon(tip.category);
          return (
            <div
              key={tip.id}
              className="p-4 rounded-lg border-l-4 border-l-[#2f9e44] bg-gradient-to-r from-[#eaf6ee]/50 to-white"
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-[#2f9e44] mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-[#003f5c]">{tip.title}</h4>
                    <Badge variant={getPriorityColor(tip.priority) as any}>
                      {tip.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{tip.content}</p>
                  <p className="text-xs text-muted-foreground italic">
                    💡 {tip.reason}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}