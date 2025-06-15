
import { Label } from "@/components/ui/label";
import { CategoryManager } from "../CategoryManager";

interface TransactionCategoryFieldProps {
  type: string;
  value: string;
  onChange: (v: string) => void;
}

export function TransactionCategoryField({ type, value, onChange }: TransactionCategoryFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="category" className="text-sm font-medium">Categoria</Label>
      <CategoryManager
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
