import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 5000;
const VALID_ROLES = ["user", "assistant"];

interface ChatMessage {
  role: string;
  content: string;
}

function validateMessages(messages: unknown): { valid: boolean; error?: string; data?: ChatMessage[] } {
  if (!messages || !Array.isArray(messages)) {
    return { valid: false, error: "Invalid messages format - must be an array" };
  }

  if (messages.length === 0) {
    return { valid: false, error: "Messages array cannot be empty" };
  }

  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Too many messages - maximum is ${MAX_MESSAGES}` };
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (!msg || typeof msg !== "object") {
      return { valid: false, error: `Invalid message at index ${i}` };
    }

    if (!msg.role || typeof msg.role !== "string") {
      return { valid: false, error: `Missing or invalid role at message ${i}` };
    }

    if (!VALID_ROLES.includes(msg.role)) {
      return { valid: false, error: `Invalid role "${msg.role}" at message ${i} - must be "user" or "assistant"` };
    }

    if (!msg.content || typeof msg.content !== "string") {
      return { valid: false, error: `Missing or invalid content at message ${i}` };
    }

    if (msg.content.length > MAX_CONTENT_LENGTH) {
      return { valid: false, error: `Content too long at message ${i} - maximum is ${MAX_CONTENT_LENGTH} characters` };
    }
  }

  return { valid: true, data: messages as ChatMessage[] };
}

async function getFinancialContext(supabaseClient: any, userId: string, workspaceId?: string) {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    const futureDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString().split('T')[0];

    // Buscar transações do mês atual - com filtro de workspace se disponível
    let transactionsQuery = supabaseClient
      .from('transactions')
      .select('type, amount, category, date')
      .eq('user_id', userId)
      .gte('date', startOfMonth)
      .lte('date', todayStr)
      .order('date', { ascending: false })
      .limit(100);
    
    if (workspaceId) {
      transactionsQuery = transactionsQuery.eq('workspace_id', workspaceId);
    }

    const { data: transactions } = await transactionsQuery;

    // Calcular totais
    let totalIncome = 0;
    let totalExpense = 0;
    const categorySummary: Record<string, number> = {};

    (transactions || []).forEach((t: any) => {
      if (t.type === 'income') {
        totalIncome += Number(t.amount);
      } else {
        totalExpense += Number(t.amount);
        categorySummary[t.category] = (categorySummary[t.category] || 0) + Number(t.amount);
      }
    });

    // Buscar transações FUTURAS/AGENDADAS (incoming_transactions) - SALÁRIO, RENDA, etc.
    let incomingQuery = supabaseClient
      .from('incoming_transactions')
      .select('type, amount, category, description, expected_date, status')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gte('expected_date', todayStr)
      .lte('expected_date', futureDate)
      .order('expected_date', { ascending: true })
      .limit(20);

    if (workspaceId) {
      incomingQuery = incomingQuery.eq('workspace_id', workspaceId);
    }

    const { data: incomingTransactions } = await incomingQuery;

    // Calcular totais futuros
    let futureIncome = 0;
    let futureExpense = 0;
    const futureTransactionsList: string[] = [];

    (incomingTransactions || []).forEach((t: any) => {
      const amount = Number(t.amount);
      const desc = t.description || t.category;
      const dateFormatted = new Date(t.expected_date).toLocaleDateString('pt-BR');
      
      if (t.type === 'income') {
        futureIncome += amount;
        futureTransactionsList.push(`+R$ ${amount.toFixed(2)} - ${desc} (${dateFormatted})`);
      } else {
        futureExpense += amount;
        futureTransactionsList.push(`-R$ ${amount.toFixed(2)} - ${desc} (${dateFormatted})`);
      }
    });

    // Buscar orçamentos do mês
    let budgetsQuery = supabaseClient
      .from('budgets')
      .select('category, amount_limit')
      .eq('user_id', userId)
      .eq('year', today.getFullYear())
      .eq('month', today.getMonth() + 1);

    if (workspaceId) {
      budgetsQuery = budgetsQuery.eq('workspace_id', workspaceId);
    }

    const { data: budgets } = await budgetsQuery;

    // Buscar metas financeiras
    let goalsQuery = supabaseClient
      .from('financial_goals')
      .select('name, target_amount, current_amount, target_date')
      .eq('user_id', userId)
      .limit(5);

    if (workspaceId) {
      goalsQuery = goalsQuery.eq('workspace_id', workspaceId);
    }

    const { data: goals } = await goalsQuery;

    // Buscar investimentos
    let investmentsQuery = supabaseClient
      .from('investments')
      .select('name, type, amount, expected_return')
      .eq('user_id', userId)
      .limit(10);

    if (workspaceId) {
      investmentsQuery = investmentsQuery.eq('workspace_id', workspaceId);
    }

    const { data: investments } = await investmentsQuery;

    // Buscar desafios ativos
    const { data: challenges } = await supabaseClient
      .from('financial_challenges')
      .select('title, description, target_amount, duration_days, status, started_at, is_automatic')
      .or(`user_id.eq.${userId},creator_id.eq.${userId}`)
      .eq('status', 'active')
      .limit(5);

    // Buscar progresso nos cursos
    const { data: courseProgress } = await supabaseClient
      .from('user_lesson_progress')
      .select('completed')
      .eq('user_id', userId);

    const completedLessons = (courseProgress || []).filter((p: any) => p.completed).length;

    // Montar contexto
    const balance = totalIncome - totalExpense;
    const projectedBalance = balance + futureIncome - futureExpense;
    
    // Top 5 categorias de gasto
    const topCategories = Object.entries(categorySummary)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, val]) => `${cat}: R$ ${val.toFixed(2)}`)
      .join(', ');

    // Orçamentos com status
    const budgetStatus = (budgets || []).map((b: any) => {
      const spent = categorySummary[b.category] || 0;
      const percentage = b.amount_limit > 0 ? ((spent / b.amount_limit) * 100).toFixed(0) : 0;
      return `${b.category}: ${percentage}% usado (R$ ${spent.toFixed(2)} de R$ ${b.amount_limit.toFixed(2)})`;
    }).join('; ');

    // Metas
    const goalsStatus = (goals || []).map((g: any) => {
      const progress = g.target_amount > 0 ? ((g.current_amount / g.target_amount) * 100).toFixed(0) : 0;
      return `${g.name}: ${progress}% concluído`;
    }).join('; ');

    // Total investido
    const totalInvested = (investments || []).reduce((sum: number, i: any) => sum + Number(i.amount), 0);

    // Desafios ativos
    const challengesStatus = (challenges || []).map((c: any) => {
      const daysInfo = c.started_at ? `, iniciado em ${new Date(c.started_at).toLocaleDateString('pt-BR')}` : '';
      const targetInfo = c.target_amount ? ` (meta: R$ ${Number(c.target_amount).toFixed(2)})` : '';
      return `${c.title}${targetInfo} - ${c.duration_days} dias${daysInfo}${c.is_automatic ? ' [sugerido pela IA]' : ''}`;
    }).join('; ');

    // Transações futuras/agendadas
    const futureTransactionsText = futureTransactionsList.length > 0 
      ? futureTransactionsList.slice(0, 5).join('\n  ') 
      : 'Nenhuma transação futura agendada';

    return `
CONTEXTO FINANCEIRO DO USUÁRIO (Mês atual: ${today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}):

📊 RESUMO DO MÊS ATUAL:
- Receitas realizadas: R$ ${totalIncome.toFixed(2)}
- Despesas realizadas: R$ ${totalExpense.toFixed(2)}
- Saldo atual do mês: R$ ${balance.toFixed(2)}
- Principais gastos: ${topCategories || 'Nenhum gasto registrado'}

📅 TRANSAÇÕES FUTURAS/AGENDADAS (próximo mês):
- Receitas esperadas: R$ ${futureIncome.toFixed(2)} ${futureIncome > 0 ? '(inclui salário/renda)' : ''}
- Despesas esperadas: R$ ${futureExpense.toFixed(2)}
- Saldo projetado: R$ ${projectedBalance.toFixed(2)}
- Próximas transações:
  ${futureTransactionsText}

${budgetStatus ? `💰 ORÇAMENTOS: ${budgetStatus}` : ''}
${goalsStatus ? `🎯 METAS: ${goalsStatus}` : ''}
${totalInvested > 0 ? `📈 TOTAL INVESTIDO: R$ ${totalInvested.toFixed(2)}` : ''}
${challengesStatus ? `🏆 DESAFIOS ATIVOS: ${challengesStatus}` : ''}
${completedLessons > 0 ? `📚 AULAS COMPLETADAS: ${completedLessons}` : ''}

INSTRUÇÕES:
- Use estas informações para dar conselhos personalizados e relevantes.
- Considere as transações futuras (salário, renda esperada) ao fazer projeções.
- Incentive o usuário a continuar seus desafios ativos e parabenize progressos.
- Se o usuário perguntar sobre salário ou renda, consulte as transações futuras/agendadas.
- Se o usuário não tem desafios ativos, sugira que ele aceite um desafio baseado nos padrões de gastos.
`;
  } catch (error) {
    console.error("Error fetching financial context:", error);
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("Authentication failed:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - please log in" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Authenticated user:", user.id);

    const body = await req.json();
    const validation = validateMessages(body.messages);
    const stream = body.stream === true;
    const workspaceId = body.workspace_id; // Receber workspace_id do frontend

    if (!validation.valid) {
      console.error("Input validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const messages = validation.data!;

    // Buscar contexto financeiro do usuário com workspace
    const financialContext = await getFinancialContext(supabaseClient, user.id, workspaceId);

    // System prompt com contexto financeiro
    const systemPrompt = `Você é a Plenne, uma assistente financeira inteligente, amigável e especializada em finanças pessoais brasileiras. 
Você ajuda os usuários a gerenciar suas finanças, economizar dinheiro, entender investimentos e alcançar metas financeiras.

Diretrizes:
- Sempre responda em português brasileiro
- Seja empática e encorajadora
- Dê conselhos práticos e acionáveis
- Use os dados financeiros do usuário para personalizar suas respostas
- Quando apropriado, sugira ações específicas como criar orçamentos, ajustar gastos ou poupar mais
- Evite jargões técnicos complexos, explique de forma simples
- Se não souber algo específico sobre a situação do usuário, pergunte
- Considere SEMPRE as transações futuras/agendadas ao responder sobre renda, salário ou projeções

${financialContext}
`;

    // Check for LOVABLE_API_KEY
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Construir payload para Lovable AI Gateway (OpenAI compatible)
    const aiPayload = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
      ],
      temperature: 0.7,
      max_tokens: 1024,
      stream: stream,
    };

    console.log("Sending payload to Lovable AI Gateway for user:", user.id, "workspace:", workspaceId, "streaming:", stream);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(aiPayload),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Entre em contato com o suporte." }),
          { status: 402, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua pergunta. Tente novamente." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Se streaming, retornar o stream diretamente
    if (stream) {
      console.log("Returning streaming response for user:", user.id);
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Resposta normal (não streaming)
    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content || 
      "Desculpe, não consegui gerar uma resposta agora. Tente novamente.";

    console.log("Successfully generated response for user:", user.id);

    return new Response(JSON.stringify({ answer }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Financial Assistant Edge Exception:", error?.message, error);
    return new Response(JSON.stringify({ error: error?.message || String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});