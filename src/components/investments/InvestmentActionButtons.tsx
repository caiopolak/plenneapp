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
    "bg-gradient-to-tr from-[#003f5c]/80 to-[#2f9e44]/40 text-white hover:from-[#003f5c] hover:to-[#2f9e44]";

  // Mapear para o formato de exportação
  const investmentsForExport: InvestmentExport[] = investments.map(inv => ({
    name: inv.name,
    type: inv.type,
    amount: inv.amount,
    expected_return: inv.expected_return || inv.return || null,
    purchase_date: inv.purchase_date || null,
  }));

  return (
    <div className="flex gap-2 flex-wrap w-full">
      <ImportInvestmentsCSV 
        onSuccess={onImportSuccess} 
        investments={investmentsForExport}
      />
      <Button
        size="sm"
        className={`${buttonGradient} font-display flex gap-2 min-w-[170px] w-full sm:w-auto`}
        onClick={() => setShowForm(true)}
      >
        <Plus className="w-4 h-4 mr-2" /> Novo Investimento
      </Button>
    </div>
  );
}
