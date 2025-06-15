import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Trash2, Plus, Download, Import } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { InvestmentForm } from './InvestmentForm';
import { Tables } from '@/integrations/supabase/types';
import { exportInvestmentsCsv } from './utils/exportInvestmentsCsv';
import { ImportTransactionsCSV } from "@/components/transactions/ImportTransactionsCSV";

type Investment = Tables<'investments'>;

export function InvestmentList() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [showInvestForm, setShowInvestForm] = useState(false);

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

  useEffect(() => {
    let filtered = investments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(i => i.type === filterType);
    }

    setFilteredInvestments(filtered);
  }, [investments, searchTerm, filterType]);

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

  if (loading) {
    return <div>Carregando investimentos...</div>;
  }

  // Insert calculations locally since utils file is missing
  function calculateTotalInvested(investments: Investment[]) {
    return investments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  }
  function calculateTotalCurrentValue(investments: Investment[]) {
    // There is no "current_amount" in your schema:
    // If you add this field, re-enable this logic; for now, just use the invested value as a placeholder.
    return investments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  }

  return (
    <div className="space-y-6">
      {/* Toolbar / Botões / Top Actions Block */}
      <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
        <h2 className="text-2xl font-bold font-display text-[--primary]">Investimentos</h2>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            className="font-display flex gap-2 bg-white border border-[--primary]/20 text-[--primary] hover:bg-[--secondary]/10 shadow min-w-[170px]"
            onClick={() => exportInvestmentsCsv(filteredInvestments)}
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="font-display flex gap-2 bg-white border border-[--primary]/20 text-[--primary] hover:bg-[--secondary]/10 shadow min-w-[170px]"
              >
                <Import className="w-4 h-4" />
                Importar CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Importar investimentos em lote</DialogTitle>
              </DialogHeader>
              {/* (Reaproveitando componente de transações por simplicidade, você pode criar um específico depois) */}
              <ImportTransactionsCSV onSuccess={fetchInvestments} />
            </DialogContent>
          </Dialog>
          <Dialog open={showInvestForm} onOpenChange={setShowInvestForm}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-[#003f5c] to-[#2f9e44] text-white font-bold shadow-xl hover:from-[#2f9e44] hover:to-[#003f5c] hover:scale-105 transition flex gap-2 min-w-[190px]">
                <Plus className="w-4 h-4" />
                Novo Investimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Investimento</DialogTitle>
              </DialogHeader>
              <InvestmentForm 
                onSuccess={() => {
                  setShowInvestForm(false);
                  fetchInvestments();
                }}
                onCancel={() => setShowInvestForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white border-[--primary]/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="font-display text-[--primary]">Filtros</CardTitle>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar investimentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full font-text"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40 font-text border-[--primary]/30">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="stock">Ações</SelectItem>
                <SelectItem value="reit">Fundos Imobiliários</SelectItem>
                <SelectItem value="fixed_income">Renda Fixa</SelectItem>
                <SelectItem value="crypto">Criptomoedas</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredInvestments.length === 0 ? (
            <div className="text-center py-8 font-text text-[--primary]">
              <p className="text-muted-foreground">Nenhum investimento encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredInvestments.map((investment) => (
                <div
                  key={investment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-[#eaf6ee] bg-white"
                >
                  <div className="flex-1">
                    <div className="font-text">
                      <span className="font-medium">{investment.name}</span>
                      <span className="text-muted-foreground ml-2">
                        - {investment.type}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground font-text">
                      {format(new Date(investment.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Display Investment Values */}
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground font-text">Valor Investido</div>
                      <div className="font-bold text-[--secondary] font-display">
                        R$ {Number(investment.amount).toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground font-text">Valor Atual</div>
                      <div className="font-bold text-[--primary] font-display">
                        R$ {Number(investment.amount).toFixed(2).replace('.', ',')}
                      </div>
                    </div>

                    {/* Dialogs for editing */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[--primary] font-display"
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
                      className="text-[--error]"
                      onClick={() => deleteInvestment(investment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white shadow-card border border-[--primary]/10">
          <CardContent className="p-4">
            <div className="text-sm text-[--primary] font-text">Total Investido</div>
            <div className="text-2xl font-bold text-[--secondary] font-display">
              R$ {calculateTotalInvested(investments).toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-card border border-[--primary]/10">
          <CardContent className="p-4">
            <div className="text-sm text-[--primary] font-text">Valor Total Atual</div>
            <div className="text-2xl font-bold text-[--primary] font-display">
              R$ {calculateTotalCurrentValue(investments).toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
