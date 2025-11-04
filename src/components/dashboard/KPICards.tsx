
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, PiggyBank } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface KPIData {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  goalsProgress: number;
  monthlyTrend: number;
}

export function KPICards() {
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();

  const { data: kpiData, isLoading } = useQuery({
    queryKey: ['kpi-data', user?.id, workspace?.id],
    queryFn: async (): Promise<KPIData> => {
      if (!user) throw new Error('User not authenticated');

      // Data do mês atual
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
      const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

      // Buscar transações do mês atual
      const { data: currentTransactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace?.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);

      // Buscar transações do mês anterior para comparação
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const startOfPreviousMonth = `${previousYear}-${previousMonth.toString().padStart(2, '0')}-01`;
      const endOfPreviousMonth = new Date(previousYear, previousMonth, 0).toISOString().split('T')[0];

      const { data: previousTransactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace?.id)
        .gte('date', startOfPreviousMonth)
        .lte('date', endOfPreviousMonth);

      // Buscar metas
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('target_amount, current_amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace?.id);

      // Calcular KPIs
      const totalIncome = currentTransactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalExpenses = currentTransactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const savings = totalIncome - totalExpenses;

      const previousIncome = previousTransactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const previousExpenses = previousTransactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const previousSavings = previousIncome - previousExpenses;

      const monthlyTrend = previousSavings === 0 ? 0 : ((savings - previousSavings) / previousSavings) * 100;

      const totalGoalsTarget = goals?.reduce((sum, g) => sum + Number(g.target_amount), 0) || 0;
      const totalGoalsCurrent = goals?.reduce((sum, g) => sum + Number(g.current_amount || 0), 0) || 0;
      const goalsProgress = totalGoalsTarget === 0 ? 0 : (totalGoalsCurrent / totalGoalsTarget) * 100;

      return {
        totalIncome,
        totalExpenses,
        savings,
        goalsProgress,
        monthlyTrend
      };
    },
    enabled: !!user && !!workspace
  });

  if (isLoading || !kpiData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-[hsl(var(--card-success-bg))] border-[hsl(var(--card-success-border))]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[hsl(var(--card-success-text))]">Receitas do Mês</CardTitle>
          <TrendingUp className="h-4 w-4 text-[hsl(var(--card-success-accent))]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[hsl(var(--card-success-text))]">{formatCurrency(kpiData.totalIncome)}</div>
          <p className="text-xs text-[hsl(var(--card-success-text))] opacity-70">Entradas registradas</p>
        </CardContent>
      </Card>

      <Card className="bg-[hsl(var(--card-error-bg))] border-[hsl(var(--card-error-border))]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[hsl(var(--card-error-text))]">Despesas do Mês</CardTitle>
          <TrendingDown className="h-4 w-4 text-[hsl(var(--card-error-accent))]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[hsl(var(--card-error-text))]">{formatCurrency(kpiData.totalExpenses)}</div>
          <p className="text-xs text-[hsl(var(--card-error-text))] opacity-70">Gastos registrados</p>
        </CardContent>
      </Card>

      <Card className={`${kpiData.savings >= 0 ? 'bg-[hsl(var(--card-info-bg))] border-[hsl(var(--card-info-border))]' : 'bg-[hsl(var(--card-warning-bg))] border-[hsl(var(--card-warning-border))]'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`text-sm font-medium ${kpiData.savings >= 0 ? 'text-[hsl(var(--card-info-text))]' : 'text-[hsl(var(--card-warning-text))]'}`}>
            {kpiData.savings >= 0 ? 'Economia' : 'Déficit'}
          </CardTitle>
          <PiggyBank className={`h-4 w-4 ${kpiData.savings >= 0 ? 'text-[hsl(var(--card-info-accent))]' : 'text-[hsl(var(--card-warning-accent))]'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${kpiData.savings >= 0 ? 'text-[hsl(var(--card-info-text))]' : 'text-[hsl(var(--card-warning-text))]'}`}>
            {formatCurrency(Math.abs(kpiData.savings))}
          </div>
          <p className={`text-xs ${kpiData.savings >= 0 ? 'text-[hsl(var(--card-info-text))]' : 'text-[hsl(var(--card-warning-text))]'} opacity-70`}>
            {kpiData.monthlyTrend > 0 ? '↗' : kpiData.monthlyTrend < 0 ? '↘' : '→'} 
            {Math.abs(kpiData.monthlyTrend).toFixed(1)}% vs mês anterior
          </p>
        </CardContent>
      </Card>

      <Card className="bg-[hsl(var(--card-primary-bg))] border-[hsl(var(--card-primary-border))]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[hsl(var(--card-primary-text))]">Progresso das Metas</CardTitle>
          <Target className="h-4 w-4 text-[hsl(var(--card-primary-accent))]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[hsl(var(--card-primary-text))]">{kpiData.goalsProgress.toFixed(1)}%</div>
          <p className="text-xs text-[hsl(var(--card-primary-text))] opacity-70">Das metas concluídas</p>
        </CardContent>
      </Card>
    </div>
  );
}
