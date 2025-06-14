
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendsChartCard } from './TrendsChartCard';
import { IncomeByCategoryChart } from './IncomeByCategoryChart';
import { ExpenseByCategoryChart } from './ExpenseByCategoryChart';
import { CategoryComparisonChart } from './CategoryComparisonChart';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

const COLORS = ['#003f5c', '#2f9e44', '#f8961e', '#d62828', '#6f42c1', '#20c997'];

export function FinancialCharts() {
  const [incomeByCategory, setIncomeByCategory] = useState<ChartData[]>([]);
  const [expenseByCategory, setExpenseByCategory] = useState<ChartData[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();

  const fetchChartData = async () => {
    if (!user) return;

    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case '1month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('type, amount, category, date')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      const incomeCategories: { [key: string]: number } = {};
      const expenseCategories: { [key: string]: number } = {};
      
      transactions?.forEach(transaction => {
        if (transaction.type === 'income') {
          incomeCategories[transaction.category] = (incomeCategories[transaction.category] || 0) + transaction.amount;
        } else {
          expenseCategories[transaction.category] = (expenseCategories[transaction.category] || 0) + transaction.amount;
        }
      });

      const incomeChartData = Object.entries(incomeCategories).map(([category, amount], index) => ({
        name: category,
        value: amount,
        color: COLORS[index % COLORS.length]
      }));

      const expenseChartData = Object.entries(expenseCategories).map(([category, amount], index) => ({
        name: category,
        value: amount,
        color: COLORS[index % COLORS.length]
      }));

      const monthlyData: { [key: string]: { income: number; expense: number } } = {};
      
      transactions?.forEach(transaction => {
        const monthKey = transaction.date.substring(0, 7); // YYYY-MM format
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expense: 0 };
        }
        
        if (transaction.type === 'income') {
          monthlyData[monthKey].income += transaction.amount;
        } else {
          monthlyData[monthKey].expense += transaction.amount;
        }
      });

      const monthlyTrendData = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
          month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          income: data.income,
          expense: data.expense
        }));

      setIncomeByCategory(incomeChartData);
      setExpenseByCategory(expenseChartData);
      setMonthlyTrend(monthlyTrendData);

    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
    // eslint-disable-next-line
  }, [user, selectedPeriod]);

  if (loading) {
    return <div className="py-10 text-lg text-[--primary] animate-pulse">Carregando gráficos...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end items-start gap-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-[--primary]">Análises Gráficas</h2>
        <div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-44 bg-white/90 border-gray-200 rounded">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Último mês</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="1year">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <TrendsChartCard data={monthlyTrend} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <IncomeByCategoryChart data={incomeByCategory} />
        <ExpenseByCategoryChart data={expenseByCategory} />
      </div>

      <CategoryComparisonChart data={[...incomeByCategory, ...expenseByCategory]} />
    </div>
  );
}
