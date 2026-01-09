import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  Banknote,
  FileDown,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

import { generateConsolidatedPDF } from '@/utils/pdfExport';
import { useToast } from '@/hooks/use-toast';

interface ConsolidatedData {
  // Saldo
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  
  // Metas
  totalGoals: number;
  completedGoals: number;
  totalGoalsTarget: number;
  totalGoalsCurrent: number;
  goalsProgress: number;
  
  // Investimentos
  totalInvested: number;
  investmentsCount: number;
  averageReturn: number;
  projectedReturn12Months: number;
  
  // Projeções
  upcomingIncome: number;
  upcomingExpenses: number;
  projectedBalance30Days: number;
  pendingTransactionsCount: number;
  
  // Patrimônio
  netWorth: number;
}

export function ConsolidatedFinancialReport() {
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['consolidated-report', user?.id, workspace?.id],
    queryFn: async (): Promise<ConsolidatedData> => {
      if (!user || !workspace) throw new Error('Not authenticated');

      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const monthStart = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');
      const future30Days = format(addDays(today, 30), 'yyyy-MM-dd');

      // 1. Transações até hoje (saldo atual)
      const { data: allTransactions } = await supabase
        .from('transactions')
        .select('type, amount, date')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .lte('date', todayStr);

      let currentBalance = 0;
      let monthlyIncome = 0;
      let monthlyExpenses = 0;

      (allTransactions || []).forEach(t => {
        const amount = Number(t.amount);
        if (t.type === 'income') {
          currentBalance += amount;
          if (t.date >= monthStart) monthlyIncome += amount;
        } else {
          currentBalance -= amount;
          if (t.date >= monthStart) monthlyExpenses += amount;
        }
      });

      // 2. Metas
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('target_amount, current_amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id);

      const totalGoals = goals?.length || 0;
      const totalGoalsTarget = goals?.reduce((s, g) => s + Number(g.target_amount), 0) || 0;
      const totalGoalsCurrent = goals?.reduce((s, g) => s + Number(g.current_amount || 0), 0) || 0;
      const completedGoals = goals?.filter(g => Number(g.current_amount || 0) >= Number(g.target_amount)).length || 0;
      const goalsProgress = totalGoalsTarget > 0 ? (totalGoalsCurrent / totalGoalsTarget) * 100 : 0;

      // 3. Investimentos
      const { data: investments } = await supabase
        .from('investments')
        .select('amount, expected_return')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id);

      const totalInvested = investments?.reduce((s, i) => s + Number(i.amount), 0) || 0;
      const investmentsCount = investments?.length || 0;
      const averageReturn = investmentsCount > 0 
        ? investments.reduce((s, i) => s + Number(i.expected_return || 0), 0) / investmentsCount 
        : 0;
      const projectedReturn12Months = totalInvested * (averageReturn / 100);

      // 4. Transações futuras (incoming_transactions)
      const { data: upcoming } = await supabase
        .from('incoming_transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .eq('status', 'pending')
        .gte('expected_date', todayStr)
        .lte('expected_date', future30Days);

      let upcomingIncome = 0;
      let upcomingExpenses = 0;

      (upcoming || []).forEach(t => {
        if (t.type === 'income') {
          upcomingIncome += Number(t.amount);
        } else {
          upcomingExpenses += Number(t.amount);
        }
      });

      // 5. Transações recorrentes futuras
      const { data: futureRecurring } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .eq('is_recurring', true)
        .gt('date', todayStr)
        .lte('date', future30Days);

      (futureRecurring || []).forEach(t => {
        if (t.type === 'income') {
          upcomingIncome += Number(t.amount);
        } else {
          upcomingExpenses += Number(t.amount);
        }
      });

      const projectedBalance30Days = currentBalance + upcomingIncome - upcomingExpenses;
      const pendingTransactionsCount = (upcoming?.length || 0) + (futureRecurring?.length || 0);

      // 6. Patrimônio líquido
      const netWorth = currentBalance + totalInvested + totalGoalsCurrent;

      return {
        currentBalance,
        monthlyIncome,
        monthlyExpenses,
        totalGoals,
        completedGoals,
        totalGoalsTarget,
        totalGoalsCurrent,
        goalsProgress,
        totalInvested,
        investmentsCount,
        averageReturn,
        projectedReturn12Months,
        upcomingIncome,
        upcomingExpenses,
        projectedBalance30Days,
        pendingTransactionsCount,
        netWorth
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
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });
  const balanceChange = data.upcomingIncome - data.upcomingExpenses;

  // Função para exportar PDF
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      // Buscar dados adicionais para o PDF
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('name, target_amount, current_amount')
        .eq('user_id', user!.id)
        .eq('workspace_id', workspace!.id);

      const { data: investments } = await supabase
        .from('investments')
        .select('name, type, amount, expected_return')
        .eq('user_id', user!.id)
        .eq('workspace_id', workspace!.id);

      await generateConsolidatedPDF({
        netWorth: data.netWorth,
        currentBalance: data.currentBalance,
        totalInvested: data.totalInvested,
        totalGoalsCurrent: data.totalGoalsCurrent,
        monthlyIncome: data.monthlyIncome,
        monthlyExpenses: data.monthlyExpenses,
        savingsRate: data.monthlyIncome > 0 
          ? ((data.monthlyIncome - data.monthlyExpenses) / data.monthlyIncome) * 100 
          : 0,
        goals: (goals || []).map(g => ({
          name: g.name,
          progress: Number(g.target_amount) > 0 
            ? (Number(g.current_amount || 0) / Number(g.target_amount)) * 100 
            : 0,
          current: Number(g.current_amount || 0),
          target: Number(g.target_amount)
        })),
        investments: (investments || []).map(i => ({
          name: i.name,
          type: i.type,
          amount: Number(i.amount),
          return: i.expected_return ? Number(i.expected_return) : null
        })),
        upcomingTransactions: data.pendingTransactionsCount,
        projectedBalance: data.projectedBalance30Days
      });

      toast({
        title: "PDF exportado!",
        description: "O relatório foi salvo com sucesso."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: "Não foi possível gerar o PDF."
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-card via-card to-muted/20 border-border shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Banknote className="h-6 w-6 text-primary" />
              </div>
              Relatório Financeiro Consolidado
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-muted-foreground capitalize text-sm">
                📅 {currentMonth}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex items-center gap-2"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardHeader>

      <CardContent className="space-y-6">
        {/* Patrimônio Líquido - Destaque Principal */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Patrimônio Líquido Total</p>
              <p className="text-4xl font-bold text-primary mt-1">
                {formatCurrency(data.netWorth)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Saldo + Investimentos + Metas
              </p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Saldo Atual</p>
                <p className={`text-lg font-bold ${data.currentBalance >= 0 ? 'text-[hsl(var(--chart-2))]' : 'text-destructive'}`}>
                  {formatCurrency(data.currentBalance)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Investido</p>
                <p className="text-lg font-bold text-[hsl(var(--chart-4))]">
                  {formatCurrency(data.totalInvested)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Em Metas</p>
                <p className="text-lg font-bold text-secondary">
                  {formatCurrency(data.totalGoalsCurrent)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coluna 1: Saldo e Fluxo */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Fluxo do Mês
            </h3>
            
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-[hsl(var(--chart-2))]/10 border border-[hsl(var(--chart-2))]/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[hsl(var(--chart-2))]" />
                    <span className="text-sm text-muted-foreground">Receitas</span>
                  </div>
                  <span className="font-bold text-[hsl(var(--chart-2))]">
                    {formatCurrency(data.monthlyIncome)}
                  </span>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-muted-foreground">Despesas</span>
                  </div>
                  <span className="font-bold text-destructive">
                    {formatCurrency(data.monthlyExpenses)}
                  </span>
                </div>
              </div>
              
              <Separator />
              
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Economia do Mês</span>
                  <span className={`font-bold ${(data.monthlyIncome - data.monthlyExpenses) >= 0 ? 'text-[hsl(var(--chart-2))]' : 'text-destructive'}`}>
                    {formatCurrency(data.monthlyIncome - data.monthlyExpenses)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2: Metas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-secondary" />
              Metas Financeiras
            </h3>
            
            <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progresso Geral</span>
                <Badge variant="secondary" className="font-bold">
                  {data.goalsProgress.toFixed(1)}%
                </Badge>
              </div>
              
              <Progress value={Math.min(data.goalsProgress, 100)} className="h-3 [&>div]:bg-secondary" />
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2 rounded bg-background/50">
                  <p className="text-xs text-muted-foreground">Meta Total</p>
                  <p className="font-bold text-foreground text-sm">
                    {formatCurrency(data.totalGoalsTarget)}
                  </p>
                </div>
                <div className="p-2 rounded bg-background/50">
                  <p className="text-xs text-muted-foreground">Acumulado</p>
                  <p className="font-bold text-secondary text-sm">
                    {formatCurrency(data.totalGoalsCurrent)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-[hsl(var(--chart-2))]" />
                  Concluídas
                </span>
                <span className="font-semibold">{data.completedGoals}/{data.totalGoals}</span>
              </div>
            </div>
          </div>

          {/* Coluna 3: Investimentos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <PieChart className="h-4 w-4 text-[hsl(var(--chart-4))]" />
              Investimentos
            </h3>
            
            <div className="p-4 rounded-lg bg-[hsl(var(--chart-4))]/10 border border-[hsl(var(--chart-4))]/20 space-y-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Investido</p>
                <p className="text-2xl font-bold text-[hsl(var(--chart-4))]">
                  {formatCurrency(data.totalInvested)}
                </p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2 rounded bg-background/50">
                  <p className="text-xs text-muted-foreground">Ativos</p>
                  <p className="font-bold text-foreground">{data.investmentsCount}</p>
                </div>
                <div className="p-2 rounded bg-background/50">
                  <p className="text-xs text-muted-foreground">Retorno Médio</p>
                  <p className="font-bold text-[hsl(var(--chart-2))]">{data.averageReturn.toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="p-2 rounded bg-background/50 text-center">
                <p className="text-xs text-muted-foreground">Projeção 12 meses</p>
                <p className="font-bold text-[hsl(var(--chart-2))]">
                  +{formatCurrency(data.projectedReturn12Months)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Projeção Futura */}
        <div className="p-5 rounded-xl bg-muted/30 border border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-primary" />
            Projeção para os Próximos 30 Dias
          </h3>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Saldo Atual</p>
                <p className={`text-xl font-bold ${data.currentBalance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                  {formatCurrency(data.currentBalance)}
                </p>
              </div>
              
              <div className="flex flex-col items-center text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[hsl(var(--chart-2))]">+{formatCurrency(data.upcomingIncome)}</span>
                </div>
                <ArrowRight className="h-4 w-4" />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-destructive">-{formatCurrency(data.upcomingExpenses)}</span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Saldo Projetado</p>
                <p className={`text-xl font-bold ${data.projectedBalance30Days >= 0 ? 'text-[hsl(var(--chart-2))]' : 'text-destructive'}`}>
                  {formatCurrency(data.projectedBalance30Days)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {data.pendingTransactionsCount} transações pendentes
              </span>
              <Badge variant={balanceChange >= 0 ? 'default' : 'destructive'} className="ml-2">
                {balanceChange >= 0 ? '+' : ''}{formatCurrency(balanceChange)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}