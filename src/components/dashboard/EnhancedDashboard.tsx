
import React, { useState } from 'react';
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
            Análises Financeiras
          </h1>
          <p className="text-muted-foreground">
            Gráficos e análises detalhadas das suas finanças
          </p>
        </div>
        <PeriodFilter period={selectedPeriod} onPeriodChange={setSelectedPeriod} />
      </div>

      {/* Gráficos Financeiros */}
      <FinancialCharts period={selectedPeriod} />

      {/* Análises Detalhadas */}
      <AdvancedAnalytics period={selectedPeriod} />
    </div>
  );
}
