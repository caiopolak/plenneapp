
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GoalAmountsFieldsProps {
  targetAmount: string;
  setTargetAmount: (v: string) => void;
  currentAmount: string;
  setCurrentAmount: (v: string) => void;
}

export function GoalAmountsFields({
  targetAmount,
  setTargetAmount,
  currentAmount,
  setCurrentAmount,
}: GoalAmountsFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="targetAmount">Valor Alvo (R$)</Label>
        <Input
          id="targetAmount"
          type="number"
          step="0.01"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          placeholder="0,00"
          required
        />
      </div>
      <div>
        <Label htmlFor="currentAmount">Valor Atual (R$)</Label>
        <Input
          id="currentAmount"
          type="number"
          step="0.01"
          value={currentAmount}
          onChange={(e) => setCurrentAmount(e.target.value)}
          placeholder="0,00"
        />
      </div>
    </div>
  );
}
