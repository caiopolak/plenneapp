
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Download, Import } from "lucide-react";
import { ImportTransactionsCSV } from "./ImportTransactionsCSV";

export function TransactionActionButtons({
  onExport,
  onImportSuccess,
  showForm,
  setShowForm,
  onCreateClick
}: {
  onExport: () => void;
  onImportSuccess: () => void;
  showForm: boolean;
  setShowForm: (b: boolean) => void;
  onCreateClick: () => void;
}) {
  // Cor do card de investimentos: from-blue-500 to-blue-600 (~bg-gradient-to-r from-blue-500 to-blue-600 text-white)
  const buttonGradient = "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700";

  return (
    <div className="flex gap-2 flex-wrap w-full">
      <Button
        variant="outline"
        size="sm"
        className="font-display flex gap-2 border border-[--primary]/20 shadow min-w-[170px] w-full sm:w-auto"
        onClick={onExport}
      >
        <Download className="w-4 h-4" />
        Exportar CSV
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="font-display flex gap-2 border border-[--primary]/20 shadow min-w-[170px] w-full sm:w-auto"
          >
            <Import className="w-4 h-4" />
            Importar CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar transações em lote</DialogTitle>
          </DialogHeader>
          <ImportTransactionsCSV onSuccess={onImportSuccess} />
        </DialogContent>
      </Dialog>
      <Button
        size="sm"
        className={`${buttonGradient} font-display flex gap-2 min-w-[170px] w-full sm:w-auto`}
        onClick={onCreateClick}
      >
        <Plus className="w-4 h-4 mr-2" />
        Nova Transação
      </Button>
    </div>
  );
}
