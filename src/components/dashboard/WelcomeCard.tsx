import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Target, Wallet } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WelcomeCardProps {
  name: string | undefined;
  plan: string | undefined;
  balance?: number;
  goalsCount?: number;
  savingsRate?: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function WelcomeCard({ name, plan, balance = 0, goalsCount = 0, savingsRate = 0 }: WelcomeCardProps) {
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const capitalizedDate = today.charAt(0).toUpperCase() + today.slice(1);

  const planColors: Record<string, string> = {
    free: "bg-muted text-muted-foreground",
    pro: "bg-primary text-primary-foreground",
    business: "bg-accent text-accent-foreground",
  };

  const planClass = planColors[(plan || "free").toLowerCase()] || planColors.free;

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-card to-accent/5 border border-border shadow-lg animate-fade-in relative overflow-hidden">
      <CardContent className="py-6 px-6 md:px-8">
        {/* Header com saudação e data */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              Olá, <span className="text-primary">{name || "Usuário"}</span>!
            </h2>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{capitalizedDate}</span>
            </div>
          </div>
          <Badge className={`${planClass} text-xs font-bold rounded-full uppercase shadow-sm px-3 py-1`}>
            Plano {plan || "FREE"}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo Atual</p>
              <p className={`text-sm font-bold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50">
            <div className="p-2 rounded-lg bg-accent/10">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Metas Ativas</p>
              <p className="text-sm font-bold text-foreground">{goalsCount} metas</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50">
            <div className="p-2 rounded-lg bg-secondary/10">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Taxa de Economia</p>
              <p className="text-sm font-bold text-foreground">{savingsRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Decorative elements */}
      <div className="absolute right-[-40px] top-[-40px] w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-[-20px] bottom-[-20px] w-24 h-24 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
    </Card>
  );
}