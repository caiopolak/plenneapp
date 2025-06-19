
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  EducationTipsTab,
  EducationModulesTab,
  EducationChallengesTab,
  EducationBudgetsTab,
  EducationAlertsTab
} from './education-tabs/_exports';

export default function Education() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Educação Financeira</h1>
        <p className="text-muted-foreground">
          Aprenda sobre finanças pessoais com nossos módulos educativos, dicas práticas e desafios interativos.
        </p>
      </div>

      <Tabs defaultValue="tips" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tips">Dicas</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="challenges">Desafios</TabsTrigger>
          <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="tips" className="mt-6">
          <EducationTipsTab />
        </TabsContent>

        <TabsContent value="modules" className="mt-6">
          <EducationModulesTab />
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <EducationChallengesTab />
        </TabsContent>

        <TabsContent value="budgets" className="mt-6">
          <EducationBudgetsTab />
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <EducationAlertsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
