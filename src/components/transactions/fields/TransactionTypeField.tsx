
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';

interface TransactionTypeFieldProps {
  value: string;
  onChange: (v: string) => void;
  isMobile?: boolean;
}

export function TransactionTypeField({ value, onChange, isMobile }: TransactionTypeFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="type" className="text-sm font-medium">Tipo</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn(
          "h-12",
          isMobile && "text-base"
        )}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[1000] bg-white">
          <SelectItem value="income">Receita</SelectItem>
          <SelectItem value="expense">Despesa</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
