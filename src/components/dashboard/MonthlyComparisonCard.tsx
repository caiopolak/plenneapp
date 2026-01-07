import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ComparisonData {
  currentMonth: { income: number; expenses: number; balance: number };
  lastMonth: { income: number; expenses: number; balance: number };
  variation: { income: number; expenses: number; balance: number };
}

export function MonthlyComparisonCard() {
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();

  const { data, isLoading } = useQuery({
    queryKey: ['monthly-comparison', user?.id, workspace?.id],
    queryFn: async (): Promise<ComparisonData> => {
      if (!user || !workspace) throw new Error('Not authenticated');

      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');
      const currentMonthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      // Usar a menor data entre fim do mês e hoje (para não incluir transações futuras)
      const currentMonthEnd = todayStr < format(endOfMonth(now), 'yyyy-MM-dd') ? todayStr : format(endOfMonth(now), 'yyyy-MM-dd');
      const lastMonthStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');
      const lastMonthEnd = format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');

      // Transações do mês atual (somente até hoje - transações futuras não afetam)
      const { data: currentTransactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .gte('date', currentMonthStart)
        .lte('date', currentMonthEnd);

      // Transações do mês anterior
      const { data: lastTransactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .gte('date', lastMonthStart)
        .lte('date', lastMonthEnd);

      const currentIncome = currentTransactions?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) || 0;
      const currentExpenses = currentTransactions?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || 0;
      const currentBalance = currentIncome - currentExpenses;

      const lastIncome = lastTransactions?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) || 0;
      const lastExpenses = lastTransactions?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || 0;
      const lastBalance = lastIncome - lastExpenses;

      const calcVariation = (current: number, last: number) => {
        if (last === 0) return current > 0 ? 100 : 0;
        return ((current - last) / last) * 100;
      };

      return {
        currentMonth: { income: currentIncome, expenses: currentExpenses, balance: currentBalance },
        lastMonth: { income: lastIncome, expenses: lastExpenses, balance: lastBalance },
        variation: {
          income: calcVariation(currentIncome, lastIncome),
          expenses: calcVariation(currentExpenses, lastExpenses),
          balance: calcVariation(currentBalance, lastBalance)
        }
      };
    },
    enabled: !!user && !!workspace
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getVariationIcon = (value: number, inverted = false) => {
    if (Math.abs(value) < 1) return <Minus className="h-3 w-3 text-muted-foreground" />;
    const isPositive = inverted ? value < 0 : value > 0;
    return isPositive 
      ? <ArrowUpRight className="h-3 w-3 text-emerald-500" />
      : <ArrowDownRight className="h-3 w-3 text-red-500" />;
  };

  const getVariationColor = (value: number, inverted = false) => {
    if (Math.abs(value) < 1) return 'text-muted-foreground';
    const isPositive = inverted ? value < 0 : value > 0;
    return isPositive ? 'text-emerald-500' : 'text-red-500';
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const now = new Date();
  const currentMonthName = format(now, 'MMMM', { locale: ptBR });
  const lastMonthName = format(subMonths(now, 1), 'MMMM', { locale: ptBR });

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Comparativo Mensal
          </CardTitle>
          <Badge variant="outline" className="text-xs capitalize">
            {currentMonthName} vs {lastMonthName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Receitas */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Receitas</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(data.currentMonth.income)}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(data.variation.income)}`}>
                {getVariationIcon(data.variation.income)}
                {Math.abs(data.variation.income).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                vs {formatCurrency(data.lastMonth.income)}
              </p>
            </div>
          </div>

          {/* Despesas */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/10">
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Despesas</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(data.currentMonth.expenses)}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(data.variation.expenses, true)}`}>
                {getVariationIcon(data.variation.expenses, true)}
                {Math.abs(data.variation.expenses).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                vs {formatCurrency(data.lastMonth.expenses)}
              </p>
            </div>
          </div>

          {/* Saldo */}
          <div className={`flex items-center justify-between p-3 rounded-lg ${data.currentMonth.balance >= 0 ? 'bg-blue-500/5 border-blue-500/20' : 'bg-amber-500/5 border-amber-500/20'} border`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${data.currentMonth.balance >= 0 ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}>
                <BarChart3 className={`h-4 w-4 ${data.currentMonth.balance >= 0 ? 'text-blue-500' : 'text-amber-500'}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo do Mês</p>
                <p className={`text-lg font-bold ${data.currentMonth.balance >= 0 ? 'text-blue-500' : 'text-amber-500'}`}>
                  {formatCurrency(data.currentMonth.balance)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(data.variation.balance)}`}>
                {getVariationIcon(data.variation.balance)}
                {Math.abs(data.variation.balance).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                vs {formatCurrency(data.lastMonth.balance)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
