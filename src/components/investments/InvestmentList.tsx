import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Trash2, Plus, TrendingUp, TrendingDown, Lightbulb, Import } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { InvestmentForm } from './InvestmentForm';
import { InvestmentPortfolioSummary } from "./InvestmentPortfolioSummary";
import { exportInvestmentsCsv } from './utils/exportInvestmentsCsv';
import { ImportGoalsCSV } from "../goals/ImportGoalsCSV"; // Placeholder visual para CSV de investimentos

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

  const handleExportCsv = () => {
    try {
      exportInvestmentsCsv(
        investments.map(inv => ({
          name: inv.name,
          type: getTypeLabel(inv.type),
          amount: inv.amount,
          expected_return: inv.expected_return,
          purchase_date: inv.purchase_date
        }))
      );
      toast({
        title: "Exportação concluída",
        description: "Os investimentos foram exportados para CSV.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: "Não foi possível exportar os investimentos.",
      });
    }
  };

  if (loading) {
    return <div>Carregando investimentos...</div>;
  }

  // Paleta visual harmonizada conforme identidade (ajuste para combinar com estética e eliminar laranja em destaques/alertas!)
  const getTypeStyles = (type: string) => {
    const map: any = {
      stocks:      { label: "Ações",       bg: "bg-[#003f5c]",   text: "text-white" },
      bonds:       { label: "Títulos",     bg: "bg-[#2f9e44]",   text: "text-white" },
      crypto:      { label: "Criptomoedas",bg: "bg-[#eaf6ee]",   text: "text-[#003f5c] dark:text-[#003f5c]" },
      real_estate: { label: "Imóveis",     bg: "bg-[#f4f4f4] border border-[#003f5c]/20", text: "text-[#2f9e44]" },
      funds:       { label: "Fundos",      bg: "bg-[#f4f4f4]",   text: "text-[#003f5c]" },
      savings:     { label: "Poupança",    bg: "bg-white border border-[#2f9e44]/40", text: "text-[#2f9e44]" },
    };
    return map[type] || { label: type, bg: "bg-[#003f5c]", text: "text-white" };
  };

  // Cartões analíticos e informativos — novo gradiente/principal
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Botões de ação - Exportação CSV incluída */}
      <div className="flex w-full justify-between mb-0 gap-2">
        <div />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            size="sm"
            className="font-display min-w-[170px] flex gap-2 bg-white border border-[--primary]/20 text-[--primary] hover:bg-[--secondary]/10 shadow"
            aria-label="Exportar investimentos para CSV"
          >
            <Lightbulb className="hidden" />{/* visual pad: para manter alinhamento */}
            <TrendingUp className="hidden" />
            <TrendingDown className="hidden" />
            <Trash2 className="hidden" />
            <Import className="hidden" />
            <Plus className="hidden" />
            <Edit2 className="hidden" />
            <Badge className="hidden" />
            <Badge className="hidden" />
            <Badge className="hidden" />
            <Badge className="hidden" />
            <Badge className="hidden" />
            <Badge className="hidden" />
            <Badge className="hidden" />
            <Badge className="hidden" />
            <Badge className="hidden" />
            <Badge className="hidden" />
            <Badge className="hidden" />
            {/* Fim pad */}
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Exportar CSV
            </span>
          </Button>
          {/* Botão Importar CSV, mesmo estilo */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="font-display min-w-[170px] flex gap-2 bg-white border border-[--primary]/20 text-[--primary] hover:bg-[--secondary]/10 shadow"
                aria-label="Importar investimentos de CSV"
              >
                <Import className="w-4 h-4" />
                Importar CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Importar investimentos em lote (CSV)</DialogTitle>
              </DialogHeader>
              <ImportGoalsCSV onSuccess={fetchInvestments} />
            </DialogContent>
          </Dialog>
          {/* Já existe o botão de adicionar investimento */}
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-[#003f5c] to-[#2f9e44] text-white font-bold shadow-xl hover:from-[#2f9e44] hover:to-[#003f5c] hover:scale-105 transition">
                <Plus className="w-5 h-5 mr-2" /> Novo Investimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-[#f4f4f4] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-[#003f5c] font-display">Novo Investimento</DialogTitle>
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
      </div>

      {/* Cards informativos harmonizados agora SEM degradê em Nº Investimentos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-tr from-[#003f5c] to-[#2f9e44] shadow-[0_4px_32px_0_rgba(0,63,92,0.16)] border-none">
          {/* Total Investido */}
          <CardContent className="p-6 flex flex-col items-start gap-2">
            <div className="text-sm text-white/90 font-medium flex items-center gap-2 font-display">
              <TrendingUp className="w-5 h-5 text-[#f4f4f4]" /> Total Investido
            </div>
            <div className="text-3xl font-extrabold text-white drop-shadow font-display">
              R$ {totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#eaf6ee] shadow-[0_4px_32px_0_rgba(0,63,92,0.11)] border-0">
          {/* Nº Investimentos – sólido, sem degradê */}
          <CardContent className="p-6 flex flex-col items-start gap-2">
            <div className="text-sm text-[#003f5c] font-medium flex items-center gap-2 font-display">
              <Plus className="w-5 h-5 text-[#2f9e44]" /> Nº Investimentos
            </div>
            <div className="text-3xl font-extrabold text-[#003f5c] drop-shadow font-display">{investments.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-tr from-[#003f5c]/80 to-[#2f9e44]/40 shadow-[0_4px_32px_0_rgba(0,63,92,0.14)] border-0">
          {/* Retorno Médio Esperado */}
          <CardContent className="p-6 flex flex-col items-start gap-2">
            <div className="text-sm text-white/90 font-medium flex items-center gap-2 font-display">
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
        <h2 className="text-2xl font-bold text-[#003f5c] font-display mb-2">Meus Investimentos</h2>
        {investments.length === 0 ? (
          <Card className="bg-[#f4f4f4] border-none shadow-[0_4px_32px_0_rgba(0,63,92,0.08)]">
            <CardContent className="p-8 text-center">
              <p className="text-[#003f5c] font-bold font-display">Nenhum investimento registrado</p>
              <p className="text-sm text-[#2b2b2b] mt-2">
                Registre seus investimentos e acompanhe sua carteira financeira!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {investments.map((investment) => {
              const cat = getTypeStyles(investment.type);
              return (
                <Card
                  key={investment.id}
                  // Mudança: sombra azul petróleo e remoção de qualquer detalhe laranja
                  className={`group border-none hover:ring-2 hover:ring-[#003f5c]/30 transition-all shadow-[0_4px_24px_0_rgba(0,63,92,0.13)] bg-gradient-to-tr from-[#f4f4f4] via-white to-[#eaf6ee]`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-[#003f5c] font-display">{investment.name}</CardTitle>
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm mt-1
                            ${cat.bg} ${cat.text} font-display`}
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
                              className="hover:bg-[#f8961e]/20 hover:text-[#f8961e]"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-[#f4f4f4] rounded-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-[#003f5c] font-display">Editar Investimento</DialogTitle>
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
                          className="hover:bg-[#d62828]/20"
                        >
                          <Trash2 className="w-4 h-4 text-[#d62828]" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#2b2b2b]">Valor Investido</span>
                      <span className="font-bold text-[#003f5c]">
                        R$ {investment.amount.toLocaleString("pt-BR", {minimumFractionDigits: 2})}
                      </span>
                    </div>
                    {investment.expected_return && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#2b2b2b]">Retorno Esperado</span>
                        <div className="flex items-center gap-1">
                          {investment.expected_return > 0 ? (
                            <TrendingUp className="w-4 h-4 text-[#2f9e44]" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-[#d62828]" />
                          )}
                          <span className={`font-bold ${
                            investment.expected_return > 0 ? 'text-[#2f9e44]' : 'text-[#d62828]'
                          }`}>
                            {investment.expected_return}%
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-[#2b2b2b]">Data da Compra</span>
                      <span className="text-sm text-[#2b2b2b] font-mono">
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

      {/* Dicas & Alertas removidos daqui */}
    </div>
  );
}
