import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Check, X, Plus } from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { BudgetForm } from "./BudgetForm";
import { BudgetInsights } from "./BudgetInsights";
import { CompactBudgetFilters, BudgetFiltersState } from "./CompactBudgetFilters";
import { BudgetExport } from "@/utils/dataExport";
import { useConfetti } from "@/hooks/useConfetti";
import { useToast } from "@/hooks/use-toast";

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const defaultFilters: BudgetFiltersState = {
  searchTerm: '',
  status: 'all',
};

export function BudgetManager() {
  const { budgets, loading, fetchBudgets, updateBudget, deleteBudget } = useBudgets();
  const { expenseCategories } = useCategories();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [filters, setFilters] = useState<BudgetFiltersState>(defaultFilters);
  const { fireSubtle } = useConfetti();
  const { toast } = useToast();
  const celebratedBudgets = useRef<Set<string>>(new Set());

  // Check for budgets that are under limit and celebrate
  useEffect(() => {
    budgets.forEach(budget => {
      // If budget is under 80% and we haven't celebrated yet
      if (budget.percentage <= 80 && budget.percentage > 0 && !celebratedBudgets.current.has(budget.id)) {
        // Only celebrate if they had good spending control
        if (budget.spent > 0 && budget.remaining > budget.amount_limit * 0.2) {
          celebratedBudgets.current.add(budget.id);
        }
      }
      // Reset celebration if budget gets exceeded
      if (budget.percentage >= 100) {
        celebratedBudgets.current.delete(budget.id);
      }
    });
  }, [budgets]);

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

  const getStatusBadge = (percentage: number, budgetId?: string) => {
    if (percentage >= 100) return <Badge variant="destructive">Estourado</Badge>;
    if (percentage >= 80) return <Badge variant="secondary">Atenção</Badge>;
    if (percentage > 0 && percentage <= 50) return <Badge variant="default" className="bg-green-500">Excelente!</Badge>;
    return <Badge variant="default">No limite</Badge>;
  };

  // Celebrate when all budgets are under control
  const handleCelebrateBudgetSuccess = () => {
    const allUnderControl = budgets.length > 0 && budgets.every(b => b.percentage < 80);
    if (allUnderControl && budgets.some(b => b.spent > 0)) {
      fireSubtle();
      toast({
        title: "🎯 Ótimo controle!",
        description: "Todos os seus orçamentos estão sob controle este mês!"
      });
    }
  };

  React.useEffect(() => {
    handlePeriodChange();
  }, [selectedYear, selectedMonth]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-6 w-40 bg-muted rounded" />
              <div className="flex gap-2">
                <div className="h-9 w-24 bg-muted rounded" />
                <div className="h-9 w-32 bg-muted rounded" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-12 bg-muted rounded" />
                <div className="h-10 w-full bg-muted rounded" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-12 bg-muted rounded" />
                <div className="h-10 w-full bg-muted rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-24 bg-muted rounded" />
                      <div className="h-5 w-16 bg-muted rounded-full" />
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full" />
                    <div className="flex justify-between">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-4 w-12 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="h-8 w-8 bg-muted rounded ml-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Filtrar orçamentos
  const filteredBudgets = useMemo(() => {
    return budgets.filter(budget => {
      const matchesSearch = !filters.searchTerm || 
        budget.category.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (filters.status === 'exceeded') matchesStatus = budget.percentage >= 100;
      else if (filters.status === 'warning') matchesStatus = budget.percentage >= 80 && budget.percentage < 100;
      else if (filters.status === 'good') matchesStatus = budget.percentage < 80;
      
      return matchesSearch && matchesStatus;
    });
  }, [budgets, filters]);

  const totalBudget = filteredBudgets.reduce((sum, budget) => sum + budget.amount_limit, 0);
  const totalSpent = filteredBudgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const resetFilters = () => setFilters(defaultFilters);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      exceeded: 'Estourados',
      warning: 'Em alerta',
      good: 'Sob controle',
    };
    return labels[status] || status;
  };

  const activeFilterTags = useMemo(() => {
    const tags: { label: string; key: keyof BudgetFiltersState; value: string }[] = [];
    if (filters.status !== 'all') {
      tags.push({ label: `Status: ${getStatusLabel(filters.status)}`, key: 'status', value: 'all' });
    }
    return tags;
  }, [filters]);

  const removeFilterTag = (key: keyof BudgetFiltersState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Preparar dados para exportação
  const budgetsForExport: BudgetExport[] = budgets.map(b => ({
    category: b.category,
    amount_limit: b.amount_limit,
    spent: b.spent,
    remaining: b.remaining,
    percentage: b.percentage,
    month: selectedMonth,
    year: selectedYear,
  }));

  return (
    <div className="space-y-6">
      {/* Header com filtros compactos */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text">
            Orçamentos
          </h1>
          <p className="text-muted-foreground text-sm">
            Controle seus gastos por categoria e mantenha suas finanças equilibradas.
          </p>
        </div>
        <CompactBudgetFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
          budgets={budgetsForExport}
          onImportSuccess={() => fetchBudgets(selectedYear, selectedMonth)}
          onNewBudget={() => setShowForm(true)}
        />
      </div>

      {/* Tags de filtros ativos */}
      {activeFilterTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilterTags.map((tag) => (
            <Badge key={tag.key} variant="secondary" className="gap-1 pr-1">
              {tag.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilterTag(tag.key, tag.value)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={resetFilters}>
            Limpar todos
          </Button>
        </div>
      )}

      {/* Controles de Período */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="flex-1">
              <Label htmlFor="year" className="text-foreground">Ano</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="min-h-[44px] sm:min-h-[40px]">
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
              <Label htmlFor="month" className="text-foreground">Mês</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="min-h-[44px] sm:min-h-[40px]">
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

      {/* Insights inteligentes */}
      <BudgetInsights budgets={filteredBudgets} />

      {/* Resumo Geral - Cards Estilizados */}
      {filteredBudgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[hsl(var(--card-info-bg))] border-[hsl(var(--card-info-border))] card-hover">
            <CardContent className="p-4">
              <div className="text-sm text-[hsl(var(--card-info-text))] font-medium">Total Orçado</div>
              <div className="text-xl sm:text-2xl font-bold text-[hsl(var(--card-info-accent))] font-display truncate">
                R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[hsl(var(--card-warning-bg))] border-[hsl(var(--card-warning-border))] card-hover">
            <CardContent className="p-4">
              <div className="text-sm text-[hsl(var(--card-warning-text))] font-medium">Total Gasto</div>
              <div className="text-xl sm:text-2xl font-bold text-[hsl(var(--card-warning-accent))] font-display truncate">
                R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card className={`card-hover ${totalBudget - totalSpent >= 0 
            ? 'bg-[hsl(var(--card-success-bg))] border-[hsl(var(--card-success-border))]' 
            : 'bg-[hsl(var(--card-error-bg))] border-[hsl(var(--card-error-border))]'
          }`}>
            <CardContent className="p-4">
              <div className={`text-sm font-medium ${totalBudget - totalSpent >= 0 
                ? 'text-[hsl(var(--card-success-text))]' 
                : 'text-[hsl(var(--card-error-text))]'
              }`}>
                Saldo Restante
              </div>
              <div className={`text-xl sm:text-2xl font-bold font-display truncate ${totalBudget - totalSpent >= 0 
                ? 'text-[hsl(var(--card-success-accent))]' 
                : 'text-[hsl(var(--card-error-accent))]'
              }`}>
                R$ {(totalBudget - totalSpent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border card-hover">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground font-medium">Uso Geral</span>
                <span className={`text-sm font-bold ${
                  totalPercentage >= 100 ? 'text-destructive' : 
                  totalPercentage >= 80 ? 'text-[hsl(var(--card-warning-accent))]' : 
                  'text-[hsl(var(--card-success-accent))]'
                }`}>
                  {totalPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(totalPercentage, 100)} 
                className={`h-3 ${
                  totalPercentage >= 100 ? '[&>div]:bg-destructive' : 
                  totalPercentage >= 80 ? '[&>div]:bg-[hsl(var(--card-warning-accent))]' : 
                  '[&>div]:bg-[hsl(var(--card-success-accent))]'
                }`} 
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Orçamentos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Orçamentos por Categoria</h2>
        {filteredBudgets.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-8 sm:py-12">
              <div className="text-center">
                {budgets.length === 0 ? (
                  <>
                    <p className="text-lg font-semibold text-foreground">Comece a controlar seus gastos! 📊</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                      Nenhum orçamento encontrado para {months[selectedMonth - 1]} de {selectedYear}. 
                      Crie orçamentos por categoria para ter controle total do seu dinheiro.
                    </p>
                    <Button onClick={() => setShowForm(true)} className="mt-4 min-h-[44px]">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Orçamento
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-foreground">Nenhum resultado encontrado</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Tente ajustar os filtros para ver mais orçamentos.
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {filteredBudgets.map((budget, index) => (
              <Card 
                key={budget.id} 
                className="bg-card border-border card-hover animate-fade-in opacity-0"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <CardContent className="p-4 sm:py-5">
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                        <h3 className="font-semibold text-foreground text-base sm:text-lg truncate">{budget.category}</h3>
                        {getStatusBadge(budget.percentage)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
                          <span className="text-muted-foreground flex flex-wrap items-center gap-1">
                            <span className="font-medium text-foreground">
                              R$ {budget.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span>de</span>
                            {editingBudget === budget.id ? (
                              <span className="inline-flex items-center gap-1 flex-wrap">
                                R$
                                <Input
                                  value={editAmount}
                                  onChange={(e) => setEditAmount(e.target.value)}
                                  className="w-24 h-8 text-sm"
                                  type="number"
                                  step="0.01"
                                />
                                <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-8 w-8 p-0 min-h-[32px]">
                                  <Check className="h-4 w-4 text-[hsl(var(--card-success-accent))]" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 p-0 min-h-[32px]">
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              </span>
                            ) : (
                              <>
                                <span className="font-medium text-foreground">
                                  R$ {budget.amount_limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(budget.id, budget.amount_limit)}
                                  className="h-6 w-6 p-0 min-h-[24px]"
                                >
                                  <Edit2 className="h-3 w-3 text-muted-foreground" />
                                </Button>
                              </>
                            )}
                          </span>
                          <span className={`text-sm font-bold ${
                            budget.percentage >= 100 ? 'text-destructive' :
                            budget.percentage >= 80 ? 'text-[hsl(var(--card-warning-accent))]' :
                            'text-[hsl(var(--card-success-accent))]'
                          }`}>
                            {budget.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(budget.percentage, 100)} 
                          className={`h-2 sm:h-3 ${
                            budget.percentage >= 100 ? '[&>div]:bg-destructive' :
                            budget.percentage >= 80 ? '[&>div]:bg-[hsl(var(--card-warning-accent))]' :
                            '[&>div]:bg-[hsl(var(--card-success-accent))]'
                          }`}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Restante: <span className="font-medium">R$ {budget.remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBudget(budget.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal do Formulário */}
      {showForm && (
        <BudgetForm
          year={selectedYear}
          month={selectedMonth}
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
