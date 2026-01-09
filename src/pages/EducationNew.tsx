import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FinancialTips } from "@/components/education/FinancialTips";
import { FinancialChallengesNew } from "@/components/education/FinancialChallengesNew";
import { CourseViewer } from "@/components/education/CourseViewer";
import { CourseModuleManager } from "@/components/education/admin/CourseModuleManager";
import { BookOpen, Lightbulb, Trophy, Settings } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Badge } from "@/components/ui/badge";

export default function EducationNew() {
  const [activeTab, setActiveTab] = useState("tips");
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight brand-gradient-text">
            Educação Financeira
          </h1>
          {isAdmin && (
            <Badge className="bg-secondary text-secondary-foreground">
              <Settings className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-2">
          Desenvolva suas habilidades financeiras com dicas, cursos completos e desafios
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full bg-card border border-border shadow-sm ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger 
            value="tips" 
            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Dicas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="courses" 
            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Cursos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="challenges" 
            className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Desafios</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger 
              value="admin" 
              className="flex items-center gap-2 data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Gerenciar</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="tips" className="mt-6">
          <FinancialTips />
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <CourseViewer />
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <FinancialChallengesNew />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="mt-6">
            <CourseModuleManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
