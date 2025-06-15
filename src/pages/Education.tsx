import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialTips } from "@/components/education/FinancialTips";
import { SmartAlerts } from "@/components/education/SmartAlerts";
import { FinancialChallenges } from "@/components/education/FinancialChallenges";
import { FinancialModules } from "@/components/education/FinancialModules";
import { FinancialAssistant } from "@/components/education/FinancialAssistant";
import { BookOpen, Bell, Trophy, GraduationCap, Bot, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BudgetList } from "@/components/budget/BudgetList"; // Adicionado aqui

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
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm rounded-lg">
            <TabsTrigger
              value="tips"
              className="flex items-center gap-2 
                data-[state=active]:bg-[#017F66] data-[state=active]:text-white
                text-xs px-1 py-0.5
                md:text-sm md:px-3 md:py-1.5
                lg:text-base lg:px-3
                truncate"
            >
              <BookOpen className="w-4 h-4" />
              Dicas
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="flex items-center gap-2 
                data-[state=active]:bg-[#017F66] data-[state=active]:text-white
                text-xs px-1 py-0.5
                md:text-sm md:px-3 md:py-1.5
                lg:text-base lg:px-3
                truncate"
            >
              <Bell className="w-4 h-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="flex items-center gap-2 
                data-[state=active]:bg-[#017F66] data-[state=active]:text-white
                text-xs px-1 py-0.5
                md:text-sm md:px-3 md:py-1.5
                lg:text-base lg:px-3
                truncate"
            >
              <Trophy className="w-4 h-4" />
              Desafios
            </TabsTrigger>
            <TabsTrigger
              value="modules"
              className="flex items-center gap-2 
                data-[state=active]:bg-[#017F66] data-[state=active]:text-white
                text-xs px-1 py-0.5
                md:text-sm md:px-3 md:py-1.5
                lg:text-base lg:px-3
                truncate"
            >
              <GraduationCap className="w-4 h-4" />
              Aulas
            </TabsTrigger>
            <TabsTrigger
              value="assistant"
              className="flex items-center gap-2 
                data-[state=active]:bg-[#017F66] data-[state=active]:text-white
                text-xs px-1 py-0.5
                md:text-sm md:px-3 md:py-1.5
                lg:text-base lg:px-3
                truncate"
            >
              <Bot className="w-4 h-4" />
              Assistente
            </TabsTrigger>
            <TabsTrigger
              value="budgets"
              className="flex items-center gap-2 
                data-[state=active]:bg-[#2f9e44] data-[state=active]:text-white
                text-xs px-1 py-0.5
                md:text-sm md:px-3 md:py-1.5
                lg:text-base lg:px-3
                truncate"
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
