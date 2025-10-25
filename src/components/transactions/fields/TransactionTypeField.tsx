
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';

interface TransactionTypeFieldProps {
  value: string;
  onChange: (type: string) => void;
  isMobile?: boolean;
}

/**
 * Campo Tipo de transação, padronizado. 
 */
export function TransactionTypeField({ value, onChange, isMobile }: TransactionTypeFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="transaction-type" className={cn("text-sm font-medium", isMobile && "text-base")}>Tipo</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("h-12", isMobile && "text-base")}>
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent className="z-[1000] bg-popover">
          <SelectItem value="income">Receita</SelectItem>
          <SelectItem value="expense">Despesa</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
