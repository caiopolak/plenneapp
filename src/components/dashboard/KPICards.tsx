
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
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Receitas do Mês</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{formatCurrency(kpiData.totalIncome)}</div>
          <p className="text-xs text-green-700">Entradas registradas</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800">Despesas do Mês</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-900">{formatCurrency(kpiData.totalExpenses)}</div>
          <p className="text-xs text-red-700">Gastos registrados</p>
        </CardContent>
      </Card>

      <Card className={`bg-gradient-to-br ${kpiData.savings >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`text-sm font-medium ${kpiData.savings >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
            {kpiData.savings >= 0 ? 'Economia' : 'Déficit'}
          </CardTitle>
          <PiggyBank className={`h-4 w-4 ${kpiData.savings >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${kpiData.savings >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
            {formatCurrency(Math.abs(kpiData.savings))}
          </div>
          <p className={`text-xs ${kpiData.savings >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {kpiData.monthlyTrend > 0 ? '↗' : kpiData.monthlyTrend < 0 ? '↘' : '→'} 
            {Math.abs(kpiData.monthlyTrend).toFixed(1)}% vs mês anterior
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Progresso das Metas</CardTitle>
          <Target className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{kpiData.goalsProgress.toFixed(1)}%</div>
          <p className="text-xs text-purple-700">Das metas concluídas</p>
        </CardContent>
      </Card>
    </div>
  );
}
