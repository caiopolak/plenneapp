import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { InvestmentStatistics } from "./InvestmentStatistics";
import { InvestmentEvolutionChart } from "./InvestmentEvolutionChart";
import { 
  TrendingUp, TrendingDown, Calendar, BarChart3, 
  PieChart, Eye, DollarSign, Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  expected_return: number | null;
  purchase_date: string | null;
}

interface InvestmentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment: Investment | null;
  allInvestments: Investment[];
  onEdit?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  stocks: "Ações",
  bonds: "Títulos",
  crypto: "Criptomoedas",
  real_estate: "Imóveis",
  funds: "Fundos",
  savings: "Poupança",
};

const TYPE_ICONS: Record<string, string> = {
  stocks: "📈",
  bonds: "📜",
  crypto: "₿",
  real_estate: "🏠",
  funds: "💼",
  savings: "🏦",
};

export function InvestmentDetailsModal({ 
  open, 
  onOpenChange, 
  investment,
  allInvestments,
  onEdit
}: InvestmentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!investment) return null;

  const expectedReturn = investment.expected_return || 0;
  const isPositive = expectedReturn >= 0;
  const totalPortfolio = allInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const portfolioShare = totalPortfolio > 0 ? (investment.amount / totalPortfolio) * 100 : 0;

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                <span className="text-2xl">{TYPE_ICONS[investment.type] || "💰"}</span>
                <span className="truncate">{investment.name}</span>
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary" className="gap-1">
                  {TYPE_LABELS[investment.type] || investment.type}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "gap-1",
                    isPositive ? "border-secondary/50 text-secondary" : "border-destructive/50 text-destructive"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {expectedReturn > 0 ? "+" : ""}{expectedReturn}%
                </Badge>
                {investment.purchase_date && (
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(investment.purchase_date), "dd/MM/yyyy", { locale: ptBR })}
                  </Badge>
                )}
              </div>
            </div>
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Main Value Card */}
        <div className={cn(
          "p-4 rounded-xl border mb-4",
          isPositive 
            ? "bg-gradient-to-r from-secondary/20 to-emerald-500/20 border-secondary/30"
            : "bg-gradient-to-r from-primary/10 to-amber-500/10 border-primary/20"
        )}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Valor Investido</span>
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(investment.amount)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Retorno Esperado</div>
              <div className={cn(
                "font-bold text-lg",
                isPositive ? "text-secondary" : "text-destructive"
              )}>
                {expectedReturn > 0 ? "+" : ""}{expectedReturn}% a.a.
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">% do Portfólio</div>
              <div className="font-bold text-primary text-lg">{portfolioShare.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Ganho Projetado</div>
              <div className={cn(
                "font-bold text-lg",
                isPositive ? "text-secondary" : "text-destructive"
              )}>
                {formatCurrency(investment.amount * expectedReturn / 100)}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="evolution" className="gap-1.5 text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Evolução</span>
              <span className="sm:hidden">Evol.</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Análises</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 pr-1">
            {/* Overview Tab */}
            <TabsContent value="overview" className="m-0 space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground">Tipo de Ativo</div>
                  <div className="font-semibold text-foreground mt-0.5 flex items-center gap-2">
                    <span className="text-lg">{TYPE_ICONS[investment.type] || "💰"}</span>
                    {TYPE_LABELS[investment.type] || investment.type}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground">Data de Aquisição</div>
                  <div className="font-semibold text-foreground mt-0.5">
                    {investment.purchase_date 
                      ? format(new Date(investment.purchase_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : "Não informada"
                    }
                  </div>
                </div>
              </div>

              {/* Investment Comparison */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" />
                  Comparação no Portfólio
                </h4>
                <div className="space-y-2">
                  {allInvestments
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 5)
                    .map((inv, i) => {
                      const share = totalPortfolio > 0 ? (inv.amount / totalPortfolio) * 100 : 0;
                      const isCurrentInvestment = inv.id === investment.id;
                      return (
                        <div 
                          key={inv.id} 
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg transition-colors",
                            isCurrentInvestment && "bg-primary/10 ring-1 ring-primary/20"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{TYPE_ICONS[inv.type] || "💰"}</span>
                            <span className={cn(
                              "text-sm truncate max-w-[120px]",
                              isCurrentInvestment ? "font-semibold text-foreground" : "text-muted-foreground"
                            )}>
                              {inv.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className={cn(
                              "text-sm font-medium",
                              isCurrentInvestment ? "text-primary" : "text-muted-foreground"
                            )}>
                              {share.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </TabsContent>

            {/* Evolution Tab */}
            <TabsContent value="evolution" className="m-0 space-y-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Evolução do Patrimônio
                </h4>
                <InvestmentEvolutionChart investments={allInvestments} />
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="m-0">
              <InvestmentStatistics
                investment={investment}
                allInvestments={allInvestments}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
