
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface GoalDateAndPriorityFieldsProps {
  targetDate?: Date;
  setTargetDate: (date?: Date) => void;
  priority: string;
  setPriority: (priority: string) => void;
}

export function GoalDateAndPriorityFields({
  targetDate,
  setTargetDate,
  priority,
  setPriority,
}: GoalDateAndPriorityFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="targetDate">Data Limite</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !targetDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {targetDate ? format(targetDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[9999] bg-background" align="start">
            <Calendar
              mode="single"
              selected={targetDate}
              onSelect={setTargetDate}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label htmlFor="priority">Prioridade</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[9999] bg-background">
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
