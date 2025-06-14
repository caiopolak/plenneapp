
import React, { useState, useEffect } from 'react';
import { FinancialSummaryCard } from './FinancialSummaryCard';
import { GoalProgressCard } from './GoalProgressCard';
import { FinancialAlertsCard } from './FinancialAlertsCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FinancialData {
  totalIncome: number;
  totalExpense: number;
  totalInvestments: number;
  totalGoals: number;
  completedGoals: number;
  monthlyTransactions: number;
}

export function FinancialSummary() {
  const [data, setData] = useState<FinancialData>({
    totalIncome: 0,
    totalExpense: 0,
    totalInvestments: 0,
    totalGoals: 0,
    completedGoals: 0,
    monthlyTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFinancialData = async () => {
    if (!user) return;

    try {
      // Fetch transactions for current month
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .gte('date', firstDayOfMonth.toISOString().split('T')[0])
        .lte('date', lastDayOfMonth.toISOString().split('T')[0]);

      if (transactionsError) throw transactionsError;

      // Fetch investments
      const { data: investments, error: investmentsError } = await supabase
        .from('investments')
        .select('amount')
        .eq('user_id', user.id);

      if (investmentsError) throw investmentsError;

      // Fetch goals
      const { data: goals, error: goalsError } = await supabase
        .from('financial_goals')
        .select('target_amount, current_amount')
        .eq('user_id', user.id);

      if (goalsError) throw goalsError;

      // Calculate totals
      const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalExpense = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalInvestments = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
      const totalGoals = goals?.length || 0;
      const completedGoals = goals?.filter(g => g.current_amount >= g.target_amount).length || 0;
      const monthlyTransactions = transactions?.length || 0;

      setData({
        totalIncome,
        totalExpense,
        totalInvestments,
        totalGoals,
        completedGoals,
        monthlyTransactions
      });

    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [user]);

  const balance = data.totalIncome - data.totalExpense;
  const goalsProgress = data.totalGoals > 0 ? (data.completedGoals / data.totalGoals) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-lg font-medium text-[--primary] animate-pulse">
        Carregando dados financeiros...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <FinancialSummaryCard
        balance={balance}
        totalIncome={data.totalIncome}
        totalExpense={data.totalExpense}
        totalInvestments={data.totalInvestments}
        monthlyTransactions={data.monthlyTransactions}
      />
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GoalProgressCard
          completedGoals={data.completedGoals}
          totalGoals={data.totalGoals}
          goalsProgress={goalsProgress}
        />
        <FinancialAlertsCard
          balance={balance}
          totalGoals={data.totalGoals}
        />
      </section>
    </div>
  );
}
