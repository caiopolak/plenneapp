import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, Target, PiggyBank, Plus, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TransactionActionButtons } from "@/components/transactions/TransactionActionButtons";
import { GoalActionButtons } from "@/components/goals/GoalActionButtons";
import { InvestmentActionButtons } from "@/components/investments/InvestmentActionButtons";

const Index = () => {
  const [showBalance, setShowBalance] = useState(true);
  // Estados para modais de criação
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);

  // Mock data - será substituído pelos dados do Supabase
  const monthlyData = [
    { month: 'Jan', receitas: 8000, despesas: 5500 },
    { month: 'Fev', receitas: 9200, despesas: 6100 },
    { month: 'Mar', receitas: 7800, despesas: 5800 },
    { month: 'Abr', receitas: 10500, despesas: 7200 },
    { month: 'Mai', receitas: 9800, despesas: 6800 },
    { month: 'Jun', receitas: 11200, despesas: 7500 },
  ];

  const expenseCategories = [
    { name: 'Alimentação', value: 1800, color: '#8B5CF6' },
    { name: 'Transporte', value: 800, color: '#06B6D4' },
    { name: 'Moradia', value: 2500, color: '#10B981' },
    { name: 'Entretenimento', value: 600, color: '#F59E0B' },
    { name: 'Outros', value: 800, color: '#EF4444' },
  ];

  const goals = [
    { id: 1, name: 'Viagem para Europa', current: 12500, target: 20000, priority: 'high' },
    { id: 2, name: 'Fundo de Emergência', current: 8000, target: 15000, priority: 'medium' },
    { id: 3, name: 'Novo Notebook', current: 2800, target: 4500, priority: 'low' },
  ];

  const investments = [
    { name: 'Tesouro Selic', type: 'Renda Fixa', amount: 25000, return: 12.5 },
    { name: 'Ações ITUB4', type: 'Ações', amount: 8000, return: 18.2 },
    { name: 'Bitcoin', type: 'Crypto', amount: 5000, return: -8.5 },
  ];

  const totalBalance = 47850;
  const monthlyIncome = 11200;
  const monthlyExpenses = 7500;

  // HANDLERS para abrir forms
  const handleCreateTransaction = () => setShowTransactionForm(true);
  const handleCreateGoal = () => setShowGoalForm(true);
  const handleCreateInvestment = () => setShowInvestmentForm(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FinanciePRO
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Botão Nova Transação */}
              <Button
                variant="outline"
                size="sm"
                className="font-display flex gap-2 bg-white border border-[--primary]/20 text-[--primary] hover:bg-[--secondary]/10 shadow min-w-[170px] w-full sm:w-auto"
                onClick={handleCreateTransaction}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MODAIS PARA FORMULÁRIOS */}
      {showTransactionForm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl mx-4 p-5 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowTransactionForm(false)}
            >
              ×
            </button>
            <h2 className="font-bold text-lg mb-2">Nova Transação</h2>
            {/* Substituir pelo seu Formulário */}
            <p className="text-sm text-gray-600">[Formulário de transação aqui]</p>
          </div>
        </div>
      )}
      {showGoalForm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl mx-4 p-5 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowGoalForm(false)}
            >
              ×
            </button>
            <h2 className="font-bold text-lg mb-2">Nova Meta</h2>
            <p className="text-sm text-gray-600">[Formulário de meta aqui]</p>
          </div>
        </div>
      )}
      {showInvestmentForm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl mx-4 p-5 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowInvestmentForm(false)}
            >
              ×
            </button>
            <h2 className="font-bold text-lg mb-2">Novo Investimento</h2>
            <p className="text-sm text-gray-600">[Formulário de investimento aqui]</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Olá, Usuário! 👋</h2>
          <p className="text-gray-600">Aqui está um resumo das suas finanças hoje.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Saldo Total</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-white hover:bg-white/20"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showBalance ? `R$ ${totalBalance.toLocaleString('pt-BR')}` : 'R$ ••••••'}
              </div>
              <p className="text-xs opacity-90 mt-1">
                +12.5% em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Receitas do Mês</CardTitle>
              <TrendingUp className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {monthlyIncome.toLocaleString('pt-BR')}</div>
              <p className="text-xs opacity-90 mt-1">
                +8.2% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Despesas do Mês</CardTitle>
              <Target className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {monthlyExpenses.toLocaleString('pt-BR')}</div>
              <p className="text-xs opacity-90 mt-1">
                -3.1% vs mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="goals">Metas</TabsTrigger>
            <TabsTrigger value="investments">Investimentos</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Receitas vs Despesas Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Receitas vs Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="receitas" fill="#10B981" />
                      <Bar dataKey="despesas" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Expense Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Gastos por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Dicas Financeiras */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-800">💡 Dicas Financeiras Personalizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-yellow-700">• Você gastou 15% menos em transporte este mês. Continue assim!</p>
                  <p className="text-yellow-700">• Considere investir R$ 500 extras em renda fixa para atingir sua meta mais rápido.</p>
                  <p className="text-yellow-700">• Seus gastos com alimentação estão 8% acima da média. Que tal revisar esse orçamento?</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transações */}
          <TabsContent value="transactions" className="space-y-6">
            {/* Ações em Transações */}
            <div className="w-full mb-4">
              <TransactionActionButtons
                onExport={() => {}}  // ajuste se necessário
                onImportSuccess={() => {}}
                showForm={showTransactionForm}
                setShowForm={setShowTransactionForm}
                onCreateClick={handleCreateTransaction}
              />
            </div>
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'income', description: 'Salário', amount: 8500, date: '2024-06-10', category: 'Trabalho' },
                    { type: 'expense', description: 'Supermercado', amount: -320, date: '2024-06-09', category: 'Alimentação' },
                    { type: 'expense', description: 'Combustível', amount: -180, date: '2024-06-08', category: 'Transporte' },
                    { type: 'income', description: 'Freelance', amount: 1200, date: '2024-06-07', category: 'Extra' },
                  ].map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        )}>
                          {transaction.type === 'income' ? '+' : '-'}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.category} • {transaction.date}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "font-semibold",
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      )}>
                        R$ {Math.abs(transaction.amount).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metas */}
          <TabsContent value="goals" className="space-y-6">
            {/* Ações em Metas */}
            <div className="w-full mb-4">
              <GoalActionButtons
                goals={goals}
                onSearchChange={() => {}}
                search={""}
                priorityFilter={"all"}
                onPriorityChange={() => {}}
                onImportSuccess={() => {}}
                showForm={showGoalForm}
                setShowForm={setShowGoalForm}
              />
            </div>
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                <CardTitle>Suas Metas Financeiras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {goals.map((goal) => {
                    const progress = (goal.current / goal.target) * 100;
                    return (
                      <div key={goal.id} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold">{goal.name}</h3>
                          <span className={cn(
                            "px-2 py-1 text-xs rounded-full",
                            goal.priority === 'high' ? 'bg-red-100 text-red-600' :
                            goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          )}>
                            {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}
                          </span>
                        </div>
                        <Progress value={progress} className="w-full" />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>R$ {goal.current.toLocaleString('pt-BR')}</span>
                          <span>R$ {goal.target.toLocaleString('pt-BR')}</span>
                        </div>
                        <p className="text-sm text-gray-500">{progress.toFixed(1)}% concluído</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investimentos */}
          <TabsContent value="investments" className="space-y-6">
            {/* Ações em Investimentos */}
            <div className="w-full mb-4">
              <InvestmentActionButtons
                investments={investments}
                onImportSuccess={() => {}}
                onCreateClick={handleCreateInvestment}
                showForm={showInvestmentForm}
                setShowForm={setShowInvestmentForm}
              />
            </div>
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                <CardTitle>Portfólio de Investimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments.map((investment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <PiggyBank className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{investment.name}</p>
                          <p className="text-sm text-gray-500">{investment.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">R$ {investment.amount.toLocaleString('pt-BR')}</p>
                        <p className={cn(
                          "text-sm",
                          investment.return >= 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                          {investment.return >= 0 ? '+' : ''}{investment.return}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios e Análises</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col">
                    <span className="font-semibold">Relatório Mensal</span>
                    <span className="text-sm text-gray-500">Análise completa do mês</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <span className="font-semibold">Exportar Dados</span>
                    <span className="text-sm text-gray-500">CSV, PDF ou Excel</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <span className="font-semibold">Análise de Gastos</span>
                    <span className="text-sm text-gray-500">Onde você mais gasta</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <span className="font-semibold">Projeções</span>
                    <span className="text-sm text-gray-500">Metas e orçamentos futuros</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
