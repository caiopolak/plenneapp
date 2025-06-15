
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TransactionAmountFieldProps {
  value: string;
  onChange: (value: string) => void;
  isMobile?: boolean;
}

/**
 * Campo de valor da transação, com padronização de props e responsividade.
 */
export function TransactionAmountField({ value, onChange, isMobile }: TransactionAmountFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="transaction-amount" className="text-sm font-medium">Valor (R$)</Label>
      <Input
        id="transaction-amount"
        type="number"
        step="0.01"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="0,00"
        required
        className={cn("h-12", isMobile && "text-base")}
      />
    </div>
  );
}
