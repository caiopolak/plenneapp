
import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BudgetWithSpent } from "@/types/budget";
import { calculateBudgetWithSpent, calculateSpentByCategory } from "@/utils/budgetCalculations";
import { generateBudgetAlert } from "@/services/budgetAlerts";
import { 
  fetchBudgetsFromDB, 
  fetchTransactionsForPeriod,
  createBudgetInDB,
  updateBudgetInDB,
  deleteBudgetFromDB
} from "@/services/budgetApi";
import { safeLog } from "@/lib/security";

export function useBudgets() {
  const { current } = useWorkspace();
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [loading, setLoading] = useState(true);

  // Use primitive values for dependencies
  const userId = user?.id;
  const workspaceId = current?.id;

  safeLog("info", "useBudgets - init", { workspaceId, userId });

  const fetchBudgets = async (year?: number, month?: number) => {
    if (!workspaceId || !userId) {
      safeLog("info", "useBudgets - No workspace or user, clearing budgets");
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const currentDate = new Date();
      const targetYear = year ?? currentDate.getFullYear();
      const targetMonth = month ?? currentDate.getMonth() + 1;

      // Fetch budgets and transactions
      const budgetData = await fetchBudgetsFromDB(current.id, targetYear, targetMonth);
      const transactionData = await fetchTransactionsForPeriod(current.id, targetYear, targetMonth);

      // Calculate spent by category
      const spentByCategory = calculateSpentByCategory(transactionData);
      safeLog("info", "useBudgets - Spent by category", { categories: Object.keys(spentByCategory).length });

      // Combine budgets with spent amounts and generate alerts
      const budgetsWithSpent: BudgetWithSpent[] = budgetData.map(budget => {
        const budgetWithSpent = calculateBudgetWithSpent(budget, spentByCategory);
        
        // Generate alerts based on percentage
        if (budgetWithSpent.percentage >= 90 && budgetWithSpent.percentage < 100) {
          generateBudgetAlert(user.id, budget.category, budgetWithSpent.percentage, "warning");
        } else if (budgetWithSpent.percentage >= 100) {
          generateBudgetAlert(user.id, budget.category, budgetWithSpent.percentage, "critical");
        }

        return budgetWithSpent;
      });

      setBudgets(budgetsWithSpent);
    } catch (error) {
      safeLog("error", "useBudgets - Error fetching budgets", { error: String(error) });
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os orçamentos."
      });
    } finally {
      setLoading(false);
    }
  };

  const createBudget = async (category: string, amount: number, year: number, month: number) => {
    if (!workspaceId || !userId) {
      safeLog("info", "useBudgets - Cannot create budget: no workspace or user");
      return false;
    }

    try {
      await createBudgetInDB(userId, workspaceId, category, amount, year, month);

      toast({
        title: "Orçamento criado!",
        description: `Orçamento para ${category} foi criado com sucesso.`
      });

      await fetchBudgets(year, month);
      return true;
    } catch (error) {
      safeLog("error", "useBudgets - Error creating budget", { error: String(error) });
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o orçamento."
      });
      return false;
    }
  };

  const updateBudget = async (budgetId: string, amount: number) => {
    try {
      await updateBudgetInDB(budgetId, amount);

      toast({
        title: "Orçamento atualizado!",
        description: "O valor do orçamento foi atualizado com sucesso."
      });

      // Reload budgets
      const budget = budgets.find(b => b.id === budgetId);
      if (budget) {
        await fetchBudgets(budget.year, budget.month);
      }
      return true;
    } catch (error) {
      safeLog("error", "useBudgets - Error updating budget", { error: String(error) });
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o orçamento."
      });
      return false;
    }
  };

  const deleteBudget = async (budgetId: string) => {
    try {
      await deleteBudgetFromDB(budgetId);

      toast({
        title: "Orçamento removido",
        description: "O orçamento foi removido com sucesso."
      });

      setBudgets(prev => prev.filter(b => b.id !== budgetId));
      return true;
    } catch (error) {
      safeLog("error", "useBudgets - Error deleting budget", { error: String(error) });
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o orçamento."
      });
      return false;
    }
  };

  useEffect(() => {
    safeLog("info", "useBudgets - Effect triggered", { workspaceId, userId });
    fetchBudgets();
  }, [workspaceId, userId]);

  return {
    budgets,
    loading,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    refetch: fetchBudgets
  };
}
