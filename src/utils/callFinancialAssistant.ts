import { supabase } from "@/integrations/supabase/client";

export async function callFinancialAssistant(messages: { role: "user" | "assistant"; content: string }[]) {
  // Get current session for auth header
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error("Você precisa estar logado para usar o assistente financeiro.");
  }

  const res = await fetch(
    "https://kmejplnwnajjaxsqzmwz.supabase.co/functions/v1/financial-assistant-gemini",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ messages }),
    }
  );
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao falar com o assistente financeiro IA.");
  }
  
  const data = await res.json();
  return data.answer as string;
}
