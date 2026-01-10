import React, { useState, Suspense, lazy } from 'react';
import { WelcomeCard } from './WelcomeCard';
import { DashboardOverview } from './DashboardOverview';
import { UpcomingTransactionsCard } from './UpcomingTransactionsCard';
import { ProjectedBalanceChart } from './ProjectedBalanceChart';
import { FinancialHealthCard } from './FinancialHealthCard';
import { MonthlyComparisonCard } from './MonthlyComparisonCard';
import { DashboardAlertsCard } from './DashboardAlertsCard';
import { DashboardChallengesCard } from './DashboardChallengesCard';
import { DashboardTipsCard } from './DashboardTipsCard';
import { ConsolidatedHealthDashboard } from './ConsolidatedHealthDashboard';
import { GoalsWidget } from './GoalsWidget';
import { TrialDashboardBanner } from './TrialDashboardBanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UnifiedTransactionForm } from '@/components/transactions/UnifiedTransactionForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LayoutDashboard, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardCardSkeleton, ChartSkeleton } from '@/components/ui/loading-skeletons';
import { InfoTooltip, tooltips } from '@/components/ui/info-tooltip';

export function DashboardMain() {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();

  // Buscar dados do usuário e metas para os cards
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .single();

      return {
        name: profile?.full_name,
        plan: subscription?.plan
      };
    },
    enabled: !!user
  });

  const { data: goalsData } = useQuery({
    queryKey: ['goals-progress', user?.id, workspace?.id],
    queryFn: async () => {
      if (!user) return { completedGoals: 0, totalGoals: 0, goalsProgress: 0 };

      const { data: goals } = await supabase
        .from('financial_goals')
        .select('target_amount, current_amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace?.id);

      const totalGoals = goals?.length || 0;
      const completedGoals = goals?.filter(goal => 
        Number(goal.current_amount || 0) >= Number(goal.target_amount)
      ).length || 0;
      
      const goalsProgress = totalGoals === 0 ? 0 : (completedGoals / totalGoals) * 100;

      return { completedGoals, totalGoals, goalsProgress };
    },
    enabled: !!user && !!workspace
  });

  const isLoading = !userProfile && !goalsData;

  // Calcular saldo atual para o WelcomeCard
  // IMPORTANTE: Somente transações com data até hoje devem afetar o saldo atual
  const { data: balanceData } = useQuery({
    queryKey: ['current-balance', user?.id, workspace?.id],
    queryFn: async () => {
      if (!user || !workspace) return { balance: 0, savingsRate: 0 };

      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const todayStr = today.toISOString().split('T')[0];

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Buscar apenas transações até a data de hoje (transações futuras não afetam o saldo atual)
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type, date')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .lte('date', todayStr);

      const income = transactions?.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
      const expenses = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
      const balance = income - expenses;

      // Taxa de economia do mês atual (apenas transações até hoje)
      const monthlyTransactions = transactions?.filter(t => new Date(t.date) >= startOfMonth) || [];
      const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
      const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
      const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

      return { balance, savingsRate: Math.max(0, savingsRate) };
    },
    enabled: !!user && !!workspace
  });

  const [activeView, setActiveView] = useState<'overview' | 'consolidated'>('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text">
            Dashboard Financeiro
          </h1>
          <p className="text-muted-foreground">
            Acompanhe sua situação financeira em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'overview' | 'consolidated')} className="hidden sm:block">
            <TabsList className="h-11 p-1 bg-muted/50 border border-border/50 rounded-xl">
              <TabsTrigger 
                value="overview" 
                className="gap-2 text-sm px-4 h-9 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300"
              >
                <LayoutDashboard className="w-4 h-4" />
                Resumo
              </TabsTrigger>
              <TabsTrigger 
                value="consolidated" 
                className="gap-2 text-sm px-4 h-9 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-secondary/80 data-[state=active]:text-secondary-foreground data-[state=active]:shadow-md transition-all duration-300"
              >
                <Activity className="w-4 h-4" />
                Saúde Financeira
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            onClick={() => setShowTransactionForm(true)}
            variant="cta"
            className="shadow-lg"
            data-tour="add-transaction"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Mobile view toggle */}
      <div className="sm:hidden">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'overview' | 'consolidated')}>
          <TabsList className="w-full grid grid-cols-2 h-12 p-1 bg-muted/50 border border-border/50 rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              <LayoutDashboard className="w-4 h-4" />
              Resumo
            </TabsTrigger>
            <TabsTrigger 
              value="consolidated" 
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-secondary/80 data-[state=active]:text-secondary-foreground data-[state=active]:shadow-md"
            >
              <Activity className="w-4 h-4" />
              Saúde
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeView === 'consolidated' ? (
        <ConsolidatedHealthDashboard />
      ) : (
        <div className="space-y-6">
          {/* Trial Banner - Topo do Dashboard */}
          <TrialDashboardBanner />

          {/* 1. Welcome Card - Topo com informações do usuário */}
          <div data-tour="welcome-card" className="animate-fade-in stagger-1">
            <WelcomeCard 
              name={userProfile?.name}
              plan={userProfile?.plan}
              balance={balanceData?.balance}
              goalsCount={goalsData?.totalGoals}
              savingsRate={balanceData?.savingsRate}
            />
          </div>

          {/* 2. Saúde Financeira e Comparativo Mensal - Grid 2 colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div data-tour="health-card" className="animate-fade-in stagger-2 h-full">
              <FinancialHealthCard />
            </div>
            <div className="animate-fade-in stagger-3 h-full">
              <MonthlyComparisonCard />
            </div>
          </div>

          {/* 3. Metas e Resumo - Grid 2 colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 animate-fade-in stagger-4">
              <GoalsWidget />
            </div>
            <div data-tour="overview" className="lg:col-span-2 animate-fade-in stagger-5">
              <DashboardOverview />
            </div>
          </div>

          {/* 4. Próximas Transações e Saldo Projetado - Grid 2 colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="animate-fade-in stagger-6 h-full">
              <UpcomingTransactionsCard />
            </div>
            <div className="animate-fade-in stagger-7 h-full">
              <ProjectedBalanceChart />
            </div>
          </div>

          {/* 5. Dicas, Desafios e Alertas - Grid 3 colunas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="animate-fade-in stagger-8 h-full">
              <DashboardTipsCard />
            </div>
            <div className="animate-fade-in stagger-9 h-full">
              <DashboardChallengesCard />
            </div>
            <div className="animate-fade-in stagger-10 h-full md:col-span-2 lg:col-span-1">
              <DashboardAlertsCard />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Transação */}
      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-xl w-full rounded-2xl p-4 md:p-6 bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nova Transação</DialogTitle>
          </DialogHeader>
          <UnifiedTransactionForm
            onSuccess={() => setShowTransactionForm(false)}
            onCancel={() => setShowTransactionForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}