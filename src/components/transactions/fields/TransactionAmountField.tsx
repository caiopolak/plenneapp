
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TransactionAmountFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMobile?: boolean;
}

export function TransactionAmountField({ value, onChange, isMobile }: TransactionAmountFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="amount" className="text-sm font-medium">Valor (R$)</Label>
      <Input
        id="amount"
        type="number"
        step="0.01"
        value={value}
        onChange={onChange}
        placeholder="0,00"
        required
        className={cn("h-12", isMobile && "text-base")}
      />
    </div>
  );
}
