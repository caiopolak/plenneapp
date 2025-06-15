
export async function callFinancialAssistant(messages: { role: "user" | "assistant"; content: string }[]) {
  const res = await fetch(
    "https://kmejplnwnajjaxsqzmwz.supabase.co/functions/v1/financial-assistant-gemini",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    }
  );
  if (!res.ok) throw new Error("Erro ao falar com o assistente financeiro IA.");
  const data = await res.json();
  return data.answer as string;
}
