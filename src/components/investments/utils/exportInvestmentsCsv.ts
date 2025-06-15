
export interface InvestmentForExport {
  name: string;
  type: string;
  amount: number;
  expected_return: number | null;
  purchase_date: string | null;
}

export function exportInvestmentsCsv(investments: InvestmentForExport[]) {
  if (!investments.length) return;

  const headers = ["Nome", "Tipo", "Valor Investido", "Retorno Esperado (%)", "Data da Compra"];
  const rows = investments.map(inv => [
    inv.name,
    inv.type,
    `R$ ${Number(inv.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    inv.expected_return !== null ? inv.expected_return : "",
    inv.purchase_date ? new Date(inv.purchase_date).toLocaleDateString("pt-BR") : ""
  ]);
  const content = [headers, ...rows].map(row => row.join(";")).join("\n");
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "investimentos.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 200);
}
