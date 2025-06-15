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
    <div className="min-h-screen px-0 pt-0 pb-6 sm:p-4 bg-gradient-to-br from-[#f4f4f4] to-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-3 sm:gap-4">
          <BookOpen className="w-7 h-7 text-[--primary] sm:w-8 sm:h-8" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003f5c]">Educação & Saúde Financeira</h1>
        </div>
        {/* Espaço extra no topo para afastar as abas do header e evitar sobreposição */}
        <div className="mt-8 sm:mt-10" />
        <Tabs defaultValue="tips" className="space-y-4">
          <TabsList
            className={`
              grid 
              grid-cols-2
              gap-2
              bg-white
              shadow-md
              rounded-lg
              p-2
              sm:grid-cols-6
              sm:gap-1
              sm:p-2
              w-full
              transition-all
            `}
          >
            <TabsTrigger
              value="tips"
              className="
                flex items-center gap-1 justify-center
                rounded-md
                px-1 py-2
                text-xs sm:text-sm
                font-semibold
                data-[state=active]:bg-[#017F66]
                data-[state=active]:text-white
                data-[state=inactive]:bg-[#f4f4f4]
                data-[state=inactive]:text-[#003f5c]
                transition-all
                h-9
              "
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              Dicas
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="
                flex items-center gap-1 justify-center
                rounded-md
                px-1 py-2
                text-xs sm:text-sm
                font-semibold
                data-[state=active]:bg-[#017F66]
                data-[state=active]:text-white
                data-[state=inactive]:bg-[#f4f4f4]
                data-[state=inactive]:text-[#003f5c]
                transition-all
                h-9
              "
            >
              <Bell className="w-4 h-4 shrink-0" />
              Alertas
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="
                flex items-center gap-1 justify-center
                rounded-md
                px-1 py-2
                text-xs sm:text-sm
                font-semibold
                data-[state=active]:bg-[#017F66]
                data-[state=active]:text-white
                data-[state=inactive]:bg-[#f4f4f4]
                data-[state=inactive]:text-[#003f5c]
                transition-all
                h-9
              "
            >
              <Trophy className="w-4 h-4 shrink-0" />
              Desafios
            </TabsTrigger>
            <TabsTrigger
              value="modules"
              className="
                flex items-center gap-1 justify-center
                rounded-md
                px-1 py-2
                text-xs sm:text-sm
                font-semibold
                data-[state=active]:bg-[#017F66]
                data-[state=active]:text-white
                data-[state=inactive]:bg-[#f4f4f4]
                data-[state=inactive]:text-[#003f5c]
                transition-all
                h-9
              "
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              Aulas
            </TabsTrigger>
            <TabsTrigger
              value="assistant"
              className="
                flex items-center gap-1 justify-center
                rounded-md
                px-1 py-2
                text-xs sm:text-sm
                font-semibold
                data-[state=active]:bg-[#017F66]
                data-[state=active]:text-white
                data-[state=inactive]:bg-[#f4f4f4]
                data-[state=inactive]:text-[#003f5c]
                transition-all
                h-9
              "
            >
              <Bot className="w-4 h-4 shrink-0" />
              Assistente
            </TabsTrigger>
            <TabsTrigger
              value="budgets"
              className="
                flex items-center gap-1 justify-center
                rounded-md
                px-1 py-2
                text-xs sm:text-sm
                font-semibold
                data-[state=active]:bg-[#2f9e44]
                data-[state=active]:text-white
                data-[state=inactive]:bg-[#f4f4f4]
                data-[state=inactive]:text-[#003f5c]
                transition-all
                h-9
              "
            >
              <Wallet className="w-4 h-4 shrink-0" /> Orçamentos
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
    </div>
  );
}
