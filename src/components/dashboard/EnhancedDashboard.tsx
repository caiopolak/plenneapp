
import React, { useState } from 'react';
import { KPICards } from './KPICards';
import { FinancialInsights } from './FinancialInsights';
import { PeriodFilter, PeriodOption } from './PeriodFilter';
import { FinancialCharts } from '@/components/analytics/FinancialCharts';
import { GoalProgressCard } from './GoalProgressCard';
import { WelcomeCard } from './WelcomeCard';

export function EnhancedDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('1month');

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
      <WelcomeCard />

      {/* KPI Cards */}
      <KPICards />

      {/* Layout de duas colunas para insights e gráficos */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal - Gráficos */}
        <div className="lg:col-span-2 space-y-6">
          <FinancialCharts period={selectedPeriod} />
        </div>
        
        {/* Sidebar - Insights e Metas */}
        <div className="space-y-6">
          <FinancialInsights />
          <GoalProgressCard />
        </div>
      </div>
    </div>
  );
}
