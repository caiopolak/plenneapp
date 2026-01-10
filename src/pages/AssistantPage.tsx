import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FinancialAssistant } from "@/components/education/FinancialAssistant";
import { WhatsAppIntegration } from "@/components/whatsapp/WhatsAppIntegration";
import { MessageCircle, MessageSquare, Crown, Building2 } from "lucide-react";
import { usePlanAccess } from "@/hooks/usePlanAccess";

export default function AssistantPage() {
  const { currentPlan, isFree, isBusiness } = usePlanAccess();

  const getPlanBadge = () => {
    if (isBusiness) {
      return (
        <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400">
          <Building2 className="w-3 h-3 mr-1" />
          Ilimitado
        </Badge>
      );
    }
    if (!isFree) {
      return (
        <Badge variant="outline" className="border-primary/50 text-primary">
          <Crown className="w-3 h-3 mr-1" />
          PRO
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-muted-foreground/40">
        Gratuito
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Assistente Inteligente</h1>
          {getPlanBadge()}
        </div>
        <p className="text-muted-foreground">
          {isBusiness 
            ? "Utilize nossos assistentes ilimitados para insights financeiros e automação via WhatsApp."
            : isFree 
              ? "Experimente o assistente IA com 5 perguntas gratuitas por mês. Faça upgrade para mais!"
              : "Utilize nossos assistentes para obter insights financeiros e automatizar consultas."
          }
        </p>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Assistente Chat
            {!isFree && <Crown className="h-3 w-3 text-primary" />}
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            WhatsApp Bot
            <Building2 className="h-3 w-3 text-amber-500" />
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
