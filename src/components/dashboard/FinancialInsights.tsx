
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface InsightData {
  type: 'success' | 'warning' | 'info' | 'tip';
  icon: React.ReactNode;
  title: string;
  message: string;
  color: string;
}

export function FinancialInsights() {
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['financial-insights', user?.id, workspace?.id],
    queryFn: async (): Promise<InsightData[]> => {
      if (!user) throw new Error('User not authenticated');

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
      const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

      // Buscar dados para insights
      const [transactionsResult, goalsResult, investmentsResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('type, amount, category')
          .eq('user_id', user.id)
          .eq('workspace_id', workspace?.id)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth),
        
        supabase
          .from('financial_goals')
          .select('name, target_amount, current_amount, target_date')
          .eq('user_id', user.id)
          .eq('workspace_id', workspace?.id),
        
        supabase
          .from('investments')
          .select('amount, expected_return')
          .eq('user_id', user.id)
          .eq('workspace_id', workspace?.id)
      ]);

      const transactions = transactionsResult.data || [];
      const goals = goalsResult.data || [];
      const investments = investmentsResult.data || [];

      const insights: InsightData[] = [];

      // Análise de receitas vs despesas
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
      const savings = totalIncome - totalExpenses;

      if (savings > 0) {
        const savingsRate = (savings / totalIncome) * 100;
        if (savingsRate >= 20) {
          insights.push({
            type: 'success',
            icon: <CheckCircle className="h-4 w-4" />,
            title: 'Excelente economia!',
            message: `Você economizou ${savingsRate.toFixed(1)}% da sua renda este mês. Continue assim!`,
            color: 'bg-[hsl(var(--card-success-bg))] text-[hsl(var(--card-success-text))] border-[hsl(var(--card-success-border))]'
          });
        } else if (savingsRate >= 10) {
          insights.push({
            type: 'info',
            icon: <TrendingUp className="h-4 w-4" />,
            title: 'Boa economia',
            message: `Taxa de economia de ${savingsRate.toFixed(1)}%. Tente chegar aos 20% recomendados.`,
            color: 'bg-[hsl(var(--card-info-bg))] text-[hsl(var(--card-info-text))] border-[hsl(var(--card-info-border))]'
          });
        }
      } else {
        insights.push({
          type: 'warning',
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'Atenção ao orçamento',
          message: `Suas despesas superaram as receitas em R$ ${Math.abs(savings).toFixed(2)} este mês.`,
          color: 'bg-[hsl(var(--card-warning-bg))] text-[hsl(var(--card-warning-text))] border-[hsl(var(--card-warning-border))]'
        });
      }

      // Análise de categoria com maior gasto
      const expensesByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {} as Record<string, number>);

      const topExpenseCategory = Object.entries(expensesByCategory)
        .sort(([,a], [,b]) => b - a)[0];

      if (topExpenseCategory) {
        const [category, amount] = topExpenseCategory;
        const percentage = (amount / totalExpenses) * 100;
        if (percentage > 40) {
          insights.push({
            type: 'tip',
            icon: <Lightbulb className="h-4 w-4" />,
            title: 'Revise seus gastos',
            message: `${percentage.toFixed(1)}% dos seus gastos são com "${category}". Considere otimizar esta categoria.`,
            color: 'bg-[hsl(var(--card-warning-bg))] text-[hsl(var(--card-warning-text))] border-[hsl(var(--card-warning-border))]'
          });
        }
      }

      // Análise de metas próximas do prazo
      const goalsNearDeadline = goals.filter(goal => {
        if (!goal.target_date) return false;
        const deadlineDate = new Date(goal.target_date);
        const today = new Date();
        const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return daysUntilDeadline <= 30 && daysUntilDeadline > 0;
      });

      if (goalsNearDeadline.length > 0) {
        insights.push({
          type: 'info',
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'Metas próximas do prazo',
          message: `Você tem ${goalsNearDeadline.length} meta(s) com prazo nos próximos 30 dias.`,
          color: 'bg-[hsl(var(--card-info-bg))] text-[hsl(var(--card-info-text))] border-[hsl(var(--card-info-border))]'
        });
      }

      // Análise de investimentos
      const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
      if (totalInvested > 0 && totalIncome > 0) {
        const investmentRate = (totalInvested / (totalIncome * 12)) * 100; // Assumindo renda anual
        if (investmentRate < 10) {
          insights.push({
            type: 'tip',
            icon: <Lightbulb className="h-4 w-4" />,
            title: 'Considere investir mais',
            message: 'Experts recomendam investir pelo menos 10% da renda. Que tal aumentar seus investimentos?',
            color: 'bg-[hsl(var(--card-warning-bg))] text-[hsl(var(--card-warning-text))] border-[hsl(var(--card-warning-border))]'
          });
        }
      }

      return insights.slice(0, 4); // Mostrar no máximo 4 insights
    },
    enabled: !!user && !!workspace
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Continue registrando suas transações para receber insights personalizados!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Insights Financeiros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className={`p-3 rounded-lg border ${insight.color}`}>
              <div className="flex items-start gap-2">
                {insight.icon}
                <div>
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <p className="text-xs mt-1">{insight.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
