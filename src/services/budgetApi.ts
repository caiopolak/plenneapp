
import { supabase } from "@/integrations/supabase/client";
import { Budget } from "@/types/budget";

export async function fetchBudgetsFromDB(
  workspaceId: string,
  year: number,
  month: number
): Promise<Budget[]> {
  console.log("budgetApi - Fetching budgets for:", { 
    workspace: workspaceId, 
    year, 
    month 
  });

  const { data: budgetData, error: budgetError } = await supabase
    .from("budgets")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("year", year)
    .eq("month", month)
    .order("category");

  if (budgetError) {
    console.error("budgetApi - Budget error:", budgetError);
    throw budgetError;
  }

  console.log("budgetApi - Found budgets:", budgetData?.length || 0);
  return budgetData || [];
}

export async function fetchTransactionsForPeriod(
  workspaceId: string,
  year: number,
  month: number
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  console.log("budgetApi - Fetching transactions from", startDate.toISOString().split('T')[0], "to", endDate.toISOString().split('T')[0]);

  const { data: transactionData, error: transactionError } = await supabase
    .from("transactions")
    .select("category, amount")
    .eq("workspace_id", workspaceId)
    .eq("type", "expense")
    .gte("date", startDate.toISOString().split('T')[0])
    .lte("date", endDate.toISOString().split('T')[0]);

  if (transactionError) {
    console.error("budgetApi - Transaction error:", transactionError);
    throw transactionError;
  }

  console.log("budgetApi - Found transactions:", transactionData?.length || 0);
  return transactionData || [];
}

export async function createBudgetInDB(
  userId: string,
  workspaceId: string,
  category: string,
  amount: number,
  year: number,
  month: number
): Promise<boolean> {
  const { error } = await supabase
    .from("budgets")
    .insert({
      user_id: userId,
      workspace_id: workspaceId,
      category,
      amount_limit: amount,
      year,
      month
    });

  if (error) throw error;
  return true;
}

export async function updateBudgetInDB(budgetId: string, amount: number): Promise<boolean> {
  const { error } = await supabase
    .from("budgets")
    .update({ 
      amount_limit: amount,
      updated_at: new Date().toISOString()
    })
    .eq("id", budgetId);

  if (error) throw error;
  return true;
}

export async function deleteBudgetFromDB(budgetId: string): Promise<boolean> {
  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", budgetId);

  if (error) throw error;
  return true;
}
