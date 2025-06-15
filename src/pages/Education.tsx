
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialTips } from "@/components/education/FinancialTips";
import { SmartAlerts } from "@/components/education/SmartAlerts";
import { FinancialChallenges } from "@/components/education/FinancialChallenges";
import { FinancialModules } from "@/components/education/FinancialModules";
import { FinancialAssistant } from "@/components/education/FinancialAssistant";
import { BookOpen, Bell, Trophy, GraduationCap, Bot, Wallet } from "lucide-react";
import { BudgetList } from "@/components/budget/BudgetList";

export default function Education() {
  return (
    <div className="min-h-screen px-0 pt-0 pb-6 sm:p-4 bg-gradient-to-br from-[#f4f4f4] to-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-3 sm:gap-4">
          <BookOpen className="w-7 h-7 text-[--primary] sm:w-8 sm:h-8" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003f5c]">
            Educação & Saúde Financeira
          </h1>
        </div>
        <Tabs defaultValue="tips" className="space-y-4">
          {/* Custom layout for the navigation (TabsList) */}
          <TabsList
            className={`
              grid w-full
              grid-cols-2 grid-rows-3 gap-2
              bg-white
              shadow-md
              rounded-lg
              px-2 py-3

              sm:grid-cols-3 sm:grid-rows-2 sm:gap-2 sm:px-4 sm:py-3
              md:grid-cols-6 md:grid-rows-1 md:gap-2
              md:px-2 md:py-2
              transition-all
            `}
          >
            <TabsTrigger
              value="tips"
              className="
                flex flex-col items-center justify-center
                rounded-md
                px-1.5 py-2
                text-xs sm:text-sm
                font-semibold
                bg-[#f4f4f4]
                data-[state=active]:bg-[#017F66]
                data-[state=active]:text-white
                data-[state=inactive]:bg-[#f4f4f4]
                data-[state=inactive]:text-[#003f5c]
                transition-all
                h-12
                min-w-0
                w-full
              "
            >
              <BookOpen className="w-4 h-4 mb-1" />
              Dicas
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="
                flex flex-col items-center justify-center
                rounded-md
                px-1.5 py-2
                text-xs sm:text-sm
                font-semibold
                bg-[#f4f4f4]
                data-[state=active]:bg-[#017F66]
                data-[state=active]:text-white
                data-[state=inactive]:bg-[#f4f4f4]
                data-[state=inactive]:text-[#003f5c]
                transition-all
                h-12
                min-w-0
                w-full
              "
            >
              <Bell className="w-4 h-4 mb-1" />
              Alertas
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="
                flex flex-col items-center justify-center
                rounded-md
                px-1.5 py-2
                text-xs sm:text-sm
                font-semibold
                bg-[#f4f4f4]
                data-[state=active]:bg-[#017F66]
                data-[state=active]:text-white
                data-[state=inactive]:bg-[#f4f4f4]
                data-[state=inactive]:text-[#003f5c]
                transition-all
                h-12
                min-w-0
                w-full
              "
            >
              <Trophy className="w-4 h-4 mb-1" />
              Desafios
            </TabsTrigger>
            <TabsTrigger
              value="modules"
              className="
                flex flex-col items-center justify-center
                rounded-md
                px-1.5 py-2
                text-xs sm:text-sm
                font-semibold
                bg-[#f4f4f4]
                data-[state=active]:bg-[#017F66]
                data-[state=active]:text-white
                data-[state=inactive]:bg-[#f4f4f4]
                data-[state=inactive]:text-[#003f5c]
                transition-all
                h-12
                min-w-0
                w-full
              "
            >
              <GraduationCap className="w-4 h-4 mb-1" />
              Aulas
            </TabsTrigger>
            <TabsTrigger
              value="assistant"
              className="
                flex flex-col items-center justify-center
                rounded-md
                px-1.5 py-2
                text-xs sm:text-sm
                font-semibold
                bg-[#f4f4f4]
                data-[state=active]:bg-[#017F66]
                data-[state=active]:text-white
                data-[state=inactive]:bg-[#f4f4f4]
                data-[state=inactive]:text-[#003f5c]
                transition-all
                h-12
                min-w-0
                w-full
              "
            >
              <Bot className="w-4 h-4 mb-1" />
              Assistente
            </TabsTrigger>
            <TabsTrigger
              value="budgets"
              className="
                flex flex-col items-center justify-center
                rounded-md
                px-1.5 py-2
                text-xs sm:text-sm
                font-semibold
                bg-[#f4f4f4]
                data-[state=active]:bg-[#2f9e44]
                data-[state=active]:text-white
                data-[state=inactive]:bg-[#f4f4f4]
                data-[state=inactive]:text-[#003f5c]
                transition-all
                h-12
                min-w-0
                w-full
              "
            >
              <Wallet className="w-4 h-4 mb-1" /> Orçamentos
            </TabsTrigger>
          </TabsList>
          {/* Conteúdo das abas */}
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
