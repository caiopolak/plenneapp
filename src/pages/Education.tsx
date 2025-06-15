
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialTips } from "@/components/education/FinancialTips";
import { SmartAlerts } from "@/components/education/SmartAlerts";
import { FinancialChallenges } from "@/components/education/FinancialChallenges";
import { FinancialModules } from "@/components/education/FinancialModules";
import { FinancialAssistant } from "@/components/education/FinancialAssistant";
import { BookOpen, Bell, Trophy, GraduationCap, Bot, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BudgetList } from "@/components/budget/BudgetList";

export default function Education() {
  return (
    <div className="min-h-screen p-0 sm:p-4 bg-gradient-to-br from-[#f4f4f4] to-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <BookOpen className="w-8 h-8 text-[--primary]" />
          <h1 className="text-3xl font-extrabold text-[#003f5c]">
            Educação & Saúde Financeira
          </h1>
        </div>
        <Tabs defaultValue="tips" className="space-y-4">

          {/* TabsList responsivo, com rolagem horizontal e destaque visual*/}
          <TabsList
            className="flex w-full overflow-x-auto no-scrollbar snap-x snap-mandatory bg-white shadow-sm rounded-lg border border-[#017F66]/30 px-1 sm:grid sm:grid-cols-6 sm:px-0"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <TabsTrigger
              value="tips"
              className="flex items-center gap-2 min-w-[120px] px-3 py-2 rounded-xl font-semibold text-base snap-center
                text-[#017F66] data-[state=active]:bg-[--primary] data-[state=active]:text-white
                data-[state=active]:shadow-[0_4px_20px_0_rgba(1,127,102,0.16)]
                border-2 border-transparent data-[state=active]:border-[#F5B942] transition-colors duration-200"
            >
              <BookOpen className="w-4 h-4" />
              Dicas
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="flex items-center gap-2 min-w-[120px] px-3 py-2 rounded-xl font-semibold text-base snap-center
                text-[#F5B942] data-[state=active]:bg-[#F5B942] data-[state=active]:text-white
                data-[state=active]:shadow-[0_4px_20px_0_rgba(245,185,66,0.11)]
                border-2 border-transparent data-[state=active]:border-[#017F66] transition-colors duration-200"
            >
              <Bell className="w-4 h-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="flex items-center gap-2 min-w-[120px] px-3 py-2 rounded-xl font-semibold text-base snap-center
                text-[#0057FF] data-[state=active]:bg-[#0057FF] data-[state=active]:text-white
                data-[state=active]:shadow-[0_4px_20px_0_rgba(0,87,255,0.10)]
                border-2 border-transparent data-[state=active]:border-[#F5B942] transition-colors duration-200"
            >
              <Trophy className="w-4 h-4" />
              Desafios
            </TabsTrigger>
            <TabsTrigger
              value="modules"
              className="flex items-center gap-2 min-w-[120px] px-3 py-2 rounded-xl font-semibold text-base snap-center
                text-[#F5B942] data-[state=active]:bg-[#017F66] data-[state=active]:text-white
                data-[state=active]:shadow-[0_4px_20px_0_rgba(1,127,102,0.13)]
                border-2 border-transparent data-[state=active]:border-[#F5B942] transition-colors duration-200"
            >
              <GraduationCap className="w-4 h-4" />
              Aulas
            </TabsTrigger>
            <TabsTrigger
              value="assistant"
              className="flex items-center gap-2 min-w-[120px] px-3 py-2 rounded-xl font-semibold text-base snap-center
                text-[#017F66] data-[state=active]:bg-[#F5B942] data-[state=active]:text-[#003f5c]
                data-[state=active]:shadow-[0_4px_16px_0_rgba(245,185,66,0.14)]
                border-2 border-transparent data-[state=active]:border-[#0057FF] transition-colors duration-200"
            >
              <Bot className="w-4 h-4" />
              Assistente
            </TabsTrigger>
            <TabsTrigger
              value="budgets"
              className="flex items-center gap-2 min-w-[140px] px-3 py-2 rounded-xl font-semibold text-base snap-center
                text-[#2f9e44] data-[state=active]:bg-[#2f9e44] data-[state=active]:text-white
                data-[state=active]:shadow-[0_4px_24px_0_rgba(47,158,68,0.13)]
                border-2 border-transparent data-[state=active]:border-[#F5B942] transition-colors duration-200"
            >
              <Wallet className="w-4 h-4" /> Orçamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tips" className="space-y-4">
            <FinancialTips />
          </TabsContent>
          <TabsContent value="alerts" className="space-y-4">
            <SmartAlerts />
          </TabsContent>
          <TabsContent value="challenges" className="space-y-4">
            <FinancialChallenges />
          </TabsContent>
          <TabsContent value="modules" className="space-y-4">
            <FinancialModules />
          </TabsContent>
          <TabsContent value="assistant" className="space-y-4">
            <FinancialAssistant />
          </TabsContent>
          <TabsContent value="budgets" className="space-y-4">
            <BudgetList />
          </TabsContent>
        </Tabs>
      </div>
      <style>
        {`
          /* Esconde scrollbar em mobile, mas mantém acessibilidade */
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  );
}

