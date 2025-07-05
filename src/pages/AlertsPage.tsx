import React from "react";
import { SmartAlerts } from "@/components/education/SmartAlerts";

export default function AlertsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2 brand-gradient-text">Alertas Financeiros</h1>
        <p className="text-muted-foreground">
          Acompanhe alertas importantes sobre sua situação financeira
        </p>
      </div>
      <SmartAlerts />
    </div>
  );
}