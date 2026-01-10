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

// Tool definitions para a IA executar ações
const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "create_financial_goal",
      description: "Criar uma nova meta financeira para o usuário. Use quando o usuário pedir para criar ou definir uma meta de economia, compra ou objetivo financeiro.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nome descritivo da meta (ex: 'Viagem para Europa', 'Reserva de Emergência')" },
          target_amount: { type: "number", description: "Valor total da meta em reais (R$)" },
          target_date: { type: "string", description: "Data alvo no formato YYYY-MM-DD (opcional)" },
          initial_amount: { type: "number", description: "Valor inicial já guardado (opcional, default 0)" },
          priority: { type: "string", enum: ["baixa", "média", "alta"], description: "Prioridade da meta" }
        },
        required: ["name", "target_amount"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_transaction",
      description: "Registrar uma nova transação (gasto ou receita). Use quando o usuário informar um gasto ou recebimento.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["expense", "income"], description: "Tipo: expense para gasto, income para receita" },
          amount: { type: "number", description: "Valor em reais (R$)" },
          description: { type: "string", description: "Descrição da transação" },
          category: { type: "string", description: "Categoria (ex: Alimentação, Transporte, Lazer, Salário)" },
          date: { type: "string", description: "Data no formato YYYY-MM-DD (opcional, default hoje)" }
        },
        required: ["type", "amount", "category"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_challenge",
      description: "Criar um desafio financeiro para o usuário. Use quando ele quiser um desafio de economia ou mudança de hábito.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título do desafio (ex: '7 dias sem delivery')" },
          description: { type: "string", description: "Descrição detalhada do desafio" },
          target_amount: { type: "number", description: "Meta em reais para o desafio (opcional)" },
          duration_days: { type: "number", description: "Duração em dias" }
        },
        required: ["title", "description", "duration_days"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_budget",
      description: "Criar um orçamento mensal para uma categoria. Use quando o usuário quiser definir um limite de gasto.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "Categoria do orçamento (ex: Alimentação, Transporte)" },
          amount_limit: { type: "number", description: "Limite máximo de gasto em reais" }
        },
        required: ["category", "amount_limit"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_goal_deposit",
      description: "Adicionar um aporte/depósito em uma meta financeira existente. Use quando o usuário quiser contribuir para uma meta.",
      parameters: {
        type: "object",
        properties: {
          goal_name: { type: "string", description: "Nome ou parte do nome da meta" },
          amount: { type: "number", description: "Valor do aporte em reais" },
          note: { type: "string", description: "Observação sobre o aporte (opcional)" }
        },
        required: ["goal_name", "amount"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_financial_analysis",
      description: "Gerar uma análise detalhada da situação financeira. Use quando o usuário pedir uma análise, relatório ou diagnóstico.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["complete", "expenses", "savings", "goals"], description: "Tipo de análise" }
        },
        required: ["type"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "suggest_smart_tips",
      description: "Gerar dicas personalizadas baseadas nos dados financeiros. Use quando o usuário pedir dicas, conselhos ou sugestões.",
      parameters: {
        type: "object",
        properties: {
          focus: { type: "string", enum: ["economy", "investment", "goals", "general"], description: "Foco das dicas" }
        },
        required: ["focus"],
        additionalProperties: false
      }
    }
  }
];

// Executar tool calls
async function executeToolCall(
  supabaseClient: any, 
  userId: string, 
  workspaceId: string | null,
  toolName: string, 
  args: any
): Promise<string> {
  console.log(`Executing tool: ${toolName} with args:`, args);
  
  try {
    switch (toolName) {
      case "create_financial_goal": {
        const targetDate = args.target_date || null;
        const priority = args.priority === 'alta' ? 'high' : args.priority === 'baixa' ? 'low' : 'medium';
        
        const { data, error } = await supabaseClient
          .from('financial_goals')
          .insert([{
            user_id: userId,
            workspace_id: workspaceId,
            name: args.name,
            target_amount: args.target_amount,
            current_amount: args.initial_amount || 0,
            target_date: targetDate,
            priority: priority
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        return `✅ Meta "${args.name}" criada com sucesso! 
🎯 Valor: R$ ${args.target_amount.toFixed(2)}
${targetDate ? `📅 Prazo: ${new Date(targetDate).toLocaleDateString('pt-BR')}` : ''}
${args.initial_amount ? `💰 Valor inicial: R$ ${args.initial_amount.toFixed(2)}` : ''}

Você pode acompanhar o progresso na seção de Metas do app.`;
      }

      case "create_transaction": {
        const transactionDate = args.date || new Date().toISOString().split('T')[0];
        
        const { error } = await supabaseClient
          .from('transactions')
          .insert([{
            user_id: userId,
            workspace_id: workspaceId,
            type: args.type,
            amount: args.amount,
            description: args.description || args.category,
            category: args.category,
            date: transactionDate
          }]);
        
        if (error) throw error;
        
        const emoji = args.type === 'expense' ? '💸' : '💵';
        const typeText = args.type === 'expense' ? 'Gasto' : 'Receita';
        
        return `${emoji} ${typeText} registrado com sucesso!
📋 Categoria: ${args.category}
💰 Valor: R$ ${args.amount.toFixed(2)}
📅 Data: ${new Date(transactionDate).toLocaleDateString('pt-BR')}
${args.description ? `📝 Descrição: ${args.description}` : ''}`;
      }

      case "create_challenge": {
        const { error } = await supabaseClient
          .from('financial_challenges')
          .insert([{
            user_id: userId,
            creator_id: userId,
            workspace_id: workspaceId,
            title: args.title,
            description: args.description,
            target_amount: args.target_amount || null,
            duration_days: args.duration_days,
            status: 'active',
            started_at: new Date().toISOString(),
            is_automatic: false
          }]);
        
        if (error) throw error;
        
        return `🏆 Desafio criado com sucesso!
📌 "${args.title}"
📝 ${args.description}
⏱️ Duração: ${args.duration_days} dias
${args.target_amount ? `🎯 Meta: R$ ${args.target_amount.toFixed(2)}` : ''}

Boa sorte! Você pode acompanhar seu progresso na seção de Educação Financeira.`;
      }

      case "create_budget": {
        const now = new Date();
        
        // Verificar se já existe orçamento para esta categoria
        const { data: existing } = await supabaseClient
          .from('budgets')
          .select('id')
          .eq('workspace_id', workspaceId)
          .eq('category', args.category)
          .eq('year', now.getFullYear())
          .eq('month', now.getMonth() + 1)
          .maybeSingle();
        
        if (existing) {
          // Atualizar existente
          const { error } = await supabaseClient
            .from('budgets')
            .update({ amount_limit: args.amount_limit })
            .eq('id', existing.id);
          
          if (error) throw error;
          
          return `✅ Orçamento de ${args.category} atualizado para R$ ${args.amount_limit.toFixed(2)}`;
        }
        
        const { error } = await supabaseClient
          .from('budgets')
          .insert([{
            user_id: userId,
            workspace_id: workspaceId,
            category: args.category,
            amount_limit: args.amount_limit,
            year: now.getFullYear(),
            month: now.getMonth() + 1
          }]);
        
        if (error) throw error;
        
        return `📊 Orçamento criado com sucesso!
📋 Categoria: ${args.category}
💰 Limite: R$ ${args.amount_limit.toFixed(2)}/mês

Você será alertado quando estiver próximo do limite.`;
      }

      case "add_goal_deposit": {
        // Buscar meta pelo nome
        const { data: goals } = await supabaseClient
          .from('financial_goals')
          .select('*')
          .eq('workspace_id', workspaceId)
          .ilike('name', `%${args.goal_name}%`)
          .limit(1);
        
        if (!goals || goals.length === 0) {
          return `❌ Não encontrei uma meta com o nome "${args.goal_name}". Verifique o nome ou crie uma nova meta.`;
        }
        
        const goal = goals[0];
        const newAmount = Number(goal.current_amount || 0) + args.amount;
        
        // Atualizar meta
        await supabaseClient
          .from('financial_goals')
          .update({ current_amount: newAmount })
          .eq('id', goal.id);
        
        // Registrar depósito
        await supabaseClient
          .from('goal_deposits')
          .insert([{
            user_id: userId,
            goal_id: goal.id,
            amount: args.amount,
            note: args.note || 'Aporte via assistente IA'
          }]);
        
        const progress = (newAmount / Number(goal.target_amount)) * 100;
        const completed = progress >= 100;
        
        return `${completed ? '🎉' : '✅'} Aporte realizado com sucesso!
🎯 Meta: ${goal.name}
💰 Valor: R$ ${args.amount.toFixed(2)}
📈 Novo saldo: R$ ${newAmount.toFixed(2)} de R$ ${Number(goal.target_amount).toFixed(2)}
📊 Progresso: ${progress.toFixed(1)}%
${completed ? '\n🎊 Parabéns! Você atingiu sua meta!' : ''}`;
      }

      case "get_financial_analysis": {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { data: transactions } = await supabaseClient
          .from('transactions')
          .select('*')
          .eq('workspace_id', workspaceId)
          .gte('date', startOfMonth.toISOString().split('T')[0]);
        
        const { data: goals } = await supabaseClient
          .from('financial_goals')
          .select('*')
          .eq('workspace_id', workspaceId);
        
        let income = 0;
        let expenses = 0;
        const categories: Record<string, number> = {};
        
        (transactions || []).forEach((t: any) => {
          if (t.type === 'income') {
            income += Number(t.amount);
          } else {
            expenses += Number(t.amount);
            categories[t.category] = (categories[t.category] || 0) + Number(t.amount);
          }
        });
        
        const balance = income - expenses;
        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
        
        const topCategories = Object.entries(categories)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([cat, val]) => `• ${cat}: R$ ${val.toFixed(2)}`)
          .join('\n');
        
        const activeGoals = (goals || []).filter((g: any) => 
          Number(g.current_amount || 0) < Number(g.target_amount)
        );
        
        const goalsProgress = activeGoals.slice(0, 3).map((g: any) => {
          const progress = (Number(g.current_amount || 0) / Number(g.target_amount)) * 100;
          return `• ${g.name}: ${progress.toFixed(1)}%`;
        }).join('\n');

        return `📊 **ANÁLISE FINANCEIRA DO MÊS**

💰 **Receitas:** R$ ${income.toFixed(2)}
💸 **Despesas:** R$ ${expenses.toFixed(2)}
📈 **Saldo:** R$ ${balance.toFixed(2)}
💎 **Taxa de Poupança:** ${savingsRate.toFixed(1)}%

📋 **Top Categorias de Gasto:**
${topCategories || '• Nenhum gasto registrado'}

🎯 **Metas Ativas (${activeGoals.length}):**
${goalsProgress || '• Nenhuma meta ativa'}

${savingsRate < 10 ? '⚠️ Sua taxa de poupança está baixa. Tente economizar pelo menos 20% da renda.' : 
  savingsRate >= 20 ? '✅ Excelente! Você está poupando bem.' : 
  '💡 Você está no caminho certo, mas pode melhorar sua taxa de poupança.'}`;
      }

      case "suggest_smart_tips": {
        const { data: transactions } = await supabaseClient
          .from('transactions')
          .select('type, amount, category')
          .eq('workspace_id', workspaceId)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        
        const expenses = (transactions || []).filter((t: any) => t.type === 'expense');
        const income = (transactions || []).filter((t: any) => t.type === 'income');
        
        const totalExpenses = expenses.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        const totalIncome = income.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        
        const categories: Record<string, number> = {};
        expenses.forEach((t: any) => {
          categories[t.category] = (categories[t.category] || 0) + Number(t.amount);
        });
        
        const sortedCategories = Object.entries(categories).sort(([,a], [,b]) => b - a);
        const topCategory = sortedCategories[0];
        
        let tips: string[] = [];
        
        if (args.focus === 'economy' || args.focus === 'general') {
          if (topCategory && topCategory[1] > totalExpenses * 0.3) {
            tips.push(`💡 Seus gastos com ${topCategory[0]} representam ${((topCategory[1]/totalExpenses)*100).toFixed(0)}% do total. Tente reduzir 10% nesta categoria.`);
          }
          tips.push(`💡 Aplique a regra dos 3 dias: antes de comprar algo não essencial, espere 3 dias para decidir.`);
        }
        
        if (args.focus === 'investment' || args.focus === 'general') {
          const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
          if (savingsRate > 10) {
            tips.push(`💰 Você está poupando ${savingsRate.toFixed(0)}% da renda. Considere investir o excedente em Tesouro Direto ou CDB.`);
          }
          tips.push(`📈 Diversifique: não coloque todos os ovos na mesma cesta. Combine renda fixa e variável.`);
        }
        
        if (args.focus === 'goals' || args.focus === 'general') {
          tips.push(`🎯 Defina metas SMART: Específicas, Mensuráveis, Alcançáveis, Relevantes e com Prazo.`);
          tips.push(`💪 Automatize seus aportes: configure transferência automática no dia do salário.`);
        }
        
        return `🌟 **DICAS PERSONALIZADAS**\n\n${tips.join('\n\n')}`;
      }

      default:
        return `❌ Ação não reconhecida: ${toolName}`;
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    return `❌ Erro ao executar ação: ${error.message || 'Erro desconhecido'}`;
  }
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
      .limit(10);

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

    // Metas (com mais detalhes)
    const goalsStatus = (goals || []).map((g: any) => {
      const progress = g.target_amount > 0 ? ((g.current_amount / g.target_amount) * 100).toFixed(0) : 0;
      const remaining = Number(g.target_amount) - Number(g.current_amount || 0);
      return `${g.name}: ${progress}% (faltam R$ ${remaining.toFixed(2)})`;
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
    const workspaceId = body.workspace_id;

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

    // System prompt com contexto financeiro E INSTRUÇÕES DE TOOL CALLING
    const systemPrompt = `Você é a Plenne, uma assistente financeira inteligente que pode EXECUTAR AÇÕES no sistema do usuário.

CAPACIDADES:
- Você pode CRIAR metas financeiras, transações, desafios e orçamentos
- Você pode ADICIONAR aportes em metas existentes
- Você pode ANALISAR dados e SUGERIR dicas personalizadas
- Use as ferramentas disponíveis quando o usuário pedir para criar, registrar, definir ou fazer algo

DIRETRIZES:
- Sempre responda em português brasileiro
- Seja empática e encorajadora
- Quando o usuário pedir para CRIAR algo (meta, gasto, desafio), USE A FERRAMENTA APROPRIADA
- Quando o usuário informar um gasto ("gastei 50 no almoço"), REGISTRE como transação
- Quando pedirem dicas ou análise, use as ferramentas de análise
- Use os dados financeiros abaixo para personalizar suas respostas
- Considere SEMPRE as transações futuras/agendadas ao responder sobre renda ou projeções
- Confirme as ações executadas e mostre o resultado

${financialContext}

INSTRUÇÕES IMPORTANTES:
- Se o usuário pedir para criar uma meta, use create_financial_goal
- Se informar um gasto ou receita, use create_transaction  
- Se quiser um desafio, use create_challenge
- Se pedir um orçamento/limite, use create_budget
- Se quiser aportar em uma meta, use add_goal_deposit
- Se pedir análise/relatório, use get_financial_analysis
- Se pedir dicas/sugestões, use suggest_smart_tips
`;

    // Check for LOVABLE_API_KEY
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Primeira chamada - pode retornar tool calls
    const aiPayload = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
      ],
      tools: AI_TOOLS,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 2048,
    };

    console.log("Sending payload to Lovable AI Gateway for user:", user.id, "workspace:", workspaceId);

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

    const data = await response.json();
    const assistantMessage = data?.choices?.[0]?.message;

    // Verificar se há tool calls
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log("Tool calls detected:", assistantMessage.tool_calls.length);
      
      // Executar todas as tool calls
      const toolResults: string[] = [];
      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        const result = await executeToolCall(
          supabaseClient, 
          user.id, 
          workspaceId, 
          functionName, 
          functionArgs
        );
        toolResults.push(result);
      }

      // Fazer segunda chamada para gerar resposta final
      const followUpPayload = {
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          assistantMessage,
          ...assistantMessage.tool_calls.map((tc: any, idx: number) => ({
            role: "tool",
            tool_call_id: tc.id,
            content: toolResults[idx]
          }))
        ],
        temperature: 0.7,
        max_tokens: 1024,
      };

      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(followUpPayload),
      });

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        const finalAnswer = followUpData?.choices?.[0]?.message?.content || toolResults.join('\n\n');
        
        return new Response(JSON.stringify({ answer: finalAnswer }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Se falhar o follow-up, retornar os resultados das tools diretamente
      return new Response(JSON.stringify({ answer: toolResults.join('\n\n') }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Resposta normal (sem tool calls)
    // Se streaming foi solicitado, fazer nova requisição com stream
    if (stream) {
      const streamPayload = {
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
        stream: true,
      };

      const streamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(streamPayload),
      });

      if (streamResponse.ok) {
        return new Response(streamResponse.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }
    }

    const answer = assistantMessage?.content || 
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
