import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ImportInvestmentsCSV } from "./ImportInvestmentsCSV";
import { InvestmentExport } from "@/utils/dataExport";

interface InvestmentActionButtonsProps {
  investments: any[];
  onImportSuccess: () => void;
  onCreateClick: () => void;
  showForm: boolean;
  setShowForm: (b: boolean) => void;
}

export function InvestmentActionButtons({ 
  investments, 
  onImportSuccess, 
  onCreateClick, 
  showForm, 
  setShowForm 
}: InvestmentActionButtonsProps) {
  const buttonGradient =
    "bg-gradient-to-tr from-primary/80 to-accent/60 text-primary-foreground hover:from-primary hover:to-accent";

  // Mapear para o formato de exportação
  const investmentsForExport: InvestmentExport[] = investments.map(inv => ({
    name: inv.name,
    type: inv.type,
    amount: inv.amount,
    expected_return: inv.expected_return || inv.return || null,
    purchase_date: inv.purchase_date || null,
  }));

  return (
    <div className="flex gap-2 flex-wrap w-full sm:w-auto">
      <ImportInvestmentsCSV 
        onSuccess={onImportSuccess} 
        investments={investmentsForExport}
      />
      <Button
        size="sm"
        className={`${buttonGradient} font-display flex gap-2 flex-1 sm:flex-none min-h-[44px] sm:min-h-[36px]`}
        onClick={() => setShowForm(true)}
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Novo Investimento</span>
        <span className="sm:hidden">Novo</span>
      </Button>
    </div>
  );
}
