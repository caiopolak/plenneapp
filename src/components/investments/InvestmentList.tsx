import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { InvestmentForm } from './InvestmentForm';
import { InvestmentCardEnhanced } from "./InvestmentCardEnhanced";
import { InvestmentDetailsModal } from "./InvestmentDetailsModal";
import { InvestmentsAnalyticsCards } from "./InvestmentsAnalyticsCards";
import { InvestmentProfitabilityAnalysis } from "./InvestmentProfitabilityAnalysis";
import { InvestmentEvolutionChart } from "./InvestmentEvolutionChart";
import { InvestmentInsights } from "./InvestmentInsights";
import { CompactInvestmentFilters, InvestmentFilters } from "./CompactInvestmentFilters";
import { InvestmentCardSkeleton, AnalyticsCardSkeleton } from "@/components/ui/loading-skeletons";
import { usePaginatedLoad } from "@/hooks/useLazyLoad";

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  expected_return: number | null;
  purchase_date: string | null;
}

const defaultFilters: InvestmentFilters = {
  searchTerm: '',
  type: 'all',
};

export function InvestmentList() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<InvestmentFilters>(defaultFilters);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const { current } = useWorkspace();

  const fetchInvestments = async () => {
    if (!user || !current?.id) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', current.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error: unknown) {
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
  }, [user, current?.id]);

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
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao excluir investimento"
      });
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      stocks: 'Ações',
      bonds: 'Títulos',
      crypto: 'Criptomoedas',
      real_estate: 'Imóveis',
      funds: 'Fundos',
      savings: 'Poupança'
    };
    return types[type] || type;
  };

  // Filtrar investimentos
  const filteredInvestments = useMemo(() => {
    return investments.filter(inv => {
      const matchesSearch = !filters.searchTerm || 
        inv.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesType = filters.type === 'all' || inv.type === filters.type;
      return matchesSearch && matchesType;
    });
  }, [investments, filters]);

  const totalInvested = filteredInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const averageReturn = filteredInvestments.length > 0 
    ? filteredInvestments.reduce((sum, inv) => sum + (inv.expected_return || 0), 0) / filteredInvestments.length 
    : 0;

  const resetFilters = () => setFilters(defaultFilters);

  const activeFilterTags = useMemo(() => {
    const tags: { label: string; key: keyof InvestmentFilters; value: string }[] = [];
    if (filters.type !== 'all') {
      tags.push({ label: `Tipo: ${getTypeLabel(filters.type)}`, key: 'type', value: 'all' });
    }
    return tags;
  }, [filters]);

  const removeFilterTag = (key: keyof InvestmentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Lazy loading
  const {
    displayedItems: displayedInvestments,
    hasMore,
    loadMoreRef,
  } = usePaginatedLoad({
    items: filteredInvestments,
    pageSize: 6,
    initialLoad: 6,
  });

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnalyticsCardSkeleton />
          <AnalyticsCardSkeleton />
          <AnalyticsCardSkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <InvestmentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const handleOpenDetails = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowDetailsModal(true);
  };

  const handleEditFromDetails = () => {
    setShowDetailsModal(false);
    if (selectedInvestment) {
      setEditingInvestment(selectedInvestment);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Modal de Detalhes */}
      <InvestmentDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        investment={selectedInvestment}
        allInvestments={filteredInvestments}
        onEdit={handleEditFromDetails}
      />

      {/* Modal/dialog de Novo Investimento */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent
          className="max-w-xl w-full rounded-2xl p-4 md:p-6 bg-card text-foreground"
          style={{
            maxWidth: "96vw",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">Novo Investimento</DialogTitle>
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

      {/* Modal de Edição */}
      <Dialog open={!!editingInvestment} onOpenChange={(open) => !open && setEditingInvestment(null)}>
        <DialogContent className="max-w-2xl bg-card rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display">Editar Investimento</DialogTitle>
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

      {/* Header com filtros compactos */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text">
            Investimentos
          </h1>
          <p className="text-muted-foreground text-sm">
            Acompanhe cada ativo, analise a rentabilidade e tome decisões informadas.
          </p>
        </div>
        <CompactInvestmentFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
          investments={investments}
          onImportSuccess={fetchInvestments}
          onNewInvestment={() => setShowForm(true)}
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

      {/* Insights inteligentes */}
      <InvestmentInsights investments={filteredInvestments} />

      {/* Cards de resumo */}
      <InvestmentsAnalyticsCards
        totalInvested={totalInvested}
        totalInvestments={filteredInvestments.length}
        averageReturn={averageReturn}
      />

      {/* Gráfico de Evolução Patrimonial */}
      {filteredInvestments.length > 0 && (
        <InvestmentEvolutionChart investments={filteredInvestments} />
      )}

      {/* Análise de Rentabilidade - Colapsável */}
      {filteredInvestments.length > 0 && (
        <Collapsible open={showAnalytics} onOpenChange={setShowAnalytics}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <h2 className="text-lg font-bold text-foreground font-display">Análise de Rentabilidade</h2>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${showAnalytics ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <InvestmentProfitabilityAnalysis investments={filteredInvestments} />
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Lista de investimentos */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground font-display">Meus Investimentos</h2>
        {filteredInvestments.length === 0 ? (
          <Card className="bg-card border border-border shadow-card">
            <CardContent className="p-8 text-center">
              {investments.length === 0 ? (
                <>
                  <p className="text-lg font-bold text-foreground font-display">Hora de fazer seu dinheiro trabalhar! 📈</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Cadastre seus investimentos para ter uma visão completa do seu patrimônio.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-foreground font-display">Nenhum resultado encontrado</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tente ajustar os filtros para ver mais investimentos.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedInvestments.map((investment, index) => (
                <InvestmentCardEnhanced
                  key={investment.id}
                  investment={investment}
                  index={index}
                  totalPortfolio={totalInvested}
                  onDetails={() => handleOpenDetails(investment)}
                  onEdit={() => setEditingInvestment(investment)}
                  onDelete={() => deleteInvestment(investment.id)}
                />
              ))}
            </div>
            
            {/* Load More Trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                  <InvestmentCardSkeleton />
                  <InvestmentCardSkeleton />
                  <InvestmentCardSkeleton />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
