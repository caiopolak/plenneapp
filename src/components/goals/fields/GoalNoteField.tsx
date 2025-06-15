
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface GoalNoteFieldProps {
  note: string;
  setNote: (n: string) => void;
}

export function GoalNoteField({ note, setNote }: GoalNoteFieldProps) {
  return (
    <div>
      <Label htmlFor="note">Observações (opcional)</Label>
      <Textarea
        id="note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Escreva anotações extras sobre esta meta (ex: motivo, dicas, motivação...)"
      />
    </div>
  );
}
