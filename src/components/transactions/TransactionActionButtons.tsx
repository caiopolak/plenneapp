import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ImportTransactionsCSV } from "./ImportTransactionsCSV";
import { TransactionExport } from "@/utils/dataExport";

interface TransactionActionButtonsProps {
  onImportSuccess: () => void;
  showForm: boolean;
  setShowForm: (b: boolean) => void;
  transactions?: TransactionExport[];
}

export function TransactionActionButtons({
  onImportSuccess,
  showForm,
  setShowForm,
  transactions = [],
}: TransactionActionButtonsProps) {
  const buttonGradient = "bg-gradient-to-tr from-[#003f5c]/80 to-[#2f9e44]/40 text-white hover:from-[#003f5c] hover:to-[#2f9e44] hover:text-white";

  return (
    <div className="flex gap-2 flex-wrap w-full">
      <ImportTransactionsCSV 
        onSuccess={onImportSuccess} 
        transactions={transactions}
      />
      <Button
        size="sm"
        className={`${buttonGradient} font-display flex gap-2 min-w-[170px] w-full sm:w-auto`}
        onClick={() => setShowForm(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Nova Transação
      </Button>
    </div>
  );
}
