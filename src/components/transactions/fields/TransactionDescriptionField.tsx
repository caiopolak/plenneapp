
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';

interface TransactionDescriptionFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isMobile?: boolean;
}

export function TransactionDescriptionField({ value, onChange, isMobile }: TransactionDescriptionFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="description" className="text-sm font-medium">Descrição</Label>
      <Textarea
        id="description"
        value={value}
        onChange={onChange}
        placeholder="Descrição opcional..."
        className={cn("min-h-[80px] resize-none", isMobile && "text-base")}
      />
    </div>
  );
}
