
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, PiggyBank } from 'lucide-react';
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
    return <div>Carregando dados financeiros...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          {balance >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {Math.abs(balance).toFixed(2).replace('.', ',')}
          </div>
          <p className="text-xs text-muted-foreground">
            {balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'} este mês
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            R$ {data.totalIncome.toFixed(2).replace('.', ',')}
          </div>
          <p className="text-xs text-muted-foreground">
            Este mês ({data.monthlyTransactions} transações)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            R$ {data.totalExpense.toFixed(2).replace('.', ',')}
          </div>
          <p className="text-xs text-muted-foreground">
            Este mês
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Investimentos</CardTitle>
          <PiggyBank className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            R$ {data.totalInvestments.toFixed(2).replace('.', ',')}
          </div>
          <p className="text-xs text-muted-foreground">
            Total investido
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progresso das Metas</CardTitle>
          <Target className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.completedGoals} de {data.totalGoals} metas
          </div>
          <div className="mt-2">
            <Progress value={goalsProgress} className="h-2" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {goalsProgress.toFixed(0)}% das metas concluídas
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Dicas Financeiras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">💡 Dica do Dia</p>
            <p className="text-sm text-blue-600">
              {balance < 0 
                ? "Seus gastos estão acima das receitas. Que tal revisar suas despesas?" 
                : "Parabéns! Você tem um saldo positivo. Considere investir o excedente."}
            </p>
          </div>
          {data.totalGoals === 0 && (
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-800">🎯 Sugestão</p>
              <p className="text-sm text-orange-600">
                Crie suas primeiras metas financeiras para ter objetivos claros!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
