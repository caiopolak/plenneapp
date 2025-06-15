
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
    <div className="min-h-screen p-0 sm:p-4 bg-gradient-to-br from-[#f4f4f4] to-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <BookOpen className="w-8 h-8 text-[--primary]" />
          <h1 className="text-3xl font-extrabold text-[#003f5c]">
            Educação & Saúde Financeira
          </h1>
        </div>
        <Tabs defaultValue="tips" className="space-y-4">
          {/* Grid responsiva para as abas ao estilo dos botões do dashboard */}
          <TabsList
            className={`
              w-full
              grid
              grid-cols-3
              md:grid-cols-6
              gap-2
              bg-[#f7fafd]
              p-1
              shadow-sm
              rounded-xl
              mb-2
              border
              border-[#e6eaf0]
            `}
          >
            <TabsTrigger
              value="tips"
              className={`
                flex flex-col items-center justify-center
                h-12 px-0 py-0
                font-display text-[#003f5c]
                data-[state=active]:bg-[#2f9e44]
                data-[state=active]:text-white
                data-[state=active]:shadow-accent
                rounded-lg
                transition-all
                text-xs sm:text-sm font-medium
                gap-1
                hover:bg-[#017f66]/90 hover:text-white
                border-none
                focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#017f66]
                shadow-[0_1px_4px_0_rgba(47,158,68,0.06)]
                min-w-0
              `}
              style={{
                minWidth: 0
              }}
            >
              <BookOpen className="w-4 h-4 mb-0" />
              Dicas
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className={`
                flex flex-col items-center justify-center
                h-12 px-0 py-0
                font-display text-[#003f5c]
                data-[state=active]:bg-[#2f9e44]
                data-[state=active]:text-white
                data-[state=active]:shadow-accent
                rounded-lg
                transition-all
                text-xs sm:text-sm font-medium
                gap-1
                hover:bg-[#017f66]/90 hover:text-white
                border-none
                focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#017f66]
                shadow-[0_1px_4px_0_rgba(47,158,68,0.06)]
                min-w-0
              `}
              style={{
                minWidth: 0
              }}
            >
              <Bell className="w-4 h-4 mb-0" />
              Alertas
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className={`
                flex flex-col items-center justify-center
                h-12 px-0 py-0
                font-display text-[#003f5c]
                data-[state=active]:bg-[#2f9e44]
                data-[state=active]:text-white
                data-[state=active]:shadow-accent
                rounded-lg
                transition-all
                text-xs sm:text-sm font-medium
                gap-1
                hover:bg-[#017f66]/90 hover:text-white
                border-none
                focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#017f66]
                shadow-[0_1px_4px_0_rgba(47,158,68,0.06)]
                min-w-0
              `}
              style={{
                minWidth: 0
              }}
            >
              <Trophy className="w-4 h-4 mb-0" />
              Desafios
            </TabsTrigger>
            <TabsTrigger
              value="modules"
              className={`
                flex flex-col items-center justify-center
                h-12 px-0 py-0
                font-display text-[#003f5c]
                data-[state=active]:bg-[#2f9e44]
                data-[state=active]:text-white
                data-[state=active]:shadow-accent
                rounded-lg
                transition-all
                text-xs sm:text-sm font-medium
                gap-1
                hover:bg-[#017f66]/90 hover:text-white
                border-none
                focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#017f66]
                shadow-[0_1px_4px_0_rgba(47,158,68,0.06)]
                min-w-0
              `}
              style={{
                minWidth: 0
              }}
            >
              <GraduationCap className="w-4 h-4 mb-0" />
              Aulas
            </TabsTrigger>
            <TabsTrigger
              value="assistant"
              className={`
                flex flex-col items-center justify-center
                h-12 px-0 py-0
                font-display text-[#003f5c]
                data-[state=active]:bg-[#2f9e44]
                data-[state=active]:text-white
                data-[state=active]:shadow-accent
                rounded-lg
                transition-all
                text-xs sm:text-sm font-medium
                gap-1
                hover:bg-[#017f66]/90 hover:text-white
                border-none
                focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#017f66]
                shadow-[0_1px_4px_0_rgba(47,158,68,0.06)]
                min-w-0
              `}
              style={{
                minWidth: 0
              }}
            >
              <Bot className="w-4 h-4 mb-0" />
              Assistente
            </TabsTrigger>
            <TabsTrigger
              value="budgets"
              className={`
                flex flex-col items-center justify-center
                h-12 px-0 py-0
                font-display text-[#003f5c]
                data-[state=active]:bg-[#2f9e44]
                data-[state=active]:text-white
                data-[state=active]:shadow-accent
                rounded-lg
                transition-all
                text-xs sm:text-sm font-medium
                gap-1
                hover:bg-[#017f66]/90 hover:text-white
                border-none
                focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#017f66]
                shadow-[0_1px_4px_0_rgba(47,158,68,0.06)]
                min-w-0
              `}
              style={{
                minWidth: 0
              }}
            >
              <Wallet className="w-4 h-4 mb-0" />
              Orçamentos
            </TabsTrigger>
          </TabsList>
          {/* Conteúdos das abas */}
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
