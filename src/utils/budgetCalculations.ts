
import { Budget, BudgetWithSpent } from "@/types/budget";

export function calculateBudgetWithSpent(
  budget: Budget, 
  spentByCategory: Record<string, number>
): BudgetWithSpent {
  const spent = spentByCategory[budget.category] || 0;
  const remaining = budget.amount_limit - spent;
  const percentage = budget.amount_limit > 0 ? (spent / budget.amount_limit) * 100 : 0;

  console.log(`budgetCalculations - Budget ${budget.category}: spent=${spent}, limit=${budget.amount_limit}, percentage=${percentage}`);

  return {
    ...budget,
    spent,
    remaining,
    percentage: Math.min(percentage, 100)
  };
}

export function calculateSpentByCategory(transactionData: any[]): Record<string, number> {
  return (transactionData || []).reduce((acc, transaction) => {
    acc[transaction.category] = (acc[transaction.category] || 0) + Number(transaction.amount);
    return acc;
  }, {} as Record<string, number>);
}
