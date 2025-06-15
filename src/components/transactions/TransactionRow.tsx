
import React from "react";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionForm } from './TransactionForm';

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
  return (
    <div
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-[#eaf6ee] bg-white"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Badge
            variant="default"
            className={
              transaction.type === 'income'
                ? 'bg-[--secondary] text-white font-display'
                : 'bg-[--error] text-white font-display'
            }
          >
            {transaction.type === 'income' ? 'Receita' : 'Despesa'}
          </Badge>
          {transaction.is_recurring && (
            <Badge variant="outline" className="font-text text-[--primary] border-[--primary]/30 bg-[#f4f4f4]">Recorrente</Badge>
          )}
        </div>
        <div className="mt-1 font-text">
          <span className="font-medium">{transaction.category}</span>
          {transaction.description && (
            <span className="text-muted-foreground ml-2">
              - {transaction.description}
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground font-text">
          {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-lg font-bold font-display ${
          transaction.type === 'income' ? 'text-[--secondary]' : 'text-[--error]'
        }`}>
          {transaction.type === 'income' ? '+' : '-'}R$ {Number(transaction.amount).toFixed(2).replace('.', ',')}
        </span>
        {/* Dialog editar */}
        <Dialog open={isEditing} onOpenChange={(open) => setEditingTransaction(open ? transaction : null)}>
          <DialogTrigger asChild>
            <Button
                variant="ghost"
                size="sm"
                className="text-[--primary] font-display"
                onClick={() => onEdit(transaction)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Transação</DialogTitle>
            </DialogHeader>
            {isEditing && (
              <TransactionForm
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
          className="text-[--error]"
          onClick={() => onDelete(transaction.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
