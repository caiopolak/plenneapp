
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Download, Import } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportInvestmentsCsv } from "./utils/exportInvestmentsCsv";
import { ImportGoalsCSV } from "../goals/ImportGoalsCSV";

export function InvestmentActionButtons({ 
  investments, 
  onImportSuccess, 
  onCreateClick, 
  showForm, 
  setShowForm 
}: { 
  investments: any[]; 
  onImportSuccess: () => void; 
  onCreateClick: () => void;
  showForm: boolean;
  setShowForm: (b: boolean) => void;
}) {
  const { toast } = useToast();
  const buttonGradient = "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700";

  const handleExportCsv = () => {
    try {
      exportInvestmentsCsv(
        investments.map(inv => ({
          name: inv.name,
          type: inv.type,
          amount: inv.amount,
          expected_return: inv.expected_return || inv.return || 0,
          purchase_date: inv.purchase_date || "",
        }))
      );
      toast({
        title: "Exportação concluída",
        description: "Os investimentos foram exportados para CSV.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: "Não foi possível exportar os investimentos.",
      });
    }
  };

  return (
    <div className="flex gap-2 flex-wrap w-full">
      <Button
        variant="outline"
        onClick={handleExportCsv}
        size="sm"
        className="font-display flex gap-2 border border-[--primary]/20 shadow min-w-[170px] w-full sm:w-auto"
        aria-label="Exportar investimentos para CSV"
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
            aria-label="Importar investimentos de CSV"
          >
            <Import className="w-4 h-4" />
            Importar CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar investimentos em lote (CSV)</DialogTitle>
          </DialogHeader>
          <ImportGoalsCSV onSuccess={onImportSuccess} />
        </DialogContent>
      </Dialog>
      <Button
        size="sm"
        className={`${buttonGradient} font-display flex gap-2 min-w-[170px] w-full sm:w-auto`}
        onClick={onCreateClick}
      >
        <Plus className="w-4 h-4 mr-2" /> Novo Investimento
      </Button>
    </div>
  );
}
