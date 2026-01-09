
import { supabase } from "@/integrations/supabase/client";
import { Budget } from "@/types/budget";
import { safeLog } from "@/lib/security";

export async function fetchBudgetsFromDB(
  workspaceId: string,
  year: number,
  month: number
): Promise<Budget[]> {
  safeLog("info", "budgetApi - Fetching budgets", { workspaceId, year, month });

  const { data: budgetData, error: budgetError } = await supabase
    .from("budgets")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("year", year)
    .eq("month", month)
    .order("category");

  if (budgetError) {
    safeLog("error", "budgetApi - Budget error", { error: budgetError.message });
    throw budgetError;
  }

  safeLog("info", "budgetApi - Found budgets", { count: budgetData?.length || 0 });
  return budgetData || [];
}

export async function fetchTransactionsForPeriod(
  workspaceId: string,
  year: number,
  month: number
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  safeLog("info", "budgetApi - Fetching transactions", { 
    startDate: startDate.toISOString().split('T')[0], 
    endDate: endDate.toISOString().split('T')[0] 
  });

  const { data: transactionData, error: transactionError } = await supabase
    .from("transactions")
    .select("category, amount")
    .eq("workspace_id", workspaceId)
    .eq("type", "expense")
    .gte("date", startDate.toISOString().split('T')[0])
    .lte("date", endDate.toISOString().split('T')[0]);

  if (transactionError) {
    safeLog("error", "budgetApi - Transaction error", { error: transactionError.message });
    throw transactionError;
  }

  safeLog("info", "budgetApi - Found transactions", { count: transactionData?.length || 0 });
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
