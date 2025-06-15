
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
    <div className="min-h-screen p-0 bg-gradient-to-br from-[#f4f4f4] to-white">
      <div
        className="
          max-w-4xl mx-auto
          px-3 sm:px-6 
          pb-10 
          pt-6 sm:pt-10
        "
      >
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-[--primary]" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003f5c]">
            Educação & Saúde Financeira
          </h1>
        </div>
        <Tabs defaultValue="tips" className="space-y-4 w-full">
          <TabsList
            className="
              grid grid-cols-1 
              sm:grid-cols-3 lg:grid-cols-6 gap-2 
              rounded-xl bg-white/95 shadow-sm border border-[#e8e8e8]
              px-1 py-1
              w-full
              "
          >
            <TabsTrigger
              value="tips"
              className="
                flex items-center gap-1 sm:gap-2 px-2 py-2 rounded-lg font-semibold text-base
                text-[#017F66] bg-white
                border border-[#e8e8e8]
                hover:border-[#017F66] hover:bg-[#f5f5f5]
                data-[state=active]:border-[--primary] data-[state=active]:bg-[#e5faf4]
                data-[state=active]:text-[--primary]
                transition-colors duration-200
                w-full min-h-10 sm:min-h-[auto]
              "
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm sm:text-base">Dicas</span>
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="
                flex items-center gap-1 sm:gap-2 px-2 py-2 rounded-lg font-semibold text-base
                text-[#F5B942] bg-white
                border border-[#e8e8e8]
                hover:border-[#F5B942] hover:bg-[#fbf6ea]
                data-[state=active]:border-[#F5B942] data-[state=active]:bg-[#fef5dd]
                data-[state=active]:text-[#8a6b0f]
                transition-colors duration-200
                w-full min-h-10 sm:min-h-[auto]
              "
            >
              <Bell className="w-4 h-4" />
              <span className="text-sm sm:text-base">Alertas</span>
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="
                flex items-center gap-1 sm:gap-2 px-2 py-2 rounded-lg font-semibold text-base
                text-[#0057FF] bg-white
                border border-[#e8e8e8]
                hover:border-[#0057FF] hover:bg-[#eef4ff]
                data-[state=active]:border-[#0057FF] data-[state=active]:bg-[#e5efff]
                data-[state=active]:text-[#0057FF]
                transition-colors duration-200
                w-full min-h-10 sm:min-h-[auto]
              "
            >
              <Trophy className="w-4 h-4" />
              <span className="text-sm sm:text-base">Desafios</span>
            </TabsTrigger>
            <TabsTrigger
              value="modules"
              className="
                flex items-center gap-1 sm:gap-2 px-2 py-2 rounded-lg font-semibold text-base
                text-[#017F66] bg-white
                border border-[#e8e8e8]
                hover:border-[#017F66] hover:bg-[#f5f5f5]
                data-[state=active]:border-[--primary] data-[state=active]:bg-[#e5faf4]
                data-[state=active]:text-[--primary]
                transition-colors duration-200
                w-full min-h-10 sm:min-h-[auto]
              "
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm sm:text-base">Aulas</span>
            </TabsTrigger>
            <TabsTrigger
              value="assistant"
              className="
                flex items-center gap-1 sm:gap-2 px-2 py-2 rounded-lg font-semibold text-base
                text-[#003f5c] bg-white
                border border-[#e8e8e8]
                hover:border-[#003f5c] hover:bg-[#efefef]
                data-[state=active]:border-[#003f5c] data-[state=active]:bg-[#e4eafd]
                data-[state=active]:text-[#003f5c]
                transition-colors duration-200
                w-full min-h-10 sm:min-h-[auto]
              "
            >
              <Bot className="w-4 h-4" />
              <span className="text-sm sm:text-base">Assistente</span>
            </TabsTrigger>
            <TabsTrigger
              value="budgets"
              className="
                flex items-center gap-1 sm:gap-2 px-2 py-2 rounded-lg font-semibold text-base
                text-[#2f9e44] bg-white
                border border-[#e8e8e8]
                hover:border-[#2f9e44] hover:bg-[#edfaef]
                data-[state=active]:border-[#2f9e44] data-[state=active]:bg-[#e3f7e7]
                data-[state=active]:text-[#2f9e44]
                transition-colors duration-200
                w-full min-h-10 sm:min-h-[auto]
              "
            >
              <Wallet className="w-4 h-4" />
              <span className="text-sm sm:text-base">Orçamentos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tips" className="space-y-4 mt-4 sm:mt-6">
            <FinancialTips />
          </TabsContent>
          <TabsContent value="alerts" className="space-y-4 mt-4 sm:mt-6">
            <SmartAlerts />
          </TabsContent>
          <TabsContent value="challenges" className="space-y-4 mt-4 sm:mt-6">
            <FinancialChallenges />
          </TabsContent>
          <TabsContent value="modules" className="space-y-4 mt-4 sm:mt-6">
            <FinancialModules />
          </TabsContent>
          <TabsContent value="assistant" className="space-y-4 mt-4 sm:mt-6">
            <FinancialAssistant />
          </TabsContent>
          <TabsContent value="budgets" className="space-y-4 mt-4 sm:mt-6">
            <BudgetList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

