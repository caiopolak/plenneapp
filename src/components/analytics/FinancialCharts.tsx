
import React from "react";
import { ExpenseByCategoryChart } from "./ExpenseByCategoryChart";
import { IncomeByCategoryChart } from "./IncomeByCategoryChart";
import { TrendsChart } from "./TrendsChart";
import { CategoryComparisonChart } from "./CategoryComparisonChart";
import { TrendsBarChart } from "./TrendsBarChart";
import { PeriodOption, getPeriodDates } from "@/components/dashboard/PeriodFilter";

interface FinancialChartsProps {
  period?: PeriodOption;
}

export function FinancialCharts({ period = '1month' }: FinancialChartsProps) {
  const { startDate, endDate } = getPeriodDates(period);

  return (
    <div className="space-y-6">
      {/* Gráficos de pizza - receitas e despesas por categoria */}
      <div className="grid gap-6 md:grid-cols-2">
        <IncomeByCategoryChart dateRange={{ startDate, endDate }} />
        <ExpenseByCategoryChart dateRange={{ startDate, endDate }} />
      </div>

      {/* Gráfico de tendências ao longo do tempo */}
      <TrendsChart period={period} />

      {/* Gráficos de comparação */}
      <div className="grid gap-6 md:grid-cols-2">
        <CategoryComparisonChart dateRange={{ startDate, endDate }} />
        <TrendsBarChart dateRange={{ startDate, endDate }} />
      </div>
    </div>
  );
}
