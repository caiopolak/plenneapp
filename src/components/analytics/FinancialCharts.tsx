
import React from "react";
import { ExpenseByCategoryChart } from "./ExpenseByCategoryChart";
import { IncomeByCategoryChart } from "./IncomeByCategoryChart";
import { TrendsChart } from "./TrendsChart";
import { CategoryComparisonChart } from "./CategoryComparisonChart";
import { TrendsBarChart } from "./TrendsBarChart";
import { PeriodOption, getPeriodDates } from "@/components/dashboard/PeriodFilter";
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FinancialChartsProps {
  period?: PeriodOption;
}

export function FinancialCharts({ period = '1month' }: FinancialChartsProps) {
  const { startDate, endDate } = getPeriodDates(period);
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();

  // Buscar dados para os gráficos
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['chart-data', user?.id, workspace?.id, startDate, endDate],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data: transactions } = await supabase
        .from('transactions')
        .select('type, amount, category, date')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace?.id)
        .gte('date', startDate)
        .lte('date', endDate);

      // Processar dados para receitas por categoria
      const incomeData = transactions
        ?.filter(t => t.type === 'income')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {} as Record<string, number>);

      const incomeChartData = Object.entries(incomeData || {}).map(([name, value]) => ({
        name,
        value
      }));

      // Processar dados para despesas por categoria
      const expenseData = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {} as Record<string, number>);

      const expenseChartData = Object.entries(expenseData || {}).map(([name, value]) => ({
        name,
        value
      }));

      // Processar dados para comparação de categorias
      const allCategories = [...Object.keys(incomeData || {}), ...Object.keys(expenseData || {})];
      const uniqueCategories = [...new Set(allCategories)];
      
      const categoryComparisonData = uniqueCategories.map(category => ({
        name: category,
        value: (incomeData?.[category] || 0) + (expenseData?.[category] || 0)
      }));

      // Processar dados para tendências (por mês)
      const monthlyData = transactions?.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        if (!acc[month]) {
          acc[month] = { month, income: 0, expense: 0 };
        }
        if (t.type === 'income') {
          acc[month].income += Number(t.amount);
        } else {
          acc[month].expense += Number(t.amount);
        }
        return acc;
      }, {} as Record<string, { month: string; income: number; expense: number }>);

      const trendsData = Object.values(monthlyData || {});

      return {
        incomeChartData,
        expenseChartData,
        categoryComparisonData,
        trendsData
      };
    },
    enabled: !!user && !!workspace
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 bg-muted rounded-xl animate-pulse"></div>
          <div className="h-80 bg-muted rounded-xl animate-pulse"></div>
        </div>
        <div className="h-80 bg-muted rounded-xl animate-pulse"></div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 bg-muted rounded-xl animate-pulse"></div>
          <div className="h-80 bg-muted rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gráficos de pizza - receitas e despesas por categoria */}
      <div className="grid gap-6 md:grid-cols-2">
        <IncomeByCategoryChart data={chartData?.incomeChartData || []} />
        <ExpenseByCategoryChart data={chartData?.expenseChartData || []} />
      </div>

      {/* Gráfico de tendências ao longo do tempo */}
      <TrendsChart data={chartData?.trendsData || []} />

      {/* Gráficos de comparação */}
      <div className="grid gap-6 md:grid-cols-2">
        <CategoryComparisonChart data={chartData?.categoryComparisonData || []} />
        <TrendsBarChart data={chartData?.trendsData || []} />
      </div>
    </div>
  );
}
