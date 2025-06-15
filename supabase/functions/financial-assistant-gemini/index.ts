
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { messages } = await req.json();

    const geminiPayload = {
      contents: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.6,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
        stopSequences: [],
      },
    };

    // LOG o payload que será enviado
    console.log("Sending payload to Gemini:", JSON.stringify(geminiPayload));

    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
      }
    );
    const data = await r.json();

    // LOG o corpo completo da resposta da Gemini
    console.log("Gemini Response:", JSON.stringify(data));

    // Check for Gemini API error
    if (data.error) {
      // Mostra qualquer erro recebido da API Gemini no log
      console.error("Gemini IA error:", JSON.stringify(data.error));
      return new Response(JSON.stringify({ error: data.error.message || data.error }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Desculpe, não consegui gerar uma resposta agora.";

    return new Response(JSON.stringify({ answer }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    // log do erro JS/detalhes de execução
    console.error("Financial Assistant Edge Exception:", error?.message, error);
    return new Response(JSON.stringify({ error: error?.message || String(error) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
