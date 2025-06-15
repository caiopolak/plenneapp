import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { GoalList } from "@/components/goals/GoalList";
import { InvestmentList } from "@/components/investments/InvestmentList";
import { cn } from "@/lib/utils";

export function AnalyticsOverview() {
  return (
    <section
      className="w-full grid gap-8 grid-cols-1 lg:grid-cols-3 items-stretch"
    >
      {/* Card Resumo financeiro */}
      <div className="flex flex-col h-full shadow-2xl rounded-2xl border-0 bg-gradient-to-br from-[--background] to-[--surface] overflow-hidden hover:scale-[1.018] transition-transform duration-250">
        <div className="bg-white/85 backdrop-blur-md pb-4 px-6 pt-6 rounded-t-2xl">
          <span className="text-[--primary] tracking-wide text-lg font-extrabold font-display">Resumo Financeiro</span>
        </div>
        <div className="flex-1 flex flex-col justify-between px-6 py-4">
          <FinancialSummary />
        </div>
      </div>

      {/* Card Metas */}
      <div className="flex flex-col h-full shadow-lg rounded-2xl border-0 bg-white overflow-hidden hover:scale-[1.014] transition-transform duration-250">
        <div className="pb-3 bg-white/85 backdrop-blur-md px-6 pt-5">
          <span className="text-[--secondary] font-bold flex items-center gap-2 font-display">
            <span>🎯</span> Metas & Desafios
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-between overflow-x-auto sm:overflow-visible px-6 py-3">
          <GoalList />
        </div>
      </div>

      {/* Card Investimentos */}
      <div className="flex flex-col h-full shadow-lg rounded-2xl border-0 bg-white overflow-hidden hover:scale-[1.012] transition-transform duration-250">
        <div className="pb-3 bg-white/85 backdrop-blur-md px-6 pt-5">
          <span className="text-[--primary] font-bold flex items-center gap-2 font-display">
            <span>💸</span> Investimentos
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-between overflow-x-auto sm:overflow-visible px-6 py-3">
          <InvestmentList />
        </div>
      </div>
    </section>
  );
}
