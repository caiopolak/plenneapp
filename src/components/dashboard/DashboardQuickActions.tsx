
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Star, TrendingUp, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * DashboardQuickActions - Atalhos rápidos do dashboard.
 * Botões que abrem modais ou toasts simulando ações.
 */
export function DashboardQuickActions() {
  // Funções para cada ação rápida
  const handleNewTransaction = () => {
    toast({
      title: "Nova Transação",
      description: "Em breve você poderá cadastrar uma transação aqui!",
      duration: 2500,
    });
  };

  const handleNewGoal = () => {
    toast({
      title: "Nova Meta",
      description: "Em breve será possível cadastrar uma nova meta!",
      duration: 2500,
    });
  };

  const handleNewInvestment = () => {
    toast({
      title: "Novo Investimento",
      description: "Funcionalidade chegando em breve!",
      duration: 2500,
    });
  };

  const handleEducation = () => {
    toast({
      title: "Educação Financeira",
      description: "Explore a seção Educação Financeira no menu lateral.",
      duration: 2500,
    });
    // Aqui pode navegar para a aba de educação se desejado
  };

  return (
    <section 
      className="rounded-xl bg-surface/80 shadow-card p-4 sm:p-6 flex flex-col gap-3 w-full max-w-[370px] mx-auto border border-primary/5"
      aria-label="Ações rápidas"
    >
      <h2 className="text-lg font-display font-bold text-primary mb-2">Ações rápidas</h2>
      <div className="flex flex-col gap-3">
        <Button
          variant="default"
          className="w-full flex items-center justify-start gap-2 bg-primary hover:bg-secondary transition-colors rounded-lg font-bold"
          onClick={handleNewTransaction}
        >
          <Plus className="w-5 h-5" />
          Nova Transação
        </Button>
        <Button
          variant="secondary"
          className="w-full flex items-center justify-start gap-2 transition-colors rounded-lg font-bold"
          onClick={handleNewGoal}
        >
          <Star className="w-5 h-5" />
          Nova Meta
        </Button>
        <Button
          variant="outline"
          className="w-full flex items-center justify-start gap-2 border-secondary text-secondary hover:bg-secondary/10 font-bold rounded-lg"
          onClick={handleNewInvestment}
        >
          <TrendingUp className="w-5 h-5" />
          Novo Investimento
        </Button>
        <Button
          variant="link"
          className="w-full flex items-center justify-start gap-2 text-[--electric] hover:bg-blue-50 font-bold rounded-lg"
          onClick={handleEducation}
        >
          <BookOpen className="w-5 h-5" />
          Educação Financeira
        </Button>
      </div>
    </section>
  );
}
