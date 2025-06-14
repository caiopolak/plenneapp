import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, PiggyBank } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FinancialSummaryCard } from './FinancialSummaryCard';

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
      {/* Progresso de Metas + Dica */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow border border-yellow-200 px-6 py-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🎯</span>
            <span className="font-bold text-yellow-700">Progresso das Metas</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-xl font-bold">{data.completedGoals} / {data.totalGoals} metas</div>
            {goalsProgress === 100 && data.totalGoals > 0 && (
              <span className="inline-block bg-green-200 text-green-900 rounded px-3 py-1 text-xs font-bold animate-pulse">Tudo concluído! 🏅</span>
            )}
            {goalsProgress >= 70 && goalsProgress < 100 && (
              <span className="inline-block bg-yellow-100 text-yellow-800 rounded px-3 py-1 text-xs font-bold">Quase lá!</span>
            )}
            {goalsProgress < 70 && data.totalGoals > 0 && (
              <span className="inline-block bg-gray-100 text-gray-500 rounded px-3 py-1 text-xs font-bold">Continue focado</span>
            )}
          </div>
          <div className="mt-4 mb-1 w-full bg-gray-100 rounded">
            <div
              className="bg-yellow-400 h-2 rounded transition-all"
              style={{ width: `${goalsProgress}%`, minWidth: 12, maxWidth: "100%" }}
            ></div>
          </div>
          <div className="text-xs mt-1 text-yellow-900">{goalsProgress.toFixed(0)}% das metas concluídas</div>
        </div>

        {/* Dicas & Alertas */}
        <div className="bg-gradient-to-bl from-[#e8f3f1] to-[#FFFDF0] border border-blue-200 rounded-xl shadow px-6 py-5">
          <div className="flex items-center gap-2">
            {balance < 0 ? (
              <span className="bg-red-100 rounded-full p-2 mr-2"><svg width="25" height="25"><circle cx="12" cy="12" r="12" fill="#fee2e2"/><text x="12" y="18" fontSize="16" textAnchor="middle" fill="#ef4444">!</text></svg></span>
            ) : (
              <span className="bg-green-100 rounded-full p-2 mr-2"><svg width="25" height="25"><circle cx="12" cy="12" r="12" fill="#d1fae5"/><text x="12" y="18" fontSize="16" textAnchor="middle" fill="#22c55e">✓</text></svg></span>
            )}
            <span className={`font-semibold ${balance < 0 ? "text-red-700" : "text-green-700"} text-base`}>
              {balance < 0 ? "Alerta Finanzas" : "Parabéns!"}
            </span>
          </div>
          <div className={`mt-2 text-sm ${balance < 0 ? "text-red-700 font-medium" : "text-green-800"}`}>
            {balance < 0
              ? "Seus gastos superaram as receitas. Reveja despesas e ajuste sua rota!"
              : "Ótimo! Seu saldo está positivo este mês. Avalie investir o excedente para crescer ainda mais 🚀"}
          </div>
          {data.totalGoals === 0 && (
            <div className="mt-4 p-3 rounded-md bg-orange-50 border border-orange-200 flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="text-orange-700 font-semibold">
                Crie sua primeira meta financeira e conquiste seu próximo objetivo!
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
