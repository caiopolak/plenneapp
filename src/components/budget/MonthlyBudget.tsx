
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, AlertCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MonthlyBudget {
  id: string;
  month: number;
  year: number;
  category: string;
  budget_amount: number;
  spent_amount: number;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  amount: number;
  category: string;
  date: string;
  type: string;
}

export function MonthlyBudget() {
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    category: '',
    budget_amount: ''
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  const categories = [
    'Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação',
    'Entretenimento', 'Vestuário', 'Utilidades', 'Investimentos', 'Outros'
  ];

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const fetchBudgets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('monthly_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
        .order('category');

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar orçamentos"
      });
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('transactions')
        .select('amount, category, date, type')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    if (user) {
      Promise.all([fetchBudgets(), fetchTransactions()]).finally(() => setLoading(false));
    }
  }, [user, selectedMonth, selectedYear]);

  const calculateSpentAmount = (category: string) => {
    return transactions
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const createBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('monthly_budgets')
        .insert({
          user_id: user.id,
          month: selectedMonth,
          year: selectedYear,
          category: formData.category,
          budget_amount: parseFloat(formData.budget_amount),
          spent_amount: calculateSpentAmount(formData.category)
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Orçamento criado com sucesso"
      });

      setFormData({ category: '', budget_amount: '' });
      setShowForm(false);
      fetchBudgets();
    } catch (error) {
      console.error('Error creating budget:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao criar orçamento"
      });
    }
  };

  const updateSpentAmounts = async () => {
    try {
      for (const budget of budgets) {
        const spentAmount = calculateSpentAmount(budget.category);
        
        if (spentAmount !== budget.spent_amount) {
          await supabase
            .from('monthly_budgets')
            .update({ spent_amount: spentAmount })
            .eq('id', budget.id);
        }
      }
      
      fetchBudgets();
      toast({
        title: "Sucesso!",
        description: "Gastos atualizados com sucesso"
      });
    } catch (error) {
      console.error('Error updating spent amounts:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar gastos"
      });
    }
  };

  const getTotalBudget = () => budgets.reduce((sum, b) => sum + b.budget_amount, 0);
  const getTotalSpent = () => budgets.reduce((sum, b) => sum + calculateSpentAmount(b.category), 0);
  const getBudgetStatus = (budget: MonthlyBudget) => {
    const spent = calculateSpentAmount(budget.category);
    const percentage = (spent / budget.budget_amount) * 100;
    
    if (percentage >= 100) return 'exceeded';
    if (percentage >= 80) return 'warning';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'good': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return <div>Carregando orçamentos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003f5c] flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Orçamento Mensal
          </h2>
          <p className="text-[#2b2b2b]/70">Gerencie seus gastos por categoria</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-[#2f9e44] hover:bg-[#2f9e44]/90">
                <Plus className="w-4 h-4 mr-2" />
                Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Orçamento por Categoria</DialogTitle>
              </DialogHeader>
              <form onSubmit={createBudget} className="space-y-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="budget_amount">Valor do Orçamento (R$)</Label>
                  <Input
                    id="budget_amount"
                    type="number"
                    step="0.01"
                    value={formData.budget_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_amount: e.target.value }))}
                    placeholder="0,00"
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-[#2f9e44] hover:bg-[#2f9e44]/90">
                    Criar Orçamento
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2b2b2b]/70">Orçamento Total</p>
                <p className="text-2xl font-bold text-[#003f5c]">
                  R$ {getTotalBudget().toFixed(2).replace('.', ',')}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#2f9e44]" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2b2b2b]/70">Total Gasto</p>
                <p className="text-2xl font-bold text-[#f8961e]">
                  R$ {getTotalSpent().toFixed(2).replace('.', ',')}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-[#f8961e]" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2b2b2b]/70">Restante</p>
                <p className={`text-2xl font-bold ${getTotalBudget() - getTotalSpent() >= 0 ? 'text-[#2f9e44]' : 'text-[#d62828]'}`}>
                  R$ {(getTotalBudget() - getTotalSpent()).toFixed(2).replace('.', ',')}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#003f5c]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <Button 
          onClick={updateSpentAmounts}
          variant="outline"
          className="border-[#2f9e44] text-[#2f9e44] hover:bg-[#2f9e44] hover:text-white"
        >
          Atualizar Gastos
        </Button>
      </div>

      {budgets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="w-12 h-12 mx-auto text-[#003f5c]/50 mb-4" />
            <p className="text-[#2b2b2b]/70">Nenhum orçamento criado para este mês</p>
            <p className="text-sm text-[#2b2b2b]/50 mt-2">
              Adicione categorias para começar a controlar seus gastos
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((budget) => {
            const spent = calculateSpentAmount(budget.category);
            const percentage = (spent / budget.budget_amount) * 100;
            const status = getBudgetStatus(budget);
            
            return (
              <Card key={budget.id} className="border-l-4 border-l-[#003f5c]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-[#003f5c]">{budget.category}</CardTitle>
                    {status === 'exceeded' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso dos gastos</span>
                      <span className={getStatusColor(status)}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#2b2b2b]/70">Orçado</p>
                      <p className="font-semibold text-[#003f5c]">
                        R$ {budget.budget_amount.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#2b2b2b]/70">Gasto</p>
                      <p className={`font-semibold ${getStatusColor(status)}`}>
                        R$ {spent.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-[#2b2b2b]/70">Restante</p>
                    <p className={`font-semibold ${budget.budget_amount - spent >= 0 ? 'text-[#2f9e44]' : 'text-[#d62828]'}`}>
                      R$ {Math.max(0, budget.budget_amount - spent).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
