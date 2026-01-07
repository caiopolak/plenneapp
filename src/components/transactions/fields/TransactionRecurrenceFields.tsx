
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';

interface TransactionRecurrenceFieldsProps {
  isRecurring: boolean;
  setIsRecurring: (c: boolean) => void;
  recurrencePattern: string;
  setRecurrencePattern: (v: string) => void;
  recurrenceEndDate: string;
  setRecurrenceEndDate: (v: string) => void;
  isMobile?: boolean;
  canUseRecurring?: boolean;
  /** Current form mode - affects how recurrence options are presented */
  mode?: 'immediate' | 'scheduled';
}

export function TransactionRecurrenceFields({
  isRecurring,
  setIsRecurring,
  recurrencePattern,
  setRecurrencePattern,
  recurrenceEndDate,
  setRecurrenceEndDate,
  isMobile,
  canUseRecurring = true,
  mode = 'immediate'
}: TransactionRecurrenceFieldsProps) {
  // In immediate mode, recurring means "start now and repeat"
  // In scheduled mode, recurring means "start on date and repeat"
  const recurringLabel = mode === 'scheduled' 
    ? "Repetir periodicamente" 
    : "Transação recorrente";
  return (
    <div className="space-y-3">
      <div className={cn(
        "flex gap-3 items-center min-h-[48px]",
        isMobile && "pl-2"
      )}>
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
          className={isMobile ? "scale-110" : ""}
          disabled={!canUseRecurring}
        />
        <Label 
          htmlFor="recurring" 
          className={cn(
            "text-sm font-medium", 
            isMobile && "text-base",
            !canUseRecurring && "text-muted-foreground"
          )}
        >
          {recurringLabel}
          {!canUseRecurring && " (Premium)"}
        </Label>
      </div>
      {isRecurring && (
        <div className="space-y-3 pl-4 border-l-2 border-gray-200">
          <div className="space-y-2">
            <Label className={cn("text-sm font-medium", isMobile && "text-base")}>Padrão de recorrência</Label>
            <Select
              value={recurrencePattern}
              onValueChange={setRecurrencePattern}
            >
              <SelectTrigger className={cn("h-10", isMobile && "text-base")}>
                <SelectValue placeholder="Selecione o padrão" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-[2000]">
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className={cn("text-sm font-medium", isMobile && "text-base")}>Data de término</Label>
            <Input
              type="date"
              value={recurrenceEndDate}
              onChange={e => setRecurrenceEndDate(e.target.value)}
              className={cn("h-10", isMobile && "text-base")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
