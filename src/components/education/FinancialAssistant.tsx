
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FinancialAssistant() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim().length === 0) return;
    setMessages(msgs => [...msgs, { role: "user", content: input }]);
    setInput("");
    setLoading(true);

    // placeholder do assistente: resposta fixa/simples, pode ser trocada por integração IA futura
    setTimeout(() => {
      setMessages(msgs => [
        ...msgs,
        {
          role: "assistant",
          content: "Olá! Sou seu assistente financeiro. Em breve poderei responder suas dúvidas e te ajudar com metas e dicas personalizadas."
        }
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bot className="w-6 h-6 text-[#003f5c]" />
            <h2 className="text-xl font-bold text-[#003f5c]">Assistente Financeiro</h2>
          </div>
          <div className="flex flex-col gap-2 min-h-[240px] max-h-72 overflow-y-auto bg-gray-100 rounded-lg p-4 mb-4">
            {messages.length === 0 ? (
              <div className="text-[#003f5c]/60">Mande uma dúvida financeira, simule uma meta ou peça uma dica!</div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`text-sm rounded px-3 py-2 ${msg.role === "user" ? "bg-white self-end border font-semibold" : "bg-[#003f5c] text-white self-start"}`}>
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
            Em breve: integração com IA para respostas e sugestões inteligentes!
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
