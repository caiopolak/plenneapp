
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, Calendar } from 'lucide-react';
import { cn } from "@/lib/utils";
import { TransactionPendingForm } from '../TransactionPendingForm';

interface TransactionFormActionsProps {
  loading: boolean;
  isMobile: boolean;
  onCancel?: () => void;
  isEdit: boolean;
  formData?: {
    type: string;
    amount: string;
    category: string;
    description: string;
  };
}

export function TransactionFormActions({
  loading, isMobile, onCancel, isEdit, formData
}: TransactionFormActionsProps) {
  const [showAgendamento, setShowAgendamento] = useState(false);

  return (
    <div className="space-y-4">
      {/* Botões de ação do formulário */}
      <div className={cn(
        "flex flex-col sm:flex-row gap-3 pt-4",
        isMobile && "space-y-2 sm:space-y-0"
      )}>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className={cn("h-12", isMobile && "text-base")}
          >
            Cancelar
          </Button>
        )}
        
        {/* Botão para agendar (apenas se não for edição) */}
        {!isEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAgendamento(true)}
            className="border-[#f8961e] text-[#f8961e] hover:bg-[#f8961e] hover:text-white h-12"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {isMobile ? "Agendar" : "Agendar para Depois"}
          </Button>
        )}
        
        <Button
          type="submit"
          disabled={loading}
          className={cn("flex-1 h-12", isMobile && "text-base")}
        >
          {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Adicionar')}
        </Button>
      </div>

      {/* Modal de agendamento */}
      <Dialog open={showAgendamento} onOpenChange={setShowAgendamento}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agendar Transação</DialogTitle>
          </DialogHeader>
          <TransactionPendingForm 
            initialData={formData}
            onSuccess={() => setShowAgendamento(false)} 
            onCancel={() => setShowAgendamento(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
