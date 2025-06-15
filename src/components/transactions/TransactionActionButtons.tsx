
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
}: {
  onExport: () => void;
  onImportSuccess: () => void;
  showForm: boolean;
  setShowForm: (b: boolean) => void;
}) {
  // Gradiente igual ao card de Retorno Médio Esperado em investimentos:
  const buttonGradient = "bg-gradient-to-tr from-[#003f5c]/80 to-[#2f9e44]/40 text-white hover:from-[#003f5c] hover:to-[#2f9e44] hover:text-white active:bg-[#003f5c] focus:bg-[#2f9e44]";

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
        <DialogContent
          className="max-w-md w-full p-2 sm:p-4"
        >
          <DialogHeader>
            <DialogTitle>Importar transações em lote</DialogTitle>
          </DialogHeader>
          <ImportTransactionsCSV onSuccess={onImportSuccess} />
        </DialogContent>
      </Dialog>
      <Button
        size="sm"
        className={`${buttonGradient} font-display flex gap-2 min-w-[170px] w-full sm:w-auto transition-none`}
        onClick={() => setShowForm(true)}
        style={{ transition: "none" }}
      >
        <Plus className="w-4 h-4 mr-2" />
        Nova Transação
      </Button>
    </div>
  );
}

