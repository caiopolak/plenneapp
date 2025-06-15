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

  // Nova tabela de cores dos BADGES e fundos para cada tipo de investimento
  const getTypeStyles = (type: string) => {
    // tons harmonizados da identidade visual oficial
    const map: any = {
      stocks: { label: "Ações", bg: "bg-primary/90", text: "text-white" },
      bonds: { label: "Títulos", bg: "bg-secondary/80", text: "text-white" },
      crypto: { label: "Criptomoedas", bg: "bg-attention", text: "text-graphite" },
      real_estate: { label: "Imóveis", bg: "bg-[#f4f4f4]", text: "text-primary border border-primary/20" },
      funds: { label: "Fundos", bg: "bg-[#b7e4c7]", text: "text-primary" },
      savings: { label: "Poupança", bg: "bg-[#eaf6ee]", text: "text-secondary" },
    };
    return map[type] || { label: type, bg: "bg-[#003f5c]", text: "text-white" };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Botão/Modal principal: Adicionar Investimento */}
      <div className="flex w-full justify-end mb-0">
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-xl hover:from-secondary hover:to-primary hover:scale-105 transition">
              <Plus className="w-5 h-5 mr-2" /> Novo Investimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-[#f4f4f4] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-primary font-display">Novo Investimento</DialogTitle>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-tr from-primary to-secondary shadow-card border-none">
          <CardContent className="p-6 flex flex-col items-start gap-2">
            <div className="text-sm text-white/90 font-medium flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-attention" /> Total Investido
            </div>
            <div className="text-3xl font-extrabold text-white drop-shadow font-display">
              R$ {totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-card border-0">
          <CardContent className="p-6 flex flex-col items-start gap-2">
            <div className="text-sm text-primary font-medium flex items-center gap-2">
              <Plus className="w-5 h-5 text-secondary" /> Nº Investimentos
            </div>
            <div className="text-3xl font-extrabold text-primary drop-shadow font-display">{investments.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-attention/90 to-attention/40 shadow-card border-0">
          <CardContent className="p-6 flex flex-col items-start gap-2">
            <div className="text-sm text-white/90 font-medium flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-white/80" /> Retorno Médio Esperado
            </div>
            <div className="text-3xl font-extrabold text-white font-display">
              {averageReturn.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de investimentos */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-primary font-display mb-2">Meus Investimentos</h2>
        {investments.length === 0 ? (
          <Card className="bg-[#f4f4f4] border-none">
            <CardContent className="p-8 text-center">
              <p className="text-primary font-bold">Nenhum investimento registrado</p>
              <p className="text-sm text-graphite mt-2">
                Registre seus investimentos e acompanhe sua carteira financeira!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {investments.map((investment) => {
              const cat = getTypeStyles(investment.type);
              return (
                <Card key={investment.id} className={`group border-none hover:ring-2 hover:ring-attention/50 transition-all bg-gradient-to-tr from-[#f4f4f4] via-white to-[#eaf6ee] shadow-accent`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-primary font-display">{investment.name}</CardTitle>
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm mt-1
                            ${cat.bg} ${cat.text}`}
                        >
                          {cat.label}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Dialog open={!!editingInvestment && editingInvestment.id === investment.id} onOpenChange={(open) => !open && setEditingInvestment(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              aria-label="Editar investimento"
                              onClick={() => setEditingInvestment(investment)}
                              className="hover:bg-attention/20 hover:text-attention"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-[#f4f4f4] rounded-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-primary font-display">Editar Investimento</DialogTitle>
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
                          className="hover:bg-error/20"
                        >
                          <Trash2 className="w-4 h-4 text-error" />
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
                            <TrendingDown className="w-4 h-4 text-error" />
                          )}
                          <span className={`font-bold ${
                            investment.expected_return > 0 ? 'text-secondary' : 'text-error'
                          }`}>
                            {investment.expected_return}%
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Data da Compra</span>
                      <span className="text-sm text-graphite">
                        {format(new Date(investment.purchase_date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dicas & Alertas - AGORA AO FINAL */}
      <div className="mt-10">
        <Card className="bg-gradient-to-r from-attention/30 via-yellow-50 to-white border-0">
          <CardHeader className="flex flex-row gap-2 items-center">
            <Lightbulb className="w-6 h-6 text-attention" />
            <CardTitle className="text-attention text-lg font-bold font-display">Dicas de Investimento</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-base text-graphite space-y-1">
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
