
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { InvestmentForm } from "./InvestmentForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  expected_return: number;
  purchase_date: string;
}

interface InvestmentCardProps {
  investment: Investment;
  cat: { label: string; bg: string; text: string };
  editingInvestment: Investment | null;
  setEditingInvestment: (inv: Investment | null) => void;
  deleteInvestment: (id: string) => void;
  fetchInvestments: () => void;
}

export function InvestmentCard({
  investment,
  cat,
  editingInvestment,
  setEditingInvestment,
  deleteInvestment,
  fetchInvestments
}: InvestmentCardProps) {
  return (
    <Card
      key={investment.id}
      className="group border border-border hover:ring-2 hover:ring-primary/30 transition-all shadow-card bg-card card-hover"
    >
      <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg text-foreground font-display truncate">
              {investment.name}
            </CardTitle>
            <div
              className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-sm mt-1.5
                ${cat.bg} ${cat.text} font-display`}
            >
              {cat.label}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Dialog open={!!editingInvestment && editingInvestment.id === investment.id} onOpenChange={(open) => !open && setEditingInvestment(null)}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Editar investimento"
                  onClick={() => setEditingInvestment(investment)}
                  className="hover:bg-accent/20 hover:text-accent min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-card rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-foreground font-display">Editar Investimento</DialogTitle>
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
              className="hover:bg-destructive/20 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-muted-foreground">Valor Investido</span>
          <span className="font-bold text-foreground text-sm sm:text-base">
            R$ {investment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        {investment.expected_return && (
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-muted-foreground">Retorno Esperado</span>
            <div className="flex items-center gap-1">
              {investment.expected_return > 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
              )}
              <span className={`font-bold text-sm sm:text-base ${investment.expected_return > 0 ? 'text-secondary' : 'text-destructive'}`}>
                {investment.expected_return}%
              </span>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-muted-foreground">Data da Compra</span>
          <span className="text-xs sm:text-sm text-muted-foreground font-mono">
            {format(new Date(investment.purchase_date), "dd/MM/yyyy", { locale: ptBR })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
