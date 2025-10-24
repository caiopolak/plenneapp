import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FinancialTips } from "@/components/education/FinancialTips";
import { EducationModulesManager } from "@/components/education/EducationModulesManager";
import { FinancialChallenges } from "@/components/education/FinancialChallenges";
import { BookOpen, Lightbulb, Trophy } from "lucide-react";

export default function EducationNew() {
  const [activeTab, setActiveTab] = useState("tips");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2 brand-gradient-text">
          Educação Financeira
        </h1>
        <p className="text-muted-foreground">
          Desenvolva suas habilidades financeiras com dicas, módulos e desafios
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card border border-border shadow-sm">
          <TabsTrigger 
            value="tips" 
            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Lightbulb className="w-4 h-4" />
            Dicas Personalizadas
          </TabsTrigger>
          <TabsTrigger 
            value="modules" 
            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <BookOpen className="w-4 h-4" />
            Módulos de Curso
          </TabsTrigger>
          <TabsTrigger 
            value="challenges" 
            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Trophy className="w-4 h-4" />
            Desafios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tips" className="mt-6">
          <FinancialTips />
        </TabsContent>

        <TabsContent value="modules" className="mt-6">
          <EducationModulesManager />
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <FinancialChallenges />
        </TabsContent>
      </Tabs>
    </div>
  );
}