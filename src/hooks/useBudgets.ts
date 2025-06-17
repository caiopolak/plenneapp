
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

  console.log("useBudgets - current workspace:", current?.id);
  console.log("useBudgets - user:", user?.id);

  const fetchBudgets = async (year?: number, month?: number) => {
    if (!current?.id || !user?.id) {
      console.log("useBudgets - No workspace or user, clearing budgets");
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const currentDate = new Date();
      const targetYear = year ?? currentDate.getFullYear();
      const targetMonth = month ?? currentDate.getMonth() + 1;

      console.log("useBudgets - Fetching budgets for:", { 
        workspace: current.id, 
        year: targetYear, 
        month: targetMonth 
      });

      // Buscar orçamentos do workspace atual
      const { data: budgetData, error: budgetError } = await supabase
        .from("budgets")
        .select("*")
        .eq("workspace_id", current.id)
        .eq("year", targetYear)
        .eq("month", targetMonth)
        .order("category");

      if (budgetError) {
        console.error("useBudgets - Budget error:", budgetError);
        throw budgetError;
      }

      console.log("useBudgets - Found budgets:", budgetData?.length || 0);

      // Buscar transações do workspace atual no período
      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0);

      console.log("useBudgets - Fetching transactions from", startDate.toISOString().split('T')[0], "to", endDate.toISOString().split('T')[0]);

      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .select("category, amount")
        .eq("workspace_id", current.id)
        .eq("type", "expense")
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0]);

      if (transactionError) {
        console.error("useBudgets - Transaction error:", transactionError);
        throw transactionError;
      }

      console.log("useBudgets - Found transactions:", transactionData?.length || 0);

      // Calcular gastos por categoria
      const spentByCategory = (transactionData || []).reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + Number(transaction.amount);
        return acc;
      }, {} as Record<string, number>);

      console.log("useBudgets - Spent by category:", spentByCategory);

      // Combinar orçamentos com gastos
      const budgetsWithSpent: BudgetWithSpent[] = (budgetData || []).map(budget => {
        const spent = spentByCategory[budget.category] || 0;
        const remaining = budget.amount_limit - spent;
        const percentage = budget.amount_limit > 0 ? (spent / budget.amount_limit) * 100 : 0;

        console.log(`useBudgets - Budget ${budget.category}: spent=${spent}, limit=${budget.amount_limit}, percentage=${percentage}`);

        // Gerar alertas automáticos baseados no progresso
        if (percentage >= 90 && percentage < 100) {
          generateBudgetAlert(budget.category, percentage, "warning");
        } else if (percentage >= 100) {
          generateBudgetAlert(budget.category, percentage, "critical");
        }

        return {
          ...budget,
          spent,
          remaining,
          percentage: Math.min(percentage, 100)
        };
      });

      setBudgets(budgetsWithSpent);
    } catch (error) {
      console.error("useBudgets - Error fetching budgets:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os orçamentos."
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para gerar alertas automáticos
  const generateBudgetAlert = async (category: string, percentage: number, priority: "warning" | "critical") => {
    try {
      const alertMessage = percentage >= 100 
        ? `Orçamento de ${category} estourado! Você gastou ${percentage.toFixed(1)}% do limite.`
        : `Atenção! Você já gastou ${percentage.toFixed(1)}% do orçamento de ${category}.`;

      const { error } = await supabase
        .from("financial_alerts")
        .insert({
          user_id: user!.id,
          title: `Alerta de Orçamento: ${category}`,
          message: alertMessage,
          alert_type: "budget_exceeded",
          priority: priority === "critical" ? "high" : "medium"
        });

      if (error) {
        console.error("useBudgets - Error creating alert:", error);
      }
    } catch (error) {
      console.error("useBudgets - Error generating automatic alert:", error);
    }
  };

  const createBudget = async (category: string, amount: number, year: number, month: number) => {
    if (!current?.id || !user?.id) {
      console.log("useBudgets - Cannot create budget: no workspace or user");
      return false;
    }

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
      console.error("useBudgets - Error creating budget:", error);
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
      console.error("useBudgets - Error updating budget:", error);
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
      console.error("useBudgets - Error deleting budget:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o orçamento."
      });
      return false;
    }
  };

  useEffect(() => {
    console.log("useBudgets - Effect triggered, workspace:", current?.id, "user:", user?.id);
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
