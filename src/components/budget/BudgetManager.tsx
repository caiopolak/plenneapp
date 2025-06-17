
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit2, Check, X } from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import { BudgetForm } from "./BudgetForm";

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const expenseCategories = [
  "Alimentação", "Transporte", "Moradia", "Saúde", "Educação",
  "Lazer", "Vestuário", "Tecnologia", "Seguros", "Outros"
];

export function BudgetManager() {
  const { budgets, loading, fetchBudgets, updateBudget, deleteBudget } = useBudgets();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

  const handlePeriodChange = () => {
    fetchBudgets(selectedYear, selectedMonth);
  };

  const handleEdit = (budgetId: string, currentAmount: number) => {
    setEditingBudget(budgetId);
    setEditAmount(currentAmount.toString());
  };

  const handleSaveEdit = async () => {
    if (!editingBudget) return;
    
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;

    const success = await updateBudget(editingBudget, amount);
    if (success) {
      setEditingBudget(null);
      setEditAmount("");
    }
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
    setEditAmount("");
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) return <Badge variant="destructive">Estourado</Badge>;
    if (percentage >= 80) return <Badge variant="secondary">Atenção</Badge>;
    return <Badge variant="default">No limite</Badge>;
  };

  React.useEffect(() => {
    handlePeriodChange();
  }, [selectedYear, selectedMonth]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount_limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Controles de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Orçamentos Mensais
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="year">Ano</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="month">Mês</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      {budgets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Orçado</span>
                <span className="font-semibold">R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Gasto</span>
                <span className="font-semibold">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Saldo Restante</span>
                <span className={`font-semibold ${totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {(totalBudget - totalSpent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Progresso Geral</span>
                  <span className="text-sm font-medium">{totalPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(totalPercentage, 100)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Orçamentos */}
      <div className="grid gap-4">
        {budgets.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <p>Nenhum orçamento encontrado para {months[selectedMonth - 1]} de {selectedYear}</p>
                <Button onClick={() => setShowForm(true)} className="mt-4">
                  Criar Primeiro Orçamento
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => (
            <Card key={budget.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{budget.category}</h3>
                      {getStatusBadge(budget.percentage)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          R$ {budget.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de{' '}
                          {editingBudget === budget.id ? (
                            <span className="inline-flex items-center gap-1">
                              R$
                              <Input
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="w-20 h-6 text-xs"
                                type="number"
                                step="0.01"
                              />
                              <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-6 w-6 p-0">
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-6 w-6 p-0">
                                <X className="h-3 w-3" />
                              </Button>
                            </span>
                          ) : (
                            <>
                              R$ {budget.amount_limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(budget.id, budget.amount_limit)}
                                className="h-4 w-4 p-0 ml-1"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </span>
                        <span className="text-sm font-medium">{budget.percentage.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={Math.min(budget.percentage, 100)} 
                        className={`h-2 ${getStatusColor(budget.percentage)}`}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Restante: R$ {budget.remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteBudget(budget.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal do Formulário */}
      {showForm && (
        <BudgetForm
          year={selectedYear}
          month={selectedMonth}
          categories={expenseCategories}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchBudgets(selectedYear, selectedMonth);
          }}
        />
      )}
    </div>
  );
}
