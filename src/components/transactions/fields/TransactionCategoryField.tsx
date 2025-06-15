
import { Label } from "@/components/ui/label";
import { CategoryManager } from "../CategoryManager";

interface TransactionCategoryFieldProps {
  type: string;
  value: string;
  onChange: (category: string) => void;
  isMobile?: boolean;
}

/**
 * Campo Categoria, padronizado para receber isMobile.
 */
export function TransactionCategoryField({
  type, value, onChange, isMobile
}: TransactionCategoryFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="transaction-category" className={cn("text-sm font-medium", isMobile && "text-base")}>Categoria</Label>
      <CategoryManager
        type={type}
        value={value}
        onChange={onChange}
        isMobile={isMobile}
      />
    </div>
  );
}
