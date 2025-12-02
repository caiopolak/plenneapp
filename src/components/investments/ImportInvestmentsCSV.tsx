import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Import } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DataImportExportModal } from "@/components/data/DataImportExportModal";
import { parseCSV, importData, investmentMappings, InvestmentImport } from "@/utils/dataImport";
import { exportInvestments, InvestmentExport } from "@/utils/dataExport";

interface ImportInvestmentsCSVProps {
  onSuccess: () => void;
  investments?: InvestmentExport[];
}

const templateColumns = [
  'Nome',
  'Tipo',
  'Valor',
  'Retorno Esperado',
  'Data Compra'
];

const exampleData = [
  'Tesouro Selic 2029',
  'Títulos',
  '5000',
  '12.5',
  '15/01/2024'
];

export function ImportInvestmentsCSV({ onSuccess, investments = [] }: ImportInvestmentsCSVProps) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();
  const { toast } = useToast();

  const handleImport = async (file: File): Promise<{ success: boolean; message: string; errors?: string[] }> => {
    if (!user || !workspace) {
      return { success: false, message: 'Usuário ou workspace não encontrado' };
    }

    try {
      const text = await file.text();
      const csvData = parseCSV(text);

      if (csvData.length === 0) {
        return { success: false, message: 'Arquivo vazio ou formato inválido' };
      }

      const result = importData<InvestmentImport>(csvData, investmentMappings);

      if (result.validRows === 0) {
        return {
          success: false,
          message: 'Nenhuma linha válida encontrada',
          errors: result.errors
        };
      }

      // Registrar importação
      await supabase.from("data_imports").insert([{
        type: "investments",
        user_id: user.id,
        workspace_id: workspace.id,
        filename: file.name,
        status: "completed"
      }]);

      // Inserir investimentos
      const batchSize = 50;
      let inserted = 0;

      for (let i = 0; i < result.data.length; i += batchSize) {
        const batch = result.data.slice(i, i + batchSize);
        const rows = batch.map(inv => ({
          user_id: user.id,
          workspace_id: workspace.id,
          name: inv.name,
          type: inv.type,
          amount: inv.amount,
          expected_return: inv.expected_return || null,
          purchase_date: inv.purchase_date || null
        }));

        const { error } = await supabase.from("investments").insert(rows);
        if (error) throw error;
        inserted += batch.length;
      }

      onSuccess();

      return {
        success: true,
        message: `${inserted} investimentos importados com sucesso!`,
        errors: result.errors.length > 0 ? result.errors : undefined
      };

    } catch (error: any) {
      return { success: false, message: error.message || 'Erro ao processar arquivo' };
    }
  };

  const handleExport = () => {
    if (investments.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Sem dados',
        description: 'Não há investimentos para exportar'
      });
      return;
    }
    exportInvestments(investments);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className="gap-2"
      >
        <Import className="h-4 w-4" />
        Importar/Exportar
      </Button>

      <DataImportExportModal
        open={showModal}
        onOpenChange={setShowModal}
        type="investments"
        onImport={handleImport}
        onExport={handleExport}
        templateColumns={templateColumns}
        exampleData={exampleData}
      />
    </>
  );
}
