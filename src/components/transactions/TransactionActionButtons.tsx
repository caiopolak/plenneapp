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
  return (
    <div className="flex gap-2 flex-wrap w-full sm:w-auto">
      <ImportTransactionsCSV 
        onSuccess={onImportSuccess} 
        transactions={transactions}
      />
      <Button
        size="sm"
        variant="cta"
        className="font-display flex gap-2 flex-1 sm:flex-none min-h-[44px] sm:min-h-[36px]"
        onClick={() => setShowForm(true)}
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Nova Transação</span>
        <span className="sm:hidden">Nova</span>
      </Button>
    </div>
  );
}
