import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, TrendingUp, Target, 
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ConsolidatedHealthDashboard() {
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();

  // Buscar todos os dados financeiros
  const { data, isLoading } = useQuery({
    queryKey: ['consolidated-health', user?.id, workspace?.id],
    queryFn: async () => {
      if (!user || !workspace) return null;

      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const startOfCurrentMonth = startOfMonth(today);
      const startOfLastMonth = startOfMonth(subMonths(today, 1));
      const endOfLastMonth = endOfMonth(subMonths(today, 1));

      // Transações
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type, date, category')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .lte('date', todayStr);

      // Metas
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('target_amount, current_amount, name, priority')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id);

      // Investimentos
      const { data: investments } = await supabase
        .from('investments')
        .select('amount, expected_return, type, name')
        .eq('user_id', user.id);

      // Orçamentos do mês
      const { data: budgets } = await supabase
        .from('budgets')
        .select('amount_limit, category')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .eq('year', today.getFullYear())
        .eq('month', today.getMonth() + 1);

      // Calcular métricas
      const income = transactions?.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
      const expenses = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
      const balance = income - expenses;

      const monthlyTransactions = transactions?.filter(t => new Date(t.date) >= startOfCurrentMonth) || [];
      const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
      const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);

      const lastMonthTransactions = transactions?.filter(t => {
        const date = new Date(t.date);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      }) || [];
      const lastMonthExpenses = lastMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);

      const totalGoalsTarget = goals?.reduce((acc, g) => acc + Number(g.target_amount), 0) || 0;
      const totalGoalsCurrent = goals?.reduce((acc, g) => acc + Number(g.current_amount || 0), 0) || 0;
      const completedGoals = goals?.filter(g => Number(g.current_amount || 0) >= Number(g.target_amount)).length || 0;

      const totalInvested = investments?.reduce((acc, i) => acc + Number(i.amount), 0) || 0;
      const avgReturn = investments?.length 
        ? investments.reduce((acc, i) => acc + (Number(i.expected_return) || 0), 0) / investments.length 
        : 0;

      const totalBudgetLimit = budgets?.reduce((acc, b) => acc + Number(b.amount_limit), 0) || 0;

      // Calcular despesas por categoria para os orçamentos
      const budgetCategories = budgets?.map(b => b.category) || [];
      const categoryExpenses = monthlyTransactions
        .filter(t => t.type === 'expense' && budgetCategories.includes(t.category))
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {} as Record<string, number>);

      const budgetUsage = totalBudgetLimit > 0 
        ? (Object.values(categoryExpenses).reduce((a, b) => a + b, 0) / totalBudgetLimit) * 100 
        : 0;

      // Patrimônio total
      const netWorth = balance + totalInvested + totalGoalsCurrent;


      // Dados para gráfico de evolução (últimos 6 meses)
      const evolutionData = [];
      for (let i = 5; i >= 0; i--) {
        const month = subMonths(today, i);
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthTransactions = transactions?.filter(t => {
          const date = new Date(t.date);
          return date >= monthStart && date <= monthEnd;
        }) || [];
        
        const mIncome = monthTransactions.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0);
        const mExpense = monthTransactions.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0);
        
        evolutionData.push({
          month: format(month, 'MMM', { locale: ptBR }),
          receita: mIncome,
          despesa: mExpense,
          saldo: mIncome - mExpense,
        });
      }

      // Distribuição do patrimônio
      const distributionData = [
        { name: 'Saldo Disponível', value: Math.max(0, balance), color: 'hsl(var(--primary))' },
        { name: 'Investimentos', value: totalInvested, color: 'hsl(142, 71%, 45%)' },
        { name: 'Metas', value: totalGoalsCurrent, color: 'hsl(217, 91%, 60%)' },
      ].filter(d => d.value > 0);

      return {
        netWorth,
        balance,
        totalInvested,
        totalGoalsCurrent,
        totalGoalsTarget,
        completedGoals,
        totalGoals: goals?.length || 0,
        avgReturn,
        budgetUsage,
        monthlyIncome,
        monthlyExpenses,
        evolutionData,
        distributionData,
        investmentsCount: investments?.length || 0,
        budgetsCount: budgets?.length || 0,
      };
    },
    enabled: !!user && !!workspace
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-40 bg-muted" />
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;


  return (
    <div className="space-y-6">
      {/* Header com Patrimônio e Orçamento - Métricas exclusivas desta view */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Patrimônio Total */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Wallet className="w-5 h-5" />
              <span className="text-sm font-medium">Patrimônio Total</span>
            </div>
            <p className="text-3xl font-bold text-primary">{formatCurrency(data.netWorth)}</p>
            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Saldo disponível</span>
                <span className="font-medium text-foreground">{formatCurrency(data.balance)}</span>
              </div>
              <div className="flex justify-between">
                <span>Investimentos</span>
                <span className="font-medium text-foreground">{formatCurrency(data.totalInvested)}</span>
              </div>
              <div className="flex justify-between">
                <span>Metas acumuladas</span>
                <span className="font-medium text-foreground">{formatCurrency(data.totalGoalsCurrent)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uso de Orçamento */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">Uso de Orçamento</span>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <p className={`text-3xl font-bold ${
                data.budgetUsage <= 80 ? 'text-emerald-500' : 
                data.budgetUsage <= 100 ? 'text-amber-500' : 'text-red-500'
              }`}>
                {data.budgetUsage.toFixed(0)}%
              </p>
              <span className="text-sm text-muted-foreground">utilizado</span>
            </div>
            <Progress 
              value={Math.min(data.budgetUsage, 100)} 
              className={`h-3 ${
                data.budgetUsage <= 80 ? '[&>div]:bg-emerald-500' : 
                data.budgetUsage <= 100 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'
              }`}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {data.budgetsCount === 0 
                ? 'Nenhum orçamento definido este mês' 
                : `${data.budgetsCount} categoria(s) orçada(s)`}
            </p>
          </CardContent>
        </Card>

        {/* Fluxo de Caixa Mensal */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Fluxo de Caixa Mensal</span>
            </div>
            <p className={`text-3xl font-bold ${data.monthlyIncome - data.monthlyExpenses >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {formatCurrency(data.monthlyIncome - data.monthlyExpenses)}
            </p>
            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Receitas</span>
                <span className="font-medium text-emerald-500">{formatCurrency(data.monthlyIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span>Despesas</span>
                <span className="font-medium text-red-500">{formatCurrency(data.monthlyExpenses)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Mensal */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Evolução Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'receita' ? 'Receita' : 'Despesa'
                    ]}
                  />
                  <Area type="monotone" dataKey="receita" stroke="hsl(142, 71%, 45%)" strokeWidth={2} fill="url(#incomeGradient)" />
                  <Area type="monotone" dataKey="despesa" stroke="hsl(0, 84%, 60%)" strokeWidth={2} fill="url(#expenseGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição do Patrimônio */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Distribuição do Patrimônio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {data.distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {data.distributionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por Área - Detalhes exclusivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metas */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progresso das Metas</span>
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold">{data.completedGoals}/{data.totalGoals}</p>
            <Progress 
              value={data.totalGoalsTarget > 0 ? (data.totalGoalsCurrent / data.totalGoalsTarget) * 100 : 0}
              className="h-2 mt-2 [&>div]:bg-blue-500"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {data.totalGoalsTarget > 0 
                ? `${((data.totalGoalsCurrent / data.totalGoalsTarget) * 100).toFixed(0)}% do objetivo total (${formatCurrency(data.totalGoalsCurrent)} de ${formatCurrency(data.totalGoalsTarget)})`
                : 'Nenhuma meta definida'}
            </p>
          </CardContent>
        </Card>

        {/* Investimentos */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Portfólio de Investimentos</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl font-bold">{formatCurrency(data.totalInvested)}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">{data.investmentsCount} ativo(s)</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-muted-foreground">{data.avgReturn.toFixed(1)}% retorno médio esperado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
