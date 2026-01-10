import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Crown, Lock, Sparkles, Send, History, Plus, Trash2, Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useAssistantUsage } from "@/hooks/useAssistantUsage";
import { useAssistantConversations, type Message } from "@/hooks/useAssistantConversations";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AssistantUsageCounter } from "@/components/subscription/AssistantUsageCounter";
import { supabase } from "@/integrations/supabase/client";
import { exportConversationToPDF, exportConversationToCSV, exportAllConversationsToCSV } from "@/utils/assistantExport";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function FinancialAssistant() {
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isFree, isBusiness } = usePlanAccess();
  const { usage, incrementUsage } = useAssistantUsage();
  const { session } = useAuth();
  const navigate = useNavigate();
  
  const {
    conversations,
    currentConversation,
    messages: dbMessages,
    loading: loadingConversation,
    createConversation,
    addMessage,
    deleteConversation,
    selectConversation,
    startNewConversation,
    fetchConversations,
  } = useAssistantConversations();

  const isLimitReached = !usage.canAsk;

  // Sincronizar mensagens do banco com estado local
  useEffect(() => {
    if (currentConversation && dbMessages.length > 0) {
      setLocalMessages(dbMessages.map(m => ({ role: m.role, content: m.content })));
    }
  }, [dbMessages, currentConversation]);

  // Scroll automático para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, streamingContent]);

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
    const nextMessages = [...localMessages, userMessage];
    setLocalMessages(nextMessages);
    setInput("");
    setLoading(true);
    setStreamingContent("");

    try {
      // Criar conversa se não existir
      let conversationId = currentConversation?.id;
      if (!conversationId) {
        const newConv = await createConversation(input.slice(0, 50));
        if (!newConv) throw new Error("Erro ao criar conversa");
        conversationId = newConv.id;
      }

      // Salvar mensagem do usuário no banco
      await addMessage(conversationId, "user", input);

      // Fazer requisição com streaming
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-assistant-gemini`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            messages: nextMessages.map(msg => ({ role: msg.role, content: msg.content })),
            stream: true,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao processar pergunta");
      }

      if (!response.body) {
        throw new Error("Resposta sem corpo");
      }

      // Processar stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Processar linha por linha
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              setStreamingContent(fullContent);
            }
          } catch {
            // JSON incompleto, ignorar
          }
        }
      }

      // Finalizar
      const finalContent = fullContent || "Desculpe, não consegui gerar uma resposta.";
      setLocalMessages(msgs => [...msgs, { role: "assistant", content: finalContent }]);
      setStreamingContent("");

      // Salvar resposta no banco
      await addMessage(conversationId, "assistant", finalContent);
      await incrementUsage();

    } catch (error: any) {
      console.error("Erro no assistente:", error);
      toast({
        title: "Erro ao consultar a IA",
        description: error?.message || "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
      setLocalMessages(msgs => [...msgs, { role: "assistant", content: "Ocorreu um erro. Tente novamente." }]);
    } finally {
      setLoading(false);
      setStreamingContent("");
    }
  };

  const handleNewConversation = () => {
    startNewConversation();
    setLocalMessages([]);
  };

  const handleSelectConversation = async (conv: typeof conversations[0]) => {
    await selectConversation(conv);
    setActiveTab("chat");
  };

  const handleExportPDF = async () => {
    if (!currentConversation || localMessages.length === 0) {
      toast({ variant: "destructive", title: "Nenhuma conversa para exportar" });
      return;
    }

    try {
      await exportConversationToPDF({
        title: currentConversation.title,
        created_at: currentConversation.created_at,
        messages: localMessages.map((m, i) => ({
          ...m,
          created_at: dbMessages[i]?.created_at || new Date().toISOString(),
        })),
      });
      toast({ title: "PDF exportado com sucesso!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao exportar PDF" });
    }
  };

  const handleExportCSV = () => {
    if (!currentConversation || localMessages.length === 0) {
      toast({ variant: "destructive", title: "Nenhuma conversa para exportar" });
      return;
    }

    try {
      exportConversationToCSV({
        title: currentConversation.title,
        created_at: currentConversation.created_at,
        messages: localMessages.map((m, i) => ({
          ...m,
          created_at: dbMessages[i]?.created_at || new Date().toISOString(),
        })),
      });
      toast({ title: "CSV exportado com sucesso!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao exportar CSV" });
    }
  };

  const handleExportAllCSV = async () => {
    if (conversations.length === 0) {
      toast({ variant: "destructive", title: "Nenhuma conversa para exportar" });
      return;
    }

    try {
      // Buscar todas as mensagens de todas as conversas
      const allConversationsData = await Promise.all(
        conversations.map(async (conv) => {
          const { data } = await supabase
            .from("assistant_messages")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: true });

          return {
            title: conv.title,
            created_at: conv.created_at,
            messages: (data || []).map((m: any) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
              created_at: m.created_at,
            })),
          };
        })
      );

      exportAllConversationsToCSV(allConversationsData);
      toast({ title: "Histórico completo exportado!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao exportar histórico" });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">Assistente Financeiro IA</h2>
              </div>
              <div className="flex items-center gap-2">
                <AssistantUsageCounter variant="compact" />
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="chat" className="gap-1">
                    <Bot className="w-4 h-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-1">
                    <History className="w-4 h-4" />
                    Histórico
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="chat" className="m-0">
              <div className="p-4 space-y-4">
                {/* Alertas de plano */}
                {isFree && !isLimitReached && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm">
                      <Crown className="w-4 h-4" />
                      <span className="font-medium">Plano Gratuito - {usage.remaining} perguntas restantes</span>
                    </div>
                  </div>
                )}

                {isLimitReached && (
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-center">
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

                {/* Header da conversa */}
                {currentConversation && (
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {currentConversation.title}
                    </Badge>
                    <div className="flex gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Exportar
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={handleExportPDF}>
                            <FileText className="w-4 h-4 mr-2" />
                            Exportar PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleExportCSV}>
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Exportar CSV
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="ghost" size="sm" onClick={handleNewConversation}>
                        <Plus className="w-4 h-4 mr-1" />
                        Nova
                      </Button>
                    </div>
                  </div>
                )}

                {/* Área de mensagens */}
                <ScrollArea className="h-[360px] rounded-lg border bg-background p-4">
                  <div className="flex flex-col gap-3">
                    {localMessages.length === 0 && !streamingContent ? (
                      <div className="text-muted-foreground text-center py-8">
                        <Bot className="w-12 h-12 mx-auto mb-3 text-primary/50" />
                        <p className="font-medium">Olá! Sou a Plenne, sua assistente financeira.</p>
                        <p className="text-sm mt-1">
                          Pergunte sobre suas finanças, peça dicas ou desafios!
                        </p>
                        <p className="text-xs mt-2 italic text-muted-foreground/70">
                          Exemplo: "Qual desafio financeiro posso cumprir este mês?"
                        </p>
                      </div>
                    ) : (
                      <>
                        {localMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                msg.role === "user"
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted border border-border text-foreground rounded-bl-md"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {msg.content}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Streaming content */}
                        {streamingContent && (
                          <div className="flex justify-start">
                            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-muted border border-border text-foreground rounded-bl-md">
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {streamingContent}
                                <span className="inline-block w-2 h-4 ml-1 bg-primary/50 animate-pulse" />
                              </p>
                            </div>
                          </div>
                        )}

                        {loading && !streamingContent && (
                          <div className="flex justify-start">
                            <div className="bg-muted border border-border rounded-2xl rounded-bl-md px-4 py-3">
                              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Pensando...
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Pergunte algo…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={loading || isLimitReached}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={loading || !input || isLimitReached}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {!isBusiness && (
                  <div className="text-center">
                    <Button variant="link" size="sm" className="text-xs" onClick={() => navigate('/app/plans')}>
                      <Sparkles className="w-3 h-3 mr-1" />
                      {isFree ? 'Upgrade para 50 perguntas/mês' : 'Upgrade para ilimitado'}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="m-0">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Suas Conversas</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportAllCSV}>
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      Exportar Tudo
                    </Button>
                    <Button size="sm" onClick={handleNewConversation}>
                      <Plus className="w-4 h-4 mr-1" />
                      Nova Conversa
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[400px]">
                  {conversations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma conversa ainda.</p>
                      <p className="text-sm mt-1">Comece uma conversa com a Plenne!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {conversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                            currentConversation?.id === conv.id ? "bg-muted border-primary/50" : ""
                          }`}
                          onClick={() => handleSelectConversation(conv)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{conv.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(conv.updated_at).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
