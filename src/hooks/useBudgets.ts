
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Budget {
  id: string;
  user_id: string;
  workspace_id: string | null;
  category: string;
  year: number;
  month: number;
  amount_limit: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetWithSpent extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
}

export function useBudgets() {
  const { current } = useWorkspace();
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async (year?: number, month?: number) => {
    if (!current?.id || !user?.id) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const currentDate = new Date();
      const targetYear = year ?? currentDate.getFullYear();
      const targetMonth = month ?? currentDate.getMonth() + 1;

      // Buscar orçamentos
      const { data: budgetData, error: budgetError } = await supabase
        .from("budgets")
        .select("*")
        .eq("workspace_id", current.id)
        .eq("year", targetYear)
        .eq("month", targetMonth)
        .order("category");

      if (budgetError) throw budgetError;

      // Buscar gastos por categoria no mesmo período
      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0);

      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .select("category, amount")
        .eq("workspace_id", current.id)
        .eq("type", "expense")
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0]);

      if (transactionError) throw transactionError;

      // Calcular gastos por categoria
      const spentByCategory = (transactionData || []).reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + Number(transaction.amount);
        return acc;
      }, {} as Record<string, number>);

      // Combinar orçamentos com gastos
      const budgetsWithSpent: BudgetWithSpent[] = (budgetData || []).map(budget => {
        const spent = spentByCategory[budget.category] || 0;
        const remaining = budget.amount_limit - spent;
        const percentage = budget.amount_limit > 0 ? (spent / budget.amount_limit) * 100 : 0;

        return {
          ...budget,
          spent,
          remaining,
          percentage: Math.min(percentage, 100)
        };
      });

      setBudgets(budgetsWithSpent);
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
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
    if (!current?.id || !user?.id) return false;

    try {
      const { error } = await supabase
        .from("budgets")
        .insert({
          user_id: user.id,
          workspace_id: current.id,
          category,
          amount_limit: amount,
          year,
          month
        });

      if (error) throw error;

      toast({
        title: "Orçamento criado!",
        description: `Orçamento para ${category} foi criado com sucesso.`
      });

      await fetchBudgets(year, month);
      return true;
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
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
      const { error } = await supabase
        .from("budgets")
        .update({ 
          amount_limit: amount,
          updated_at: new Date().toISOString()
        })
        .eq("id", budgetId);

      if (error) throw error;

      toast({
        title: "Orçamento atualizado!",
        description: "O valor do orçamento foi atualizado com sucesso."
      });

      // Recarregar orçamentos
      const budget = budgets.find(b => b.id === budgetId);
      if (budget) {
        await fetchBudgets(budget.year, budget.month);
      }
      return true;
    } catch (error) {
      console.error("Erro ao atualizar orçamento:", error);
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
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", budgetId);

      if (error) throw error;

      toast({
        title: "Orçamento removido",
        description: "O orçamento foi removido com sucesso."
      });

      setBudgets(prev => prev.filter(b => b.id !== budgetId));
      return true;
    } catch (error) {
      console.error("Erro ao deletar orçamento:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o orçamento."
      });
      return false;
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [current?.id, user?.id]);

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
