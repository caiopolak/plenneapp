// Utilitários centralizados para exportação de dados

export interface ExportOptions {
  filename: string;
  format: 'csv' | 'json';
  encoding?: string;
}

// Formatação de moeda para CSV
export const formatCurrencyForExport = (value: number): string => {
  return value.toFixed(2).replace('.', ',');
};

// Formatação de data para CSV
export const formatDateForExport = (date: string | null): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

// Exportação genérica para CSV
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  headers: { key: keyof T; label: string }[],
  options: ExportOptions
): void {
  if (!data.length) {
    throw new Error('Nenhum dado para exportar');
  }

  const headerRow = headers.map(h => h.label).join(';');
  const rows = data.map(item =>
    headers.map(h => {
      const value = item[h.key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'number') return formatCurrencyForExport(value);
      if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
      return String(value).replace(/;/g, ',');
    }).join(';')
  );

  const content = [headerRow, ...rows].join('\n');
  const BOM = '\uFEFF'; // UTF-8 BOM para Excel
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8' });
  
  downloadBlob(blob, `${options.filename}.csv`);
}

// Exportação para JSON
export function exportToJSON<T>(data: T[], options: ExportOptions): void {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  downloadBlob(blob, `${options.filename}.json`);
}

// Download helper
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 200);
}

// ============ EXPORTAÇÕES ESPECÍFICAS ============

// Transações
export interface TransactionExport {
  date: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  is_recurring: boolean;
  recurrence_pattern: string | null;
}

export function exportTransactions(transactions: TransactionExport[]): void {
  const headers: { key: keyof TransactionExport; label: string }[] = [
    { key: 'date', label: 'Data' },
    { key: 'type', label: 'Tipo' },
    { key: 'category', label: 'Categoria' },
    { key: 'description', label: 'Descrição' },
    { key: 'amount', label: 'Valor' },
    { key: 'is_recurring', label: 'Recorrente' },
    { key: 'recurrence_pattern', label: 'Padrão Recorrência' },
  ];

  const formattedData = transactions.map(t => ({
    ...t,
    date: formatDateForExport(t.date),
    type: t.type === 'income' ? 'Receita' : 'Despesa',
  }));

  exportToCSV(formattedData, headers, {
    filename: `transacoes_${new Date().toISOString().split('T')[0]}`,
    format: 'csv'
  });
}

// Metas
export interface GoalExport {
  name: string;
  target_amount: number;
  current_amount: number;
  priority: string;
  target_date: string | null;
  note: string | null;
}

export function exportGoals(goals: GoalExport[]): void {
  const headers: { key: keyof GoalExport; label: string }[] = [
    { key: 'name', label: 'Nome' },
    { key: 'target_amount', label: 'Valor Alvo' },
    { key: 'current_amount', label: 'Valor Atual' },
    { key: 'priority', label: 'Prioridade' },
    { key: 'target_date', label: 'Data Limite' },
    { key: 'note', label: 'Observação' },
  ];

  const priorityMap: Record<string, string> = {
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa'
  };

  const formattedData = goals.map(g => ({
    ...g,
    target_date: formatDateForExport(g.target_date),
    priority: priorityMap[g.priority] || g.priority,
  }));

  exportToCSV(formattedData, headers, {
    filename: `metas_${new Date().toISOString().split('T')[0]}`,
    format: 'csv'
  });
}

// Investimentos
export interface InvestmentExport {
  name: string;
  type: string;
  amount: number;
  expected_return: number | null;
  purchase_date: string | null;
}

export function exportInvestments(investments: InvestmentExport[]): void {
  const typeMap: Record<string, string> = {
    stocks: 'Ações',
    bonds: 'Títulos',
    crypto: 'Criptomoedas',
    real_estate: 'Imóveis',
    funds: 'Fundos',
    savings: 'Poupança'
  };

  const headers: { key: keyof InvestmentExport; label: string }[] = [
    { key: 'name', label: 'Nome' },
    { key: 'type', label: 'Tipo' },
    { key: 'amount', label: 'Valor Investido' },
    { key: 'expected_return', label: 'Retorno Esperado (%)' },
    { key: 'purchase_date', label: 'Data da Compra' },
  ];

  const formattedData = investments.map(i => ({
    ...i,
    type: typeMap[i.type] || i.type,
    purchase_date: formatDateForExport(i.purchase_date),
    expected_return: i.expected_return || 0,
  }));

  exportToCSV(formattedData, headers, {
    filename: `investimentos_${new Date().toISOString().split('T')[0]}`,
    format: 'csv'
  });
}

// Orçamentos
export interface BudgetExport {
  category: string;
  amount_limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  month: number;
  year: number;
}

export function exportBudgets(budgets: BudgetExport[]): void {
  const months = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const headers: { key: keyof BudgetExport; label: string }[] = [
    { key: 'category', label: 'Categoria' },
    { key: 'amount_limit', label: 'Limite' },
    { key: 'spent', label: 'Gasto' },
    { key: 'remaining', label: 'Restante' },
    { key: 'percentage', label: 'Utilizado (%)' },
    { key: 'month', label: 'Mês' },
    { key: 'year', label: 'Ano' },
  ];

  const formattedData = budgets.map(b => ({
    ...b,
    month: months[b.month] || b.month,
  }));

  exportToCSV(formattedData as any, headers, {
    filename: `orcamentos_${new Date().toISOString().split('T')[0]}`,
    format: 'csv'
  });
}
