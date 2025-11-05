import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PeriodOption, getPeriodDates } from '@/components/dashboard/PeriodFilter';

interface AdvancedAnalyticsProps {
  period: PeriodOption;
}

export function AdvancedAnalytics({ period }: AdvancedAnalyticsProps) {
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();
  const { startDate, endDate } = getPeriodDates(period);

  // Análise avançada de dados financeiros
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['advanced-analytics', user?.id, workspace?.id, startDate, endDate],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Buscar transações do período
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace?.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      // Buscar orçamentos
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace?.id);

      // Buscar metas
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace?.id);

      // Buscar investimentos
      const { data: investments } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace?.id);

      if (!transactions) return null;

      // Análises de padrões de gastos
      const expensesByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {} as Record<string, number>);

      const incomeByCategory = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {} as Record<string, number>);

      // Análise de tendências mensais
      const monthlyTrends = transactions.reduce((acc, t) => {
        const monthKey = new Date(t.date).toISOString().slice(0, 7);
        if (!acc[monthKey]) {
          acc[monthKey] = { income: 0, expense: 0, month: monthKey };
        }
        if (t.type === 'income') {
          acc[monthKey].income += Number(t.amount);
        } else {
          acc[monthKey].expense += Number(t.amount);
        }
        return acc;
      }, {} as Record<string, any>);

      // Análise de saúde financeira
      const totalIncome = Object.values(incomeByCategory).reduce((sum, val) => sum + val, 0);
      const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

      // Análise de orçamentos
      const budgetAnalysis = budgets?.map(budget => {
        const spent = expensesByCategory[budget.category] || 0;
        const remaining = Number(budget.amount_limit) - spent;
        const percentUsed = (spent / Number(budget.amount_limit)) * 100;
        
        return {
          ...budget,
          spent,
          remaining,
          percentUsed,
          status: percentUsed > 100 ? 'exceeded' : percentUsed > 80 ? 'warning' : 'good'
        };
      }) || [];

      // Análise de metas
      const goalsAnalysis = goals?.map(goal => {
        const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
        const remaining = Number(goal.target_amount) - Number(goal.current_amount);
        
        return {
          ...goal,
          progress,
          remaining,
          status: progress >= 100 ? 'completed' : progress >= 75 ? 'close' : 'in_progress'
        };
      }) || [];

      // Principais categorias de gasto
      const topExpenseCategories = Object.entries(expensesByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: (amount / totalExpenses) * 100
        }));

      // Insights automáticos
      const insights = [];
      
      if (savingsRate > 20) {
        insights.push({
          type: 'positive',
          title: 'Excelente Taxa de Poupança!',
          description: `Você está poupando ${savingsRate.toFixed(1)}% da sua renda.`,
          icon: CheckCircle
        });
      } else if (savingsRate < 10) {
        insights.push({
          type: 'warning',
          title: 'Taxa de Poupança Baixa',
          description: `Taxa atual: ${savingsRate.toFixed(1)}%. Considere reduzir gastos.`,
          icon: AlertTriangle
        });
      }

      const exceededBudgets = budgetAnalysis.filter(b => b.status === 'exceeded');
      if (exceededBudgets.length > 0) {
        insights.push({
          type: 'negative',
          title: 'Orçamentos Excedidos',
          description: `${exceededBudgets.length} orçamento(s) foram ultrapassados.`,
          icon: AlertTriangle
        });
      }

      return {
        totalIncome,
        totalExpenses,
        savingsRate,
        expensesByCategory,
        incomeByCategory,
        monthlyTrends: Object.values(monthlyTrends),
        budgetAnalysis,
        goalsAnalysis,
        topExpenseCategories,
        insights,
        investments: investments || []
      };
    },
    enabled: !!user && !!workspace
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Sem dados suficientes para análise no período selecionado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo financeiro */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[hsl(var(--card-success-bg))] border-[hsl(var(--card-success-border))]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-[hsl(var(--card-success-text))]">Receitas Totais</CardTitle>
            <TrendingUp className="h-4 w-4 text-[hsl(var(--card-success-accent))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[hsl(var(--card-success-accent))]">
              R$ {analyticsData.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(var(--card-error-bg))] border-[hsl(var(--card-error-border))]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-[hsl(var(--card-error-text))]">Despesas Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-[hsl(var(--card-error-accent))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[hsl(var(--card-error-accent))]">
              R$ {analyticsData.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(var(--card-info-bg))] border-[hsl(var(--card-info-border))]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-[hsl(var(--card-info-text))]">Taxa de Poupança</CardTitle>
            <Target className="h-4 w-4 text-[hsl(var(--card-info-accent))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[hsl(var(--card-info-accent))]">
              {analyticsData.savingsRate.toFixed(1)}%
            </div>
            <p className="text-xs text-[hsl(var(--card-info-text))] mt-1">
              {analyticsData.savingsRate > 20 ? 'Excelente!' : 
               analyticsData.savingsRate > 10 ? 'Bom' : 'Precisa melhorar'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights automáticos */}
      {analyticsData.insights.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5" />
              Insights Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    insight.type === 'positive' ? 'bg-[hsl(var(--card-success-bg))] border border-[hsl(var(--card-success-border))]' :
                    insight.type === 'warning' ? 'bg-[hsl(var(--card-warning-bg))] border border-[hsl(var(--card-warning-border))]' :
                    'bg-[hsl(var(--card-error-bg))] border border-[hsl(var(--card-error-border))]'
                  }`}
                >
                  <insight.icon className={`h-5 w-5 mt-0.5 ${
                    insight.type === 'positive' ? 'text-[hsl(var(--card-success-accent))]' :
                    insight.type === 'warning' ? 'text-[hsl(var(--card-warning-accent))]' :
                    'text-[hsl(var(--card-error-accent))]'
                  }`} />
                  <div>
                    <h4 className={`font-medium ${
                      insight.type === 'positive' ? 'text-[hsl(var(--card-success-text))]' :
                      insight.type === 'warning' ? 'text-[hsl(var(--card-warning-text))]' :
                      'text-[hsl(var(--card-error-text))]'
                    }`}>
                      {insight.title}
                    </h4>
                    <p className={`text-sm ${
                      insight.type === 'positive' ? 'text-[hsl(var(--card-success-text))]' :
                      insight.type === 'warning' ? 'text-[hsl(var(--card-warning-text))]' :
                      'text-[hsl(var(--card-error-text))]'
                    }`}>
                      {insight.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Abas de análises detalhadas */}
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="investments">Investimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Principais Categorias de Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.topExpenseCategories.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.percentage.toFixed(1)}% do total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {analyticsData.budgetAnalysis.map((budget, index) => (
              <Card key={index} className={
                budget.status === 'exceeded' ? 'border-[hsl(var(--card-error-border))] bg-[hsl(var(--card-error-bg))]' :
                budget.status === 'warning' ? 'border-[hsl(var(--card-warning-border))] bg-[hsl(var(--card-warning-bg))]' :
                'border-[hsl(var(--card-success-border))] bg-[hsl(var(--card-success-bg))]'
              }>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{budget.category}</CardTitle>
                    <Badge variant={
                      budget.status === 'exceeded' ? 'destructive' :
                      budget.status === 'warning' ? 'secondary' :
                      'default'
                    }>
                      {budget.percentUsed.toFixed(0)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Gasto: R$ {budget.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span>Limite: R$ {Number(budget.amount_limit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          budget.status === 'exceeded' ? 'bg-red-500' :
                          budget.status === 'warning' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {budget.remaining > 0 ? 
                        `Restam R$ ${budget.remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` :
                        `Excedido em R$ ${Math.abs(budget.remaining).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {analyticsData.goalsAnalysis.map((goal, index) => (
              <Card key={index} className={
                goal.status === 'completed' ? 'border-[hsl(var(--card-success-border))] bg-[hsl(var(--card-success-bg))]' :
                goal.status === 'close' ? 'border-[hsl(var(--card-info-border))] bg-[hsl(var(--card-info-bg))]' :
                'border-border bg-card'
              }>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{goal.name}</CardTitle>
                    <Badge variant={
                      goal.status === 'completed' ? 'default' :
                      goal.status === 'close' ? 'secondary' :
                      'outline'
                    }>
                      {goal.progress.toFixed(0)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Atual: R$ {Number(goal.current_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span>Meta: R$ {Number(goal.target_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          goal.status === 'completed' ? 'bg-green-500' :
                          goal.status === 'close' ? 'bg-blue-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {goal.status === 'completed' ? 
                        'Meta alcançada! 🎉' :
                        `Faltam R$ ${goal.remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="investments" className="space-y-4">
          {analyticsData.investments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {analyticsData.investments.map((investment, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{investment.name}</CardTitle>
                    <Badge variant="outline">{investment.type}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Valor Investido:</span>
                        <span className="font-medium">
                          R$ {Number(investment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {investment.expected_return && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Retorno Esperado:</span>
                          <span className="font-medium text-green-600">
                            {Number(investment.expected_return).toFixed(1)}%
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Data:</span>
                        <span className="font-medium">
                          {new Date(investment.purchase_date || '').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Nenhum investimento registrado.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}