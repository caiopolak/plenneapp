
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialAssistant } from "@/components/education/FinancialAssistant";
import { WhatsAppIntegration } from "@/components/whatsapp/WhatsAppIntegration";
import { MessageCircle, MessageSquare } from "lucide-react";

export default function AssistantPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Assistente Inteligente</h1>
        <p className="text-muted-foreground">
          Utilize nossos assistentes para obter insights financeiros e automatizar suas consultas via WhatsApp.
        </p>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Assistente Chat
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp Bot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Assistente Financeiro IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FinancialAssistant />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Integração WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WhatsAppIntegration />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
