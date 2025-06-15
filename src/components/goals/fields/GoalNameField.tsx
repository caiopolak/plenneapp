
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GoalNameFieldProps {
  name: string;
  setName: (name: string) => void;
}

export function GoalNameField({ name, setName }: GoalNameFieldProps) {
  return (
    <div>
      <Label htmlFor="name">Nome da Meta</Label>
      <Input
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex: Viagem para Europa, Carro novo..."
        required
      />
    </div>
  );
}
