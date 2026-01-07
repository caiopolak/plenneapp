import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  PieChart,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OverviewData {
  // Financeiro
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  // Metas
  totalGoals: number;
  completedGoals: number;
  nearestGoal: { name: string; progress: number; targetDate: string | null } | null;
  // Orçamentos
  totalBudgets: number;
  budgetsOverLimit: number;
  // Investimentos
  totalInvested: number;
  investmentsCount: number;
  // Próximas transações
  upcomingCount: number;
  upcomingTotal: number;
}

export function DashboardOverview() {
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview', user?.id, workspace?.id],
    queryFn: async (): Promise<OverviewData> => {
      if (!user || !workspace) throw new Error('Not authenticated');

      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      // Usar a menor data entre fim do mês e hoje (para não incluir transações futuras)
      const monthEnd = todayStr < format(endOfMonth(now), 'yyyy-MM-dd') ? todayStr : format(endOfMonth(now), 'yyyy-MM-dd');
      const next7Days = format(addDays(now, 7), 'yyyy-MM-dd');

      // Transações do mês (somente até hoje - transações futuras não afetam saldo atual)
      const { data: transactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .gte('date', monthStart)
        .lte('date', monthEnd);

      const totalIncome = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) || 0;
      const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || 0;
      const balance = totalIncome - totalExpenses;

      // Metas
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('name, target_amount, current_amount, target_date')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id);

      const totalGoals = goals?.length || 0;
      const completedGoals = goals?.filter(g => Number(g.current_amount || 0) >= Number(g.target_amount)).length || 0;
      
      // Meta mais próxima não concluída
      const incompleteGoals = goals?.filter(g => Number(g.current_amount || 0) < Number(g.target_amount)) || [];
      const sortedGoals = incompleteGoals.sort((a, b) => {
        if (!a.target_date) return 1;
        if (!b.target_date) return -1;
        return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
      });
      const nearestGoal = sortedGoals[0] ? {
        name: sortedGoals[0].name,
        progress: (Number(sortedGoals[0].current_amount || 0) / Number(sortedGoals[0].target_amount)) * 100,
        targetDate: sortedGoals[0].target_date
      } : null;

      // Orçamentos
      const { data: budgets } = await supabase
        .from('budgets')
        .select('category, amount_limit')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .eq('month', now.getMonth() + 1)
        .eq('year', now.getFullYear());

      const expensesByCategory = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => {
        // Simplificado - em produção, buscar categoria real
        return acc;
      }, {} as Record<string, number>) || {};

      const totalBudgets = budgets?.length || 0;
      // Contar orçamentos acima do limite (simplificado)
      const budgetsOverLimit = 0;

      // Investimentos
      const { data: investments } = await supabase
        .from('investments')
        .select('amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id);

      const totalInvested = investments?.reduce((s, i) => s + Number(i.amount), 0) || 0;
      const investmentsCount = investments?.length || 0;

      // Próximas transações
      const { data: upcoming } = await supabase
        .from('incoming_transactions')
        .select('amount, type')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .eq('status', 'pending')
        .lte('expected_date', next7Days);

      const upcomingCount = upcoming?.length || 0;
      const upcomingTotal = upcoming?.reduce((s, t) => {
        const amount = Number(t.amount);
        return t.type === 'income' ? s + amount : s - amount;
      }, 0) || 0;

      return {
        balance,
        totalIncome,
        totalExpenses,
        totalGoals,
        completedGoals,
        nearestGoal,
        totalBudgets,
        budgetsOverLimit,
        totalInvested,
        investmentsCount,
        upcomingCount,
        upcomingTotal
      };
    },
    enabled: !!user && !!workspace
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-48 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });

  return (
    <Card className="bg-gradient-to-br from-card to-muted/30 border-border shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Resumo do Mês
          </CardTitle>
          <Badge variant="outline" className="text-muted-foreground capitalize">
            📅 {currentMonth}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral das suas finanças neste período
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Saldo e Fluxo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Balanço Mensal</span>
              {data.balance >= 0 ? (
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--chart-2))]" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
            </div>
            <p className={`text-2xl font-bold ${data.balance >= 0 ? 'text-[hsl(var(--chart-2))]' : 'text-destructive'}`}>
              {formatCurrency(data.balance)}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-[hsl(var(--chart-2))]" />
              <span className="text-sm text-muted-foreground">Receitas</span>
            </div>
            <p className="text-xl font-semibold text-foreground">{formatCurrency(data.totalIncome)}</p>
          </div>

          <div className="p-4 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Despesas</span>
            </div>
            <p className="text-xl font-semibold text-foreground">{formatCurrency(data.totalExpenses)}</p>
          </div>
        </div>

        {/* Grid de Informações */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Metas */}
          <div className="p-3 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Suas Metas</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {data.completedGoals}/{data.totalGoals}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.completedGoals === data.totalGoals && data.totalGoals > 0 
                ? '🎉 Todas concluídas!' 
                : 'em andamento'}
            </p>
          </div>

          {/* Investimentos */}
          <div className="p-3 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="h-4 w-4 text-[hsl(var(--chart-4))]" />
              <span className="text-xs font-medium text-muted-foreground">Patrimônio Investido</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(data.totalInvested)}</p>
            <p className="text-xs text-muted-foreground">{data.investmentsCount} {data.investmentsCount === 1 ? 'ativo' : 'ativos'}</p>
          </div>

          {/* Orçamentos */}
          <div className="p-3 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-[hsl(var(--chart-3))]" />
              <span className="text-xs font-medium text-muted-foreground">Orçamentos Ativos</span>
            </div>
            <p className="text-lg font-bold text-foreground">{data.totalBudgets}</p>
            <p className="text-xs text-muted-foreground">{data.totalBudgets === 1 ? 'categoria monitorada' : 'categorias monitoradas'}</p>
          </div>

          {/* Próximas Transações */}
          <div className="p-3 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-[hsl(var(--chart-5))]" />
              <span className="text-xs font-medium text-muted-foreground">Próximos 7 Dias</span>
            </div>
            <p className="text-lg font-bold text-foreground">{data.upcomingCount}</p>
            <p className="text-xs text-muted-foreground">{data.upcomingCount === 1 ? 'transação agendada' : 'transações agendadas'}</p>
          </div>
        </div>

        {/* Meta mais próxima */}
        {data.nearestGoal && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Meta em Destaque</span>
              </div>
              {data.nearestGoal.targetDate && (
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(data.nearestGoal.targetDate), 'dd/MM/yyyy')}
                </Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground mb-2">{data.nearestGoal.name}</p>
            <div className="flex items-center gap-3">
              <Progress value={data.nearestGoal.progress} className="flex-1 h-2" />
              <span className="text-sm font-medium text-primary">{data.nearestGoal.progress.toFixed(0)}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
