
import { Tables } from "@/integrations/supabase/types";

export function exportGoalsCsv(goals: Tables<'financial_goals'>[]) {
  if (!goals.length) return;
  const headers = ["Nome","Valor Alvo","Valor Atual","Prioridade","Data Limite","Observação"];
  const rows = goals.map(g => [
    g.name,
    g.target_amount?.toFixed(2).replace('.',','),
    (g.current_amount||0).toFixed(2).replace('.',','),
    g.priority,
    g.target_date,
    g.note || ""
  ]);
  const content = [headers, ...rows].map(row => row.join(";")).join("\n");
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "metas-financeiras.csv";
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 200);
}
