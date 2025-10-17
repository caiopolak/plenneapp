
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { callFinancialAssistant } from "@/utils/callFinancialAssistant";
import { useToast } from "@/hooks/use-toast";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function FinancialAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (input.trim().length === 0) return;
    const userMessage: ChatMessage = { role: "user", content: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      // Ensure we send the correctly-typed messages to the API
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

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bot className="w-6 h-6 text-[#003f5c]" />
            <h2 className="text-xl font-bold text-[#003f5c]">Assistente Financeiro (IA Gemini)</h2>
          </div>
          <div className="flex flex-col gap-2 min-h-[240px] max-h-72 overflow-y-auto bg-gray-100 rounded-lg p-4 mb-4">
            {messages.length === 0 ? (
              <div className="text-[#003f5c]/60">
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
            {loading && <div className="text-xs text-[#003f5c]/80">Pensando...</div>}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Pergunte algo…"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              onKeyDown={e => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} disabled={loading || !input}>Enviar</Button>
          </div>
          <span className="block text-xs text-[#003f5c]/60 mt-3">
            Agora com respostas reais e sugestões automáticas, powered by Gemini IA!
          </span>
        </CardContent>
      </Card>
    </div>
  );
}

