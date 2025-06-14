
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { GoalList } from "@/components/goals/GoalList";
import { InvestmentList } from "@/components/investments/InvestmentList";

// Ajuste no grid para responsividade ideal em desktop/mobile/tablet
export function AnalyticsOverview() {
  return (
    <div className="w-full grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr md:gap-6 xl:gap-8 2xl:gap-10">
      <Card className="h-full flex flex-col hover:scale-105 transition-transform duration-200 shadow-lg border-[--primary]/10">
        <CardHeader>
          <CardTitle>Resumo financeiro</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <FinancialSummary />
        </CardContent>
      </Card>
      <Card className="h-full flex flex-col hover:scale-105 transition-transform duration-200 shadow-lg border-[--gold]/10">
        <CardHeader>
          <CardTitle>Metas e Desafios</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <GoalList />
        </CardContent>
      </Card>
      <Card className="h-full flex flex-col hover:scale-105 transition-transform duration-200 shadow-lg border-[--electric]/10">
        <CardHeader>
          <CardTitle>Investimentos</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <InvestmentList />
        </CardContent>
      </Card>
    </div>
  );
}
