import React from "react";
import { EnhancedSmartAlerts } from "@/components/alerts/EnhancedSmartAlerts";

export default function AlertsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2 brand-gradient-text">
          Central de Alertas Financeiros
        </h1>
        <p className="text-muted-foreground">
          Acompanhe alertas importantes, dicas personalizadas e insights sobre sua situação financeira
        </p>
      </div>
      <EnhancedSmartAlerts />
    </div>
  );
}