
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { GoalList } from "@/components/goals/GoalList";
import { InvestmentList } from "@/components/investments/InvestmentList";
import { cn } from "@/lib/utils";

export function AnalyticsOverview() {
  return (
    <section
      className={cn(
        "w-full",
        "grid",
        "gap-8",
        "grid-cols-1",
        "lg:grid-cols-3",
        "items-stretch"
      )}
    >
      {/* Card Resumo financeiro */}
      <Card className="flex flex-col h-full shadow-2xl rounded-2xl border-0 bg-gradient-to-br from-primary to-secondary/80 overflow-hidden hover:scale-[1.018] transition-transform duration-250">
        <CardHeader className="bg-white/70 backdrop-blur-md pb-4">
          <CardTitle className="text-primary tracking-wide text-lg font-extrabold font-display">Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <FinancialSummary />
        </CardContent>
      </Card>

      {/* Card Metas */}
      <Card className="flex flex-col h-full shadow-lg rounded-2xl border-0 bg-gradient-to-br from-attention/10 via-yellow-50 to-white/90 overflow-hidden hover:scale-[1.014] transition-transform duration-250">
        <CardHeader className="pb-3 bg-white/60 backdrop-blur-md">
          <CardTitle className="text-attention font-bold flex items-center gap-2 font-display">
            <span>🎯</span> Metas & Desafios
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between overflow-x-auto sm:overflow-visible">
          <GoalList />
        </CardContent>
      </Card>

      {/* Card Investimentos */}
      <Card className="flex flex-col h-full shadow-lg rounded-2xl border-0 bg-gradient-to-br from-secondary/10 via-blue-50 to-white/90 overflow-hidden hover:scale-[1.012] transition-transform duration-250">
        <CardHeader className="pb-3 bg-white/60 backdrop-blur-md">
          <CardTitle className="text-secondary font-bold flex items-center gap-2 font-display">
            <span>💸</span> Investimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between overflow-x-auto sm:overflow-visible">
          <InvestmentList />
        </CardContent>
      </Card>
    </section>
  );
}
