
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TransactionFormActionsProps {
  loading: boolean;
  isMobile: boolean;
  onCancel?: () => void;
  isEdit: boolean;
}

export function TransactionFormActions({
  loading, isMobile, onCancel, isEdit
}: TransactionFormActionsProps) {
  return (
    <div className={cn(
      "flex flex-col-reverse sm:flex-row gap-2 pt-4",
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
      <Button
        type="submit"
        disabled={loading}
        className={cn("flex-1 h-12", isMobile && "text-base")}
      >
        {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Adicionar')}
      </Button>
    </div>
  );
}
