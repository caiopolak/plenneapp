
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { GoalList } from "@/components/goals/GoalList";
import { InvestmentList } from "@/components/investments/InvestmentList";
import { FinancialCharts } from "@/components/analytics/FinancialCharts";

export function AnalyticsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7 animate-fade-in">
      <Card className="hover:scale-105 transition-transform duration-200 shadow-lg border-[--primary]/10">
        <CardHeader>
          <CardTitle>Resumo financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <FinancialSummary />
        </CardContent>
      </Card>
      <Card className="hover:scale-105 transition-transform duration-200 shadow-lg border-[--gold]/10">
        <CardHeader>
          <CardTitle>Metas e Desafios</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalList />
        </CardContent>
      </Card>
      <Card className="hover:scale-105 transition-transform duration-200 shadow-lg border-[--electric]/10">
        <CardHeader>
          <CardTitle>Investimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <InvestmentList />
        </CardContent>
      </Card>
    </div>
  );
}
