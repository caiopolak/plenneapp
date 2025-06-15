
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
          {/* Menus/tabs empilhados em mobile, linha em desktop, cores neutras */}
          <TabsList
            className="
              grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2
              rounded-xl bg-white/80 shadow-sm border border-[#e8e8e8]
              px-2 py-2
              "
          >
            <TabsTrigger
              value="tips"
              className="
                flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-base
                text-[#017F66] bg-white
                border border-[#e8e8e8]
                hover:border-[#017F66] hover:bg-[#f5f5f5]
                data-[state=active]:border-[--primary] data-[state=active]:bg-[#e5faf4]
                data-[state=active]:text-[--primary]
                transition-colors duration-200
                w-full
              "
            >
              <BookOpen className="w-4 h-4" />
              Dicas
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="
                flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-base
                text-[#F5B942] bg-white
                border border-[#e8e8e8]
                hover:border-[#F5B942] hover:bg-[#fbf6ea]
                data-[state=active]:border-[#F5B942] data-[state=active]:bg-[#fef5dd]
                data-[state=active]:text-[#8a6b0f]
                transition-colors duration-200
                w-full
              "
            >
              <Bell className="w-4 h-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="
                flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-base
                text-[#0057FF] bg-white
                border border-[#e8e8e8]
                hover:border-[#0057FF] hover:bg-[#eef4ff]
                data-[state=active]:border-[#0057FF] data-[state=active]:bg-[#e5efff]
                data-[state=active]:text-[#0057FF]
                transition-colors duration-200
                w-full
              "
            >
              <Trophy className="w-4 h-4" />
              Desafios
            </TabsTrigger>
            <TabsTrigger
              value="modules"
              className="
                flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-base
                text-[#017F66] bg-white
                border border-[#e8e8e8]
                hover:border-[#017F66] hover:bg-[#f5f5f5]
                data-[state=active]:border-[#017F66] data-[state=active]:bg-[#e5faf4]
                data-[state=active]:text-[--primary]
                transition-colors duration-200
                w-full
              "
            >
              <GraduationCap className="w-4 h-4" />
              Aulas
            </TabsTrigger>
            <TabsTrigger
              value="assistant"
              className="
                flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-base
                text-[#003f5c] bg-white
                border border-[#e8e8e8]
                hover:border-[#003f5c] hover:bg-[#efefef]
                data-[state=active]:border-[#003f5c] data-[state=active]:bg-[#e4eafd]
                data-[state=active]:text-[#003f5c]
                transition-colors duration-200
                w-full
              "
            >
              <Bot className="w-4 h-4" />
              Assistente
            </TabsTrigger>
            <TabsTrigger
              value="budgets"
              className="
                flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-base
                text-[#2f9e44] bg-white
                border border-[#e8e8e8]
                hover:border-[#2f9e44] hover:bg-[#edfaef]
                data-[state=active]:border-[#2f9e44] data-[state=active]:bg-[#e3f7e7]
                data-[state=active]:text-[#2f9e44]
                transition-colors duration-200
                w-full
              "
            >
              <Wallet className="w-4 h-4" />
              Orçamentos
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
