import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Crown, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { callFinancialAssistant } from "@/utils/callFinancialAssistant";
import { useToast } from "@/hooks/use-toast";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useAssistantUsage } from "@/hooks/useAssistantUsage";
import { useNavigate } from "react-router-dom";
import { AssistantUsageCounter } from "@/components/subscription/AssistantUsageCounter";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function FinancialAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isFree, isBusiness } = usePlanAccess();
  const { usage, incrementUsage } = useAssistantUsage();
  const navigate = useNavigate();

  const isLimitReached = !usage.canAsk;

  const handleSend = async () => {
    if (input.trim().length === 0) return;
    
    if (isLimitReached) {
      toast({
        variant: "destructive",
        title: "Limite de perguntas atingido",
        description: `Você usou todas as ${usage.maxCount} perguntas deste mês. Faça upgrade para continuar!`
      });
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const answer = await callFinancialAssistant(
        nextMessages.map(msg => ({ role: msg.role, content: msg.content }))
      );
      setMessages(msgs => [...msgs, { role: "assistant", content: answer }]);
      await incrementUsage();
    } catch (error: any) {
      toast({
        title: "Erro ao consultar a IA",
        description: error?.message || "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
      setMessages(msgs => [...msgs, { role: "assistant", content: "Ocorreu um erro. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-primary">Assistente Financeiro IA</h2>
            </div>
            <AssistantUsageCounter variant="compact" />
          </div>

          {isFree && !isLimitReached && (
            <div className="mb-4 p-3 bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
                <Crown className="w-4 h-4" />
                <span className="font-medium">Plano Gratuito - {usage.remaining} perguntas restantes</span>
              </div>
            </div>
          )}

          {isLimitReached && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-center">
              <Lock className="w-8 h-8 text-destructive mx-auto mb-2" />
              <h3 className="font-semibold text-destructive mb-1">Limite Atingido</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Você usou todas as {usage.maxCount} perguntas deste mês.
              </p>
              <Button onClick={() => navigate('/app/plans')} className="bg-gradient-to-r from-primary to-secondary">
                <Crown className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-2 min-h-[240px] max-h-72 overflow-y-auto bg-muted rounded-lg p-4 mb-4">
            {messages.length === 0 ? (
              <div className="text-muted-foreground">
                Pergunte sobre suas finanças, peça dicas ou desafios!<br />
                Exemplo: <span className="italic">"Qual desafio financeiro posso cumprir este mês?"</span>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`text-sm rounded px-3 py-2 ${msg.role === "user" ? "bg-card self-end border border-border font-semibold" : "bg-primary text-primary-foreground self-start whitespace-pre-line"}`}>
                  {msg.content}
                </div>
              ))
            )}
            {loading && <div className="text-xs text-muted-foreground">Pensando...</div>}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Pergunte algo…"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading || isLimitReached}
              onKeyDown={e => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} disabled={loading || !input || isLimitReached}>Enviar</Button>
          </div>

          {!isBusiness && (
            <div className="mt-3 text-center">
              <Button variant="link" size="sm" className="text-xs" onClick={() => navigate('/app/plans')}>
                <Sparkles className="w-3 h-3 mr-1" />
                {isFree ? 'Upgrade para 50 perguntas/mês' : 'Upgrade para ilimitado'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}