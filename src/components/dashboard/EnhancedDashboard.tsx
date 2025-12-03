
import React, { useState } from 'react';
import { DashboardOverview } from './DashboardOverview';
import { PeriodFilter, PeriodOption } from './PeriodFilter';
import { FinancialCharts } from '@/components/analytics/FinancialCharts';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';

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
            Visão geral das suas finanças pessoais
          </p>
        </div>
        <PeriodFilter period={selectedPeriod} onPeriodChange={setSelectedPeriod} />
      </div>

      {/* Resumo Geral Informativo */}
      <DashboardOverview />

      {/* Gráficos Financeiros */}
      <FinancialCharts period={selectedPeriod} />

      {/* Análises Detalhadas (sem cards de resumo duplicados) */}
      <AdvancedAnalytics period={selectedPeriod} />
    </div>
  );
}
