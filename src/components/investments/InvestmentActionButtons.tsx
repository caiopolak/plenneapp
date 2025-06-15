
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit2, Trash2, Plus, TrendingUp, TrendingDown, Lightbulb, Import } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  const getTypeLabel = (type: string) => {
    const types = {
      stocks: 'Ações',
      bonds: 'Títulos',
      crypto: 'Criptomoedas',
      real_estate: 'Imóveis',
      funds: 'Fundos',
      savings: 'Poupança'
    };
    return types[type as keyof typeof types] || type;
  };

  const handleExportCsv = () => {
    try {
      exportInvestmentsCsv(
        investments.map(inv => ({
          name: inv.name,
          type: getTypeLabel(inv.type),
          amount: inv.amount,
          expected_return: inv.expected_return,
          purchase_date: inv.purchase_date
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
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={handleExportCsv}
        size="sm"
        className="font-display min-w-[170px] flex gap-2 bg-white border border-[--primary]/20 text-[--primary] hover:bg-[--secondary]/10 shadow"
        aria-label="Exportar investimentos para CSV"
      >
        <span className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Exportar CSV
        </span>
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="font-display min-w-[170px] flex gap-2 bg-white border border-[--primary]/20 text-[--primary] hover:bg-[--secondary]/10 shadow"
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
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogTrigger asChild>
          <Button size="lg" className="bg-gradient-to-r from-[#003f5c] to-[#2f9e44] text-white font-bold shadow-xl hover:from-[#2f9e44] hover:to-[#003f5c] hover:scale-105 transition">
            <Plus className="w-5 h-5 mr-2" /> Novo Investimento
          </Button>
        </DialogTrigger>
        {/* O formulário de investimento deve ser renderizado no componente pai */}
      </Dialog>
    </div>
  );
}
