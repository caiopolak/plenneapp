
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Crown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { UnifiedTransactionForm } from '../UnifiedTransactionForm';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
  const { limits } = useSubscriptionLimits();
  const { toast } = useToast();

  const canUseScheduling = limits?.plan !== 'free';

  const handleOpenAgendamento = () => {
    if (!canUseScheduling) {
      toast({
        title: "Recurso Premium",
        description: "Agendamento de transações está disponível apenas nos planos Pro e Business.",
        action: <Badge variant="secondary" className="ml-2"><Crown className="w-3 h-3 mr-1" />Upgrade</Badge>
      });
      return;
    }
    setShowAgendamento(true);
  };

  return (
    <div className="space-y-4">
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
        
        {!isEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenAgendamento}
            className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white h-12"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {isMobile ? "Agendar" : "Agendar para Depois"}
            {!canUseScheduling && <Crown className="w-4 h-4 ml-2" />}
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

      <Dialog open={showAgendamento} onOpenChange={setShowAgendamento}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle>Agendar Transação</DialogTitle>
          </DialogHeader>
          <UnifiedTransactionForm 
            onSuccess={() => setShowAgendamento(false)} 
            onCancel={() => setShowAgendamento(false)}
            initialMode="scheduled"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
