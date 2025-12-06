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
import { ImportGoalsCSV } from "../goals/ImportGoalsCSV";
import { InvestmentActionButtons } from "./InvestmentActionButtons";
import { InvestmentCard } from "./InvestmentCard";
import { InvestmentsAnalyticsCards } from "./InvestmentsAnalyticsCards";
import { InvestmentsHeaderActions } from "./InvestmentsHeaderActions";
import { InvestmentProfitabilityAnalysis } from "./InvestmentProfitabilityAnalysis";
import { InvestmentCardSkeleton, AnalyticsCardSkeleton } from "@/components/ui/loading-skeletons";
import { usePaginatedLoad } from "@/hooks/useLazyLoad";

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

  // Lazy loading para investimentos
  const {
    displayedItems: displayedInvestments,
    hasMore,
    loadMoreRef,
  } = usePaginatedLoad({
    items: investments,
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

  // Paleta visual harmonizada conforme identidade (ajuste para combinar com estética e eliminar laranja em destaques/alertas!)
  const getTypeStyles = (type: string) => {
    const map: any = {
      stocks:      { label: "Ações",       bg: "bg-primary",   text: "text-primary-foreground" },
      bonds:       { label: "Títulos",     bg: "bg-secondary",   text: "text-secondary-foreground" },
      crypto:      { label: "Criptomoedas",bg: "bg-accent/20",   text: "text-accent" },
      real_estate: { label: "Imóveis",     bg: "bg-card border border-border", text: "text-secondary" },
      funds:       { label: "Fundos",      bg: "bg-muted",   text: "text-foreground" },
      savings:     { label: "Poupança",    bg: "bg-card border border-secondary/40", text: "text-secondary" },
    };
    return map[type] || { label: type, bg: "bg-primary", text: "text-primary-foreground" };
  };

  // Cartões analíticos e informativos — novo gradiente/principal
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Modal/dialog de Novo Investimento */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent
          className="max-w-xl w-full rounded-2xl p-4 md:p-6"
          style={{
            maxWidth: "96vw",
            width: "100%",
            margin: "0 auto",
          }}
        >
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
      {/* Actions refatoradas */}
      <InvestmentsHeaderActions
        investments={investments}
        onImportSuccess={fetchInvestments}
        onCreateClick={() => setShowForm(true)}
        showForm={showForm}
        setShowForm={setShowForm}
      />

      {/* Cards informativos harmonizados */}
      <InvestmentsAnalyticsCards
        totalInvested={totalInvested}
        totalInvestments={investments.length}
        averageReturn={averageReturn}
      />

      {/* Análise de Rentabilidade */}
      {investments.length > 0 && (
        <InvestmentProfitabilityAnalysis investments={investments} />
      )}

      {/* Lista de investimentos */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-foreground font-display mb-2">Meus Investimentos</h2>
        {investments.length === 0 ? (
          <Card className="bg-card border border-border shadow-card">
            <CardContent className="p-8 text-center">
              <p className="text-foreground font-bold font-display">Nenhum investimento registrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Registre seus investimentos e acompanhe sua carteira financeira!
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedInvestments.map((investment, index) => (
                <div
                  key={investment.id}
                  className="animate-fade-in opacity-0 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <InvestmentCard
                    investment={investment}
                    cat={getTypeStyles(investment.type)}
                    editingInvestment={editingInvestment}
                    setEditingInvestment={setEditingInvestment}
                    deleteInvestment={deleteInvestment}
                    fetchInvestments={fetchInvestments}
                  />
                </div>
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
      {/* Dicas & Alertas removidos daqui */}
    </div>
  );
}
