import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { InvestmentForm } from './InvestmentForm';
import { InvestmentsPieChart } from "./InvestmentsPieChart";
import { InvestmentPortfolioSummary } from "./InvestmentPortfolioSummary";

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  expected_return: number;
  purchase_date: string;
}

export function InvestmentList() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const fetchInvestments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar investimentos"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [user]);

  const deleteInvestment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Investimento excluído com sucesso"
      });
      
      fetchInvestments();
    } catch (error) {
      console.error('Error deleting investment:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao excluir investimento"
      });
    }
  };

  const getTypeLabel = (type: string) => {
    const types = {
      stocks: 'Ações',
      bonds: 'Títulos',
      crypto: 'Criptomoedas',
      real_estate: 'Imóveis',
      funds: 'Fundos',
      savings: 'Poupança'
    };
    return types[type as keyof typeof types] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      stocks: 'default',
      bonds: 'secondary',
      crypto: 'destructive',
      real_estate: 'outline',
      funds: 'default',
      savings: 'secondary'
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const averageReturn = investments.length > 0 
    ? investments.reduce((sum, inv) => sum + (inv.expected_return || 0), 0) / investments.length 
    : 0;

  if (loading) {
    return <div>Carregando investimentos...</div>;
  }

  return (
    <div className="space-y-7">
      {/* Informativo geral do painel de investimentos */}
      <Card className="mb-2 bg-gradient-to-r from-blue-50 via-green-50 to-yellow-50 border-0 shadow-accent">
        <CardContent className="py-5 px-7 flex flex-col gap-2">
          <span className="text-lg font-semibold text-blue-900">
            Gerencie e acompanhe seus investimentos de forma inteligente
          </span>
          <span className="text-muted-foreground">
            Aqui você pode visualizar, adicionar e analisar sua carteira de investimentos. Utilize os resumos para obter uma visão rápida da diversificação da sua carteira, seu total investido e o retorno médio esperado. 
          </span>
        </CardContent>
      </Card>
      {/* Summary Cards, com visual reforçado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-gradient-to-r from-blue-100 to-blue-50 shadow-card border-transparent">
          <CardContent className="p-5 flex flex-col items-start gap-2">
            <div className="text-sm text-blue-700 font-medium flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-800" />
              Total Investido
            </div>
            <div className="text-3xl font-extrabold text-blue-900">
              R$ {totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-100 to-green-50 shadow-card border-transparent">
          <CardContent className="p-5 flex flex-col items-start gap-2">
            <div className="text-sm text-green-700 font-medium flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-700" />
              Nº de Investimentos
            </div>
            <div className="text-3xl font-extrabold text-green-900">
              {investments.length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-100 to-yellow-50 shadow-card border-transparent">
          <CardContent className="p-5 flex flex-col items-start gap-2">
            <div className="text-sm text-yellow-800 font-medium flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-700" />
              Retorno Médio Esperado
            </div>
            <div className="text-3xl font-extrabold text-yellow-700">
              {averageReturn.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Visual da Carteira */}
      <InvestmentPortfolioSummary investments={investments} />
      {/* Gráfico de Distribuição */}
      <div className="max-w-3xl mx-auto">
        <InvestmentsPieChart investments={investments} />
      </div>

      {/* Ações rápidas de cadastro */}
      <div className="flex justify-between items-center mt-6">
        <h2 className="text-2xl font-bold text-blue-900">Meus Investimentos</h2>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Investimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Investimento</DialogTitle>
            </DialogHeader>
            <InvestmentForm 
              onSuccess={() => {
                setShowForm(false);
                fetchInvestments();
              }}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Listagem de investimentos */}
      {investments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum investimento registrado</p>
            <p className="text-sm text-muted-foreground mt-2">
              Comece a registrar seus investimentos para acompanhar sua carteira!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investments.map((investment) => (
            <Card key={investment.id} className="group border-2 border-transparent hover:border-blue-200 hover:shadow-lg transition-all bg-white/95">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-blue-900">{investment.name}</CardTitle>
                    <Badge variant={getTypeColor(investment.type) as any} className="mt-1 shadow-sm">
                      {getTypeLabel(investment.type)}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          aria-label="Editar investimento"
                          onClick={() => setEditingInvestment(investment)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Editar Investimento</DialogTitle>
                        </DialogHeader>
                        {editingInvestment && (
                          <InvestmentForm 
                            investment={editingInvestment}
                            onSuccess={() => {
                              setEditingInvestment(null);
                              fetchInvestments();
                            }}
                            onCancel={() => setEditingInvestment(null)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Excluir investimento"
                      onClick={() => deleteInvestment(investment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Valor Investido</span>
                  <span className="font-bold text-blue-900">
                    R$ {investment.amount.toLocaleString("pt-BR", {minimumFractionDigits: 2})}
                  </span>
                </div>
                
                {investment.expected_return && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Retorno Esperado</span>
                    <div className="flex items-center gap-1">
                      {investment.expected_return > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`font-bold ${
                        investment.expected_return > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {investment.expected_return}%
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data da Compra</span>
                  <span className="text-sm">
                    {format(new Date(investment.purchase_date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
