
import React, { useState } from 'react';
import { KPICards } from './KPICards';
import { FinancialInsights } from './FinancialInsights';
import { PeriodFilter, PeriodOption } from './PeriodFilter';
import { FinancialCharts } from '@/components/analytics/FinancialCharts';
import { GoalProgressCard } from './GoalProgressCard';
import { WelcomeCard } from './WelcomeCard';
import { SmartFinancialAlerts } from '@/components/alerts/SmartFinancialAlerts';
import { IncomingTransactions } from '@/components/transactions/IncomingTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function EnhancedDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('1month');
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

  return (
    <div className="space-y-6">
      {/* Header com filtro de período */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text">
            Dashboard Financeiro
          </h1>
          <p className="text-muted-foreground">
            Acompanhe sua situação financeira em tempo real
          </p>
        </div>
        <PeriodFilter period={selectedPeriod} onPeriodChange={setSelectedPeriod} />
      </div>

      {/* Welcome Card */}
      <WelcomeCard 
        name={userProfile?.name}
        plan={userProfile?.plan}
      />

      {/* KPI Cards */}
      <KPICards />

      {/* Layout principal com 3 colunas */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Coluna principal - Gráficos (2 colunas) */}
        <div className="lg:col-span-2 space-y-6">
          <FinancialCharts period={selectedPeriod} />
        </div>
        
        {/* Sidebar direita - Insights e Alertas (2 colunas) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <FinancialInsights />
              <GoalProgressCard 
                completedGoals={goalsData?.completedGoals || 0}
                totalGoals={goalsData?.totalGoals || 0}
                goalsProgress={goalsData?.goalsProgress || 0}
              />
            </div>
            <div className="space-y-6">
              <SmartFinancialAlerts />
              <IncomingTransactions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
