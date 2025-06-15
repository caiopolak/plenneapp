import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialTips } from "@/components/education/FinancialTips";
import { SmartAlerts } from "@/components/education/SmartAlerts";
import { FinancialChallenges } from "@/components/education/FinancialChallenges";
import { MonthlyBudget } from "@/components/budget/MonthlyBudget";
import { WhatsAppIntegration } from "@/components/whatsapp/WhatsAppIntegration";
import { BookOpen, Bell, Trophy, DollarSign, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type Tip = { id: number; text: string };
type Alert = { id: number; text: string };
type Challenge = { id: number; text: string; completed: boolean };

export default function Education() {
  const { toast } = useToast();
  const [tips, setTips] = useState<Tip[]>([
    { id: 1, text: "Anote todos os seus gastos diariamente." },
    { id: 2, text: "Crie metas reais para o mês e acompanhe o progresso." },
  ]);
  const [newTip, setNewTip] = useState("");
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 1, text: "Atenção: Seu gasto em alimentação está próximo do limite de sua meta!" },
  ]);
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: 1, text: "Ficar 1 semana sem pedir delivery.", completed: false },
  ]);

  // CRUD mock handlers para edição típica futura com Supabase
  const addTip = () => {
    if (newTip.length > 3) {
      setTips([...tips, { id: Date.now(), text: newTip }]);
      setNewTip("");
      toast({ title: "Nova dica adicionada!" });
    }
  };
  const completeChallenge = (id: number) => {
    setChallenges(cs =>
      cs.map(c => (c.id === id ? { ...c, completed: true } : c))
    );
    toast({ title: "Parabéns!", description: "Desafio concluído." });
  };

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
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm rounded-lg">
            <TabsTrigger value="tips" className="flex items-center gap-2 data-[state=active]:bg-[#017F66] data-[state=active]:text-white">
              <BookOpen className="w-4 h-4" />
              Dicas
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2 data-[state=active]:bg-[#017F66] data-[state=active]:text-white">
              <Bell className="w-4 h-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2 data-[state=active]:bg-[#017F66] data-[state=active]:text-white">
              <Trophy className="w-4 h-4" />
              Desafios
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2 data-[state=active]:bg-[#017F66] data-[state=active]:text-white">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tips" className="space-y-4">
            <Card>
              <CardContent className="p-6 flex flex-col gap-4">
                <h2 className="text-lg font-bold">Dicas financeiras</h2>
                <ul className="list-disc list-inside space-y-2">
                  {tips.map(tip => (
                    <li key={tip.id} className="text-md">{tip.text}</li>
                  ))}
                </ul>
                <div className="flex gap-2 mt-4">
                  <Input value={newTip} onChange={e => setNewTip(e.target.value)} placeholder="Adicionar nova dica..." />
                  <Button onClick={addTip} variant="secondary">
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-3">Alertas inteligentes</h2>
                <ul className="list-disc list-inside space-y-2">
                  {alerts.map(alert => (
                    <li key={alert.id}>{alert.text}</li>
                  ))}
                </ul>
                <Button className="mt-4" onClick={() => toast({ title: "Personalizado!", description: "Em breve: alertas configuráveis..." })}>
                  Configurar Alertas
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="challenges" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-2">Desafios conquistáveis</h2>
                <ul className="space-y-2">
                  {challenges.map(challenge => (
                    <li key={challenge.id} className="flex items-center gap-2">
                      <span className={challenge.completed ? "text-green-600 line-through" : "font-semibold"}>{challenge.text}</span>
                      {!challenge.completed && (
                        <Button size="sm" variant="outline" onClick={() => completeChallenge(challenge.id)}>
                          Marcar como feito
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
                <Button className="mt-4" variant="ghost" onClick={() => toast({ title: "Em breve: novos desafios!" })}>
                  + Novo desafio em breve
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="whatsapp">
            <WhatsAppIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
