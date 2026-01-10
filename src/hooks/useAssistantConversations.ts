import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export function useAssistantConversations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar conversas do usuário
  const fetchConversations = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("assistant_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar conversas:", error);
      return;
    }

    setConversations(data || []);
  };

  // Carregar mensagens de uma conversa
  const fetchMessages = async (conversationId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("assistant_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao carregar mensagens:", error);
      setLoading(false);
      return;
    }

    setMessages((data || []) as Message[]);
    setLoading(false);
  };

  // Criar nova conversa
  const createConversation = async (title?: string): Promise<Conversation | null> => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from("assistant_conversations")
      .insert({
        user_id: user.id,
        title: title || "Nova conversa",
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar conversa:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar conversa",
        description: error.message,
      });
      return null;
    }

    setConversations((prev) => [data, ...prev]);
    setCurrentConversation(data);
    setMessages([]);
    return data;
  };

  // Adicionar mensagem
  const addMessage = async (
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<Message | null> => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from("assistant_messages")
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar mensagem:", error);
      return null;
    }

    const newMessage = data as Message;
    setMessages((prev) => [...prev, newMessage]);

    // Atualizar updated_at da conversa
    await supabase
      .from("assistant_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    // Atualizar título se for a primeira mensagem do usuário
    if (role === "user" && messages.length === 0) {
      const shortTitle = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      await updateConversationTitle(conversationId, shortTitle);
    }

    return newMessage;
  };

  // Atualizar título da conversa
  const updateConversationTitle = async (conversationId: string, title: string) => {
    const { error } = await supabase
      .from("assistant_conversations")
      .update({ title })
      .eq("id", conversationId);

    if (!error) {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, title } : c))
      );
      if (currentConversation?.id === conversationId) {
        setCurrentConversation((prev) => (prev ? { ...prev, title } : null));
      }
    }
  };

  // Deletar conversa
  const deleteConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from("assistant_conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar conversa",
        description: error.message,
      });
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
      setMessages([]);
    }

    toast({
      title: "Conversa deletada",
      description: "O histórico foi removido com sucesso.",
    });
  };

  // Selecionar conversa
  const selectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    await fetchMessages(conversation.id);
  };

  // Nova conversa (limpar estado)
  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  useEffect(() => {
    fetchConversations();
  }, [user?.id]);

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    setMessages,
    fetchConversations,
    createConversation,
    addMessage,
    updateConversationTitle,
    deleteConversation,
    selectConversation,
    startNewConversation,
  };
}
