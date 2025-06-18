
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, MessageCircle } from "lucide-react";
import { FinancialAssistant } from "@/components/education/FinancialAssistant";
import { WhatsAppIntegration } from "@/components/whatsapp/WhatsAppIntegration";

export default function AssistantPage() {
  return (
    <div className="min-h-screen p-0 sm:p-4 bg-gradient-to-br from-[#f4f4f4] to-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Bot className="w-8 h-8 text-[--primary]" />
          <h1 className="text-3xl font-extrabold text-[#003f5c]">
            Assistente Plenne
          </h1>
        </div>
        
        <Tabs defaultValue="chatbot" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm rounded-lg">
            <TabsTrigger
              value="chatbot"
              className="flex items-center gap-2 
                data-[state=active]:bg-[#017F66] data-[state=active]:text-white
                text-sm px-4 py-2"
            >
              <Bot className="w-4 h-4" />
              Assistente IA
            </TabsTrigger>
            <TabsTrigger
              value="whatsapp"
              className="flex items-center gap-2 
                data-[state=active]:bg-[#017F66] data-[state=active]:text-white
                text-sm px-4 py-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chatbot" className="space-y-4">
            <FinancialAssistant />
          </TabsContent>
          
          <TabsContent value="whatsapp" className="space-y-4">
            <WhatsAppIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
