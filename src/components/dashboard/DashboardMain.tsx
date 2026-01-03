import React, { useState, Suspense, lazy } from 'react';
import { WelcomeCard } from './WelcomeCard';
import { DashboardOverview } from './DashboardOverview';
import { UpcomingTransactionsCard } from './UpcomingTransactionsCard';
import { ProjectedBalanceChart } from './ProjectedBalanceChart';
import { FinancialHealthCard } from './FinancialHealthCard';
import { MonthlyComparisonCard } from './MonthlyComparisonCard';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UnifiedTransactionForm } from '@/components/transactions/UnifiedTransactionForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
  const { data: balanceData } = useQuery({
    queryKey: ['current-balance', user?.id, workspace?.id],
    queryFn: async () => {
      if (!user || !workspace) return { balance: 0, savingsRate: 0 };

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type, date')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id);

      const income = transactions?.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
      const expenses = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
      const balance = income - expenses;

      // Taxa de economia do mês atual
      const monthlyTransactions = transactions?.filter(t => new Date(t.date) >= startOfMonth) || [];
      const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
      const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
      const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

      return { balance, savingsRate: Math.max(0, savingsRate) };
    },
    enabled: !!user && !!workspace
  });

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
        <Button 
          onClick={() => setShowTransactionForm(true)}
          className="bg-[#2f9e44] hover:bg-[#2f9e44]/90 text-white"
          data-tour="add-transaction"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Welcome Card - Topo com informações do usuário */}
      <div data-tour="welcome-card" className="animate-fade-in stagger-1">
        <WelcomeCard 
          name={userProfile?.name}
          plan={userProfile?.plan}
          balance={balanceData?.balance}
          goalsCount={goalsData?.totalGoals}
          savingsRate={balanceData?.savingsRate}
        />
      </div>

      {/* Saúde Financeira e Comparativo Mensal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div data-tour="health-card" className="animate-fade-in stagger-2">
          <FinancialHealthCard />
        </div>
        <div className="animate-fade-in stagger-3">
          <MonthlyComparisonCard />
        </div>
      </div>

      {/* Resumo Geral Informativo */}
      <div data-tour="overview" className="animate-fade-in stagger-4">
        <DashboardOverview />
      </div>

      {/* Próximas Transações e Saldo Projetado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-fade-in stagger-5">
          <UpcomingTransactionsCard />
        </div>
        <div className="animate-fade-in stagger-6">
          <ProjectedBalanceChart />
        </div>
      </div>

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