
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Trash2, Plus, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { InvestmentForm } from './InvestmentForm';
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
      stocks: 'primary',
      bonds: 'secondary',
      crypto: 'destructive',
      real_estate: 'outline',
      funds: 'secondary',
      savings: 'primary'
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
    <div className="space-y-7 animate-fade-in">
      {/* Botão/Modal principal: Adicionar Investimento */}
      <div className="flex w-full justify-end mb-1">
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90 font-bold shadow-lg">
              <Plus className="w-5 h-5 mr-2" /> Novo Investimento
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
      
      {/* Cards informativos e resumos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-gradient-to-tr from-primary/90 to-secondary/80 shadow-card border-none">
          <CardContent className="p-5 flex flex-col items-start gap-2">
            <div className="text-sm text-primary-foreground font-medium flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" /> Total Investido
            </div>
            <div className="text-3xl font-extrabold text-white drop-shadow">
              R$ {totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-secondary to-primary/70 shadow-card border-0">
          <CardContent className="p-5 flex flex-col items-start gap-2">
            <div className="text-sm text-white/90 font-medium flex items-center gap-2">
              <Plus className="w-5 h-5 text-white" />
              Nº Investimentos
            </div>
            <div className="text-3xl font-extrabold text-white drop-shadow">{investments.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-yellow-300 to-yellow-100 shadow-card border-0">
          <CardContent className="p-5 flex flex-col items-start gap-2">
            <div className="text-sm text-yellow-900 font-medium flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-800" /> Retorno Médio Esperado
            </div>
            <div className="text-3xl font-extrabold text-yellow-900">
              {averageReturn.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Visual da Carteira – pode ficar aqui ou ser removido se o usuário quiser só análises em outra página */}
      <InvestmentPortfolioSummary investments={investments} />

      {/* Lista de investimentos */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-primary mb-2">Meus Investimentos</h2>
        {investments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum investimento registrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Registre seus investimentos e acompanhe sua carteira financeira!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {investments.map((investment) => (
              <Card key={investment.id} className="group border-transparent hover:border-primary/30 hover:shadow-lg transition-all bg-gradient-to-tr from-white via-blue-50 to-white">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-primary font-display">{investment.name}</CardTitle>
                      <Badge variant={getTypeColor(investment.type) as any} className="mt-1 shadow-sm">
                        {getTypeLabel(investment.type)}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Dialog open={!!editingInvestment && editingInvestment.id === investment.id} onOpenChange={(open) => !open && setEditingInvestment(null)}>
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
                          {editingInvestment && editingInvestment.id === investment.id && (
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
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor Investido</span>
                    <span className="font-bold text-primary">
                      R$ {investment.amount.toLocaleString("pt-BR", {minimumFractionDigits: 2})}
                    </span>
                  </div>
                  
                  {investment.expected_return && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Retorno Esperado</span>
                      <div className="flex items-center gap-1">
                        {investment.expected_return > 0 ? (
                          <TrendingUp className="w-4 h-4 text-secondary" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        )}
                        <span className={`font-bold ${
                          investment.expected_return > 0 ? 'text-green-700' : 'text-red-700'
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

      {/* Dicas Financeiras & Alertas – agora ao final */}
      <div className="mt-8">
        <Card className="bg-gradient-to-r from-secondary/70 via-orange-50 to-yellow-50 border-0">
          <CardHeader className="flex flex-row gap-2 items-center">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <CardTitle className="text-attention text-lg font-bold">Dicas de Investimento</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-base text-neutral-700 space-y-1">
              <li>Priorize uma carteira diversificada: distribua entre renda fixa, variável e alternativas conforme seu perfil.</li>
              <li>Acompanhe os resultados periodicamente e ajuste seu portfólio conforme objetivos e cenário econômico.</li>
              <li>Mantenha parte do capital em liquidez para oportunidades e imprevistos.</li>
              <li>Busque sempre conhecimento e atualização sobre produtos financeiros antes de investir.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// O arquivo ficou longo; após aprovar este layout, recomendo pedir refatoração!
