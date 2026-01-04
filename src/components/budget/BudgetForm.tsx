import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBudgets } from "@/hooks/useBudgets";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { budgetSchema, validateInput, isValidationError, requireAuth } from "@/lib/validation";
import { checkRateLimit } from "@/lib/security";

interface BudgetFormProps {
  year: number;
  month: number;
  categories: string[];
  onClose: () => void;
  onSuccess: () => void;
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function BudgetForm({ year, month, categories, onClose, onSuccess }: BudgetFormProps) {
  const { createBudget } = useBudgets();
  const { user } = useAuth();
  const { toast } = useToast();
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!checkRateLimit(`budget_submit_${user?.id}`, 5, 60000)) {
      toast({
        variant: "destructive",
        title: "Muitas tentativas",
        description: "Aguarde um momento antes de tentar novamente"
      });
      return;
    }

    // Authentication validation
    try {
      requireAuth(user?.id);
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado"
      });
      return;
    }

    // Input validation using Zod schema
    const validationResult = validateInput(budgetSchema, {
      category,
      amount_limit: amount,
      year,
      month
    });

    if (isValidationError(validationResult)) {
      toast({
        variant: "destructive",
        title: "Dados inválidos",
        description: validationResult.errors[0]
      });
      return;
    }

    setLoading(true);
    try {
      const validated = validationResult.data;
      const success = await createBudget(validated.category, Number(validated.amount_limit), validated.year, validated.month);
      if (success) {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Criar Orçamento - {months[month - 1]} {year}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Valor Limite (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !category || !amount} 
              className="flex-1"
            >
              {loading ? "Criando..." : "Criar Orçamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
