
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Bell, Trophy, GraduationCap, Bot } from "lucide-react";
import { 
  EducationTipsTab,
  EducationAlertsTab,
  EducationChallengesTab,
  EducationModulesTab,
  EducationAssistantTab
} from "./education-tabs/_exports";

// Config de cada aba: label, valor, ícone e componente da tab.
const tabConfigs = [
  { label: "Dicas", value: "tips", icon: BookOpen, component: <EducationTipsTab /> },
  { label: "Alertas", value: "alerts", icon: Bell, component: <EducationAlertsTab /> },
  { label: "Desafios", value: "challenges", icon: Trophy, component: <EducationChallengesTab /> },
  { label: "Aulas", value: "modules", icon: GraduationCap, component: <EducationModulesTab /> },
  { label: "Assistente", value: "assistant", icon: Bot, component: <EducationAssistantTab /> },
];

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
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm rounded-lg">
            {tabConfigs.map(({ label, value, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-2 
                  data-[state=active]:bg-[#017F66] data-[state=active]:text-white
                  text-xs px-1 py-0.5
                  md:text-sm md:px-3 md:py-1.5
                  lg:text-base lg:px-3
                  truncate"
              >
                <Icon className="w-4 h-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabConfigs.map(({ value, component }) => (
            <TabsContent key={value} value={value} className="space-y-4">
              {component}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
