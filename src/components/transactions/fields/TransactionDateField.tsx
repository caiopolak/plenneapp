
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from '@/lib/utils';

interface TransactionDateFieldProps {
  value: Date;
  onChange: (d: Date) => void;
  isMobile?: boolean;
}

/**
 * Campo de data da transação, padronizado.
 */
export function TransactionDateField({ value, onChange, isMobile }: TransactionDateFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="transaction-date" className={cn("text-sm font-medium", isMobile && "text-base")}>Data</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal h-12", isMobile && "text-base")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[2000] bg-white" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={d => d && onChange(d)}
            initialFocus
            className="bg-white"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
