
import { supabase } from "@/integrations/supabase/client";

export async function generateBudgetAlert(
  userId: string,
  category: string, 
  percentage: number, 
  priority: "warning" | "critical"
) {
  try {
    const alertMessage = percentage >= 100 
      ? `Orçamento de ${category} estourado! Você gastou ${percentage.toFixed(1)}% do limite.`
      : `Atenção! Você já gastou ${percentage.toFixed(1)}% do orçamento de ${category}.`;

    const { error } = await supabase
      .from("financial_alerts")
      .insert({
        user_id: userId,
        title: `Alerta de Orçamento: ${category}`,
        message: alertMessage,
        alert_type: "budget_exceeded",
        priority: priority === "critical" ? "high" : "medium"
      });

    if (error) {
      console.error("budgetAlerts - Error creating alert:", error);
    }
  } catch (error) {
    console.error("budgetAlerts - Error generating automatic alert:", error);
  }
}
