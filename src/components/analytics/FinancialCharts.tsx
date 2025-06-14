import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

const COLORS = ['#003f5c', '#2f9e44', '#f8961e', '#d62828', '#6f42c1', '#20c997'];

export function FinancialCharts() {
  const [incomeByCategory, setIncomeByCategory] = useState<ChartData[]>([]);
  const [expenseByCategory, setExpenseByCategory] = useState<ChartData[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();

  const fetchChartData = async () => {
    if (!user) return;

    try {
      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case '1month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch transactions for the period
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('type, amount, category, date')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      // Process income by category
      const incomeCategories: { [key: string]: number } = {};
      const expenseCategories: { [key: string]: number } = {};
      
      transactions?.forEach(transaction => {
        if (transaction.type === 'income') {
          incomeCategories[transaction.category] = (incomeCategories[transaction.category] || 0) + transaction.amount;
        } else {
          expenseCategories[transaction.category] = (expenseCategories[transaction.category] || 0) + transaction.amount;
        }
      });

      // Convert to chart data
      const incomeChartData = Object.entries(incomeCategories).map(([category, amount], index) => ({
        name: category,
        value: amount,
        color: COLORS[index % COLORS.length]
      }));

      const expenseChartData = Object.entries(expenseCategories).map(([category, amount], index) => ({
        name: category,
        value: amount,
        color: COLORS[index % COLORS.length]
      }));

      // Process monthly trend
      const monthlyData: { [key: string]: { income: number; expense: number } } = {};
      
      transactions?.forEach(transaction => {
        const monthKey = transaction.date.substring(0, 7); // YYYY-MM format
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expense: 0 };
        }
        
        if (transaction.type === 'income') {
          monthlyData[monthKey].income += transaction.amount;
        } else {
          monthlyData[monthKey].expense += transaction.amount;
        }
      });

      const monthlyTrendData = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
          month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          income: data.income,
          expense: data.expense
        }));

      setIncomeByCategory(incomeChartData);
      setExpenseByCategory(expenseChartData);
      setMonthlyTrend(monthlyTrendData);

    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [user, selectedPeriod]);

  if (loading) {
    return <div className="py-10 text-lg text-[--primary] animate-pulse">Carregando gráficos...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end items-start gap-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-[--primary]">Análises Gráficas</h2>
        <div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-44 bg-white/90 border-gray-200 rounded">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Último mês</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="1year">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tendência mensal */}
      <Card className="p-4 rounded-xl shadow-lg border-0 bg-gradient-to-br from-[#f8fafc] to-white/70">
        <CardHeader>
          <CardTitle className="text-[--primary] font-bold flex gap-3 items-center">📈 Tendência Receitas x Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString()}`} />
              <Tooltip 
                formatter={(value: number) => [`R$ ${Number(value).toFixed(2)}`, '']}
                labelFormatter={(label) => `Mês: ${label}`}
                wrapperStyle={{ fontFamily: 'Inter, Poppins, sans-serif', fontSize: 14 }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#2f9e44"
                strokeWidth={3}
                name="Receitas"
                dot={{ r: 5, fill: "#2f9e44", stroke: "#fff" }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#d62828"
                strokeWidth={3}
                name="Despesas"
                dot={{ r: 5, fill: "#d62828", stroke: "#fff" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {/* Receitas por categoria */}
        <Card className="shadow rounded-xl border-0 bg-gradient-to-br from-green-50 to-white/80">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center text-green-700">🍀 Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={incomeByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#2f9e44"
                    dataKey="value"
                  >
                    {incomeByCategory.map((entry, idx) => (
                      <Cell key={`cell-income-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground">
                Nenhuma receita no período selecionado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Despesas por categoria */}
        <Card className="shadow rounded-xl border-0 bg-gradient-to-br from-red-50 to-white/80">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center text-red-700">💸 Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#d62828"
                    dataKey="value"
                  >
                    {expenseByCategory.map((entry, idx) => (
                      <Cell key={`cell-expense-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground">
                Nenhuma despesa no período selecionado
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparativo de categorias */}
      <Card className="shadow rounded-xl border-0 bg-gradient-to-r from-yellow-50 via-blue-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center text-blue-900">📊 Comparativo Geral por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[...incomeByCategory, ...expenseByCategory]}>
              <CartesianGrid strokeDasharray="2 2" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `R$ ${v.toLocaleString()}`} />
              <Tooltip formatter={(value: number) => `R$ ${Number(value).toFixed(2)}`} />
              <Bar dataKey="value" fill="#003f5c" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
