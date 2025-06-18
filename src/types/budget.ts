
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
