
import React from "react";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UnifiedTransactionForm } from './UnifiedTransactionForm';

type Transaction = {
  id: string;
  type: string;
  amount: number;
  category: string;
  description?: string | null;
  date: string;
  is_recurring?: boolean;
};

type Props = {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  isEditing: boolean;
  setEditingTransaction: (t: Transaction | null) => void;
  onDelete: (id: string) => void;
  refresh: () => void;
};

export function TransactionRow({
  transaction,
  onEdit,
  isEditing,
  setEditingTransaction,
  onDelete,
  refresh
}: Props) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const transactionDate = new Date(transaction.date);
  const isFutureTransaction = transactionDate > today;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 bg-card gap-3 sm:gap-4 transition-colors ${
        isFutureTransaction ? 'border-amber-500/30 bg-amber-500/5' : ''
      }`}
    >
      {/* Info Section */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
          <Badge
            variant="default"
            className={`text-xs ${
              transaction.type === 'income'
                ? 'bg-secondary text-secondary-foreground font-display'
                : 'bg-destructive text-destructive-foreground font-display'
            }`}
          >
            {transaction.type === 'income' ? 'Receita' : 'Despesa'}
          </Badge>
          {transaction.is_recurring && (
            <Badge variant="outline" className="font-text text-xs text-primary border-primary/30 bg-muted">
              Recorrente
            </Badge>
          )}
          {isFutureTransaction && (
            <Badge variant="outline" className="font-text text-xs text-amber-500 border-amber-500/30 bg-amber-500/10">
              Agendada
            </Badge>
          )}
        </div>
        <div className="font-text truncate">
          <span className="font-medium text-foreground text-sm sm:text-base">{transaction.category}</span>
          {transaction.description && (
            <span className="text-muted-foreground ml-2 text-xs sm:text-sm">
              - {transaction.description}
            </span>
          )}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground font-text mt-0.5">
          {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
          {isFutureTransaction && (
            <span className="ml-2 text-amber-500">(não afeta o saldo atual)</span>
          )}
        </div>
      </div>

      {/* Value and Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
        <span className={`text-base sm:text-lg font-bold font-display ${
          transaction.type === 'income' ? 'text-secondary' : 'text-destructive'
        }`}>
          {transaction.type === 'income' ? '+' : '-'}R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
        
        <div className="flex gap-1">
          {/* Dialog editar */}
          <Dialog open={isEditing} onOpenChange={(open) => setEditingTransaction(open ? transaction : null)}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary font-display min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
                onClick={() => onEdit(transaction)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card text-foreground max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-foreground">Editar Transação</DialogTitle>
              </DialogHeader>
              {isEditing && (
                <UnifiedTransactionForm
                  transaction={transaction}
                  onSuccess={() => {
                    setEditingTransaction(null);
                    refresh();
                  }}
                  onCancel={() => setEditingTransaction(null)}
                />
              )}
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            onClick={() => onDelete(transaction.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
