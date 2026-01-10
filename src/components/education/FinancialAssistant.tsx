import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Crown, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { callFinancialAssistant } from "@/utils/callFinancialAssistant";
import { useToast } from "@/hooks/use-toast";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useNavigate } from "react-router-dom";

type ChatMessage = { role: "user" | "assistant"; content: string };

// Limites de perguntas por plano
const QUESTION_LIMITS = {
  free: 5,
  pro: 50,
  business: -1 // Ilimitado
};

export function FinancialAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const { toast } = useToast();
  const { currentPlan, isFree, isPro, isBusiness } = usePlanAccess();
  const navigate = useNavigate();

  // Simulação de contador de perguntas (em produção viria do banco)
  const questionLimit = QUESTION_LIMITS[currentPlan] || 5;
  const questionsRemaining = questionLimit === -1 ? Infinity : questionLimit - questionsUsed;
  const isLimitReached = questionLimit !== -1 && questionsUsed >= questionLimit;

  const handleSend = async () => {
    if (input.trim().length === 0) return;
    
    // Verificar limite
    if (isLimitReached) {
      toast({
        variant: "destructive",
        title: "Limite de perguntas atingido",
        description: `Você usou todas as ${questionLimit} perguntas deste mês. Faça upgrade para continuar!`
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
        nextMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
        }))
      );
      setMessages(msgs => [
        ...msgs,
        { role: "assistant", content: answer }
      ]);
      setQuestionsUsed(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: "Erro ao consultar a IA",
        description: error?.message || "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
      setMessages(msgs => [
        ...msgs,
        { role: "assistant", content: "Ocorreu um erro ao buscar a resposta da IA. Tente novamente." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadge = () => {
    if (isBusiness) {
      return (
        <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400">
          <Sparkles className="w-3 h-3 mr-1" />
          Ilimitado
        </Badge>
      );
    }
    if (isPro) {
      return (
        <Badge variant="outline" className="border-primary/40 text-primary">
          <Crown className="w-3 h-3 mr-1" />
          {questionsRemaining} restantes
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-muted-foreground/40">
        {questionsRemaining}/{questionLimit} restantes
      </Badge>
    );
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
            {getPlanBadge()}
          </div>

          {/* Aviso de limite para usuários free */}
          {isFree && !isLimitReached && (
            <div className="mb-4 p-3 bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
                <Crown className="w-4 h-4" />
                <span className="font-medium">Plano Gratuito</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Você tem {questionsRemaining} perguntas restantes este mês. 
                Faça upgrade para perguntas ilimitadas!
              </p>
            </div>
          )}

          {/* Bloqueio quando limite atingido */}
          {isLimitReached && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-center">
              <Lock className="w-8 h-8 text-destructive mx-auto mb-2" />
              <h3 className="font-semibold text-destructive mb-1">Limite Atingido</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Você usou todas as {questionLimit} perguntas deste mês.
              </p>
              <Button 
                onClick={() => navigate('/app/subscription')}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                <Crown className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-2 min-h-[240px] max-h-72 overflow-y-auto bg-muted rounded-lg p-4 mb-4">
            {messages.length === 0 ? (
              <div className="text-muted-foreground">
                Você pode pedir dicas financeiras, pedir para analisar seus gastos, pedir desafios ou perguntas sobre saúde financeira!<br />
                Exemplo: <span className="italic">"Qual desafio financeiro posso cumprir este mês?"</span>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`text-sm rounded px-3 py-2 ${msg.role === "user" ? "bg-card self-end border border-border font-semibold text-foreground" : "bg-primary text-primary-foreground self-start whitespace-pre-line"}`}>
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
            <Button onClick={handleSend} disabled={loading || !input || isLimitReached}>
              Enviar
            </Button>
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>Powered by Gemini IA</span>
            {!isBusiness && (
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-xs"
                onClick={() => navigate('/app/subscription')}
              >
                <Crown className="w-3 h-3 mr-1" />
                {isFree ? 'Upgrade para 50 perguntas/mês' : 'Upgrade para ilimitado'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

