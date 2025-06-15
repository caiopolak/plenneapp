
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';

interface TransactionDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  isMobile?: boolean;
}

/**
 * Campo Descrição, padronizado para value/onChange e para receber isMobile (opcional).
 */
export function TransactionDescriptionField({ value, onChange, isMobile }: TransactionDescriptionFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="transaction-description" className={cn("text-sm font-medium", isMobile && "text-base")}>Descrição</Label>
      <Textarea
        id="transaction-description"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Descrição opcional..."
        className={cn("min-h-[80px] resize-none", isMobile && "text-base")}
      />
    </div>
  );
}
