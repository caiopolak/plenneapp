import React from "react";
import { EnhancedSmartAlerts } from "@/components/alerts/EnhancedSmartAlerts";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";

export default function AlertsPage() {
  const { isPremium } = usePlanAccess();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight brand-gradient-text">
            Central de Alertas Financeiros
          </h1>
          {!isPremium && (
            <Badge variant="outline" className="border-primary/50 text-primary">
              <Crown className="w-3 h-3 mr-1" />
              PRO
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {isPremium 
            ? "Acompanhe alertas importantes, dicas personalizadas e insights sobre sua situação financeira"
            : "Faça upgrade para receber alertas automáticos sobre orçamentos, metas e gastos excessivos"
          }
        </p>
      </div>
      <EnhancedSmartAlerts />
    </div>
  );
}