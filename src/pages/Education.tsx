
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
          {/* TabList VISUAL igual ao DashboardTabs */}
          <TabsList
            className={`
              mb-6 shadow-md bg-[#f7fafd]
              grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6
              rounded-xl px-1 py-[6px]
              gap-2 sm:gap-3
              w-full
              min-w-0
              transition-all
            `}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <TabsTrigger
              value="tips"
              className="flex gap-2 items-center font-display text-[--primary] data-[state=active]:bg-[#eaf6ee] data-[state=active]:text-[#003f5c] rounded-lg transition-all h-12 justify-center"
              style={{ fontSize: "1rem" }}
            >
              <BookOpen className="w-5 h-5" />
              Dicas
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="flex gap-2 items-center font-display text-[--primary] data-[state=active]:bg-[#eaf6ee] data-[state=active]:text-[#003f5c] rounded-lg transition-all h-12 justify-center"
              style={{ fontSize: "1rem" }}
            >
              <Bell className="w-5 h-5" />
              Alertas
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="flex gap-2 items-center font-display text-[--primary] data-[state=active]:bg-[#eaf6ee] data-[state=active]:text-[#003f5c] rounded-lg transition-all h-12 justify-center"
              style={{ fontSize: "1rem" }}
            >
              <Trophy className="w-5 h-5" />
              Desafios
            </TabsTrigger>
            <TabsTrigger
              value="modules"
              className="flex gap-2 items-center font-display text-[--primary] data-[state=active]:bg-[#eaf6ee] data-[state=active]:text-[#003f5c] rounded-lg transition-all h-12 justify-center"
              style={{ fontSize: "1rem" }}
            >
              <GraduationCap className="w-5 h-5" />
              Aulas
            </TabsTrigger>
            <TabsTrigger
              value="assistant"
              className="flex gap-2 items-center font-display text-[--primary] data-[state=active]:bg-[#eaf6ee] data-[state=active]:text-[#003f5c] rounded-lg transition-all h-12 justify-center"
              style={{ fontSize: "1rem" }}
            >
              <Bot className="w-5 h-5" />
              Assistente
            </TabsTrigger>
            <TabsTrigger
              value="budgets"
              className="flex gap-2 items-center font-display text-[--primary] data-[state=active]:bg-[#eaf6ee] data-[state=active]:text-[#003f5c] rounded-lg transition-all h-12 justify-center"
              style={{ fontSize: "1rem" }}
            >
              <Wallet className="w-5 h-5" /> Orçamentos
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
