
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { GoalList } from "@/components/goals/GoalList";
import { InvestmentList } from "@/components/investments/InvestmentList";

// Grid ultra responsivo e uniforme, layout limpo e visual consistente
export function AnalyticsOverview() {
  return (
    <div
      className="
        w-full
        grid
        gap-6
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-3
        auto-rows-[minmax(330px,1fr)]
        pb-2
      "
    >
      <Card className="flex flex-col h-full bg-white bg-opacity-95 shadow-lg rounded-xl border-0 hover:scale-[1.013] transition-transform duration-200">
        <CardHeader>
          <CardTitle>Resumo financeiro</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between overflow-x-auto sm:overflow-visible">
          <FinancialSummary />
        </CardContent>
      </Card>
      <Card className="flex flex-col h-full bg-gradient-to-br from-[--gold]/10 to-white shadow-lg rounded-xl border-0 hover:scale-[1.013] transition-transform duration-200">
        <CardHeader>
          <CardTitle>Metas e Desafios</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between overflow-x-auto sm:overflow-visible">
          <GoalList />
        </CardContent>
      </Card>
      <Card className="flex flex-col h-full bg-gradient-to-br from-[--electric]/10 to-white shadow-lg rounded-xl border-0 hover:scale-[1.013] transition-transform duration-200">
        <CardHeader>
          <CardTitle>Investimentos</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between overflow-x-auto sm:overflow-visible">
          <InvestmentList />
        </CardContent>
      </Card>
    </div>
  );
}
