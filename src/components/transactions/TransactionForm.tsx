
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { WorkspaceSelect } from "../common/WorkspaceSelect";
import { CategoryManager } from "./CategoryManager";
import { useIsMobile } from '@/hooks/use-mobile';

interface TransactionFormProps {
  onSuccess?: () => void;
  transaction?: any;
  onCancel?: () => void;
}

const categories = {
  income: [
    'Salário', 'Freelance', 'Investimentos', 'Venda', 'Outros'
  ],
  expense: [
    'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 
    'Lazer', 'Compras', 'Contas', 'Outros'
  ]
};

export function TransactionForm({ onSuccess, transaction, onCancel }: TransactionFormProps) {
  const [type, setType] = useState(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction?.amount || '');
  const [category, setCategory] = useState(transaction?.category || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [date, setDate] = useState<Date>(transaction?.date ? new Date(transaction.date) : new Date());
  const [isRecurring, setIsRecurring] = useState(transaction?.is_recurring || false);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { current, workspaces } = useWorkspace();
  const isMobile = useIsMobile();

  // workspaceId sempre inicializado corretamente
  const [workspaceId, setWorkspaceId] = useState(
    transaction?.workspace_id ?? current?.id ?? (workspaces.length === 1 ? workspaces[0].id : "")
  );

  // Resetar categoria ao mudar tipo
  React.useEffect(() => {
    setCategory('');
  }, [type]);

  // Reset workspaceId se current mudar
  React.useEffect(() => {
    if (!workspaceId && current?.id) setWorkspaceId(current.id);
  }, [current?.id, workspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // valida workspaceId
    if (!workspaceId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nenhuma workspace selecionada."
      });
      return;
    }
    if (!amount || !category || !user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios"
      });
      return;
    }
    setLoading(true);

    try {
      const transactionData = {
        user_id: user.id,
        workspace_id: workspaceId,
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: format(date, 'yyyy-MM-dd'),
        is_recurring: isRecurring
      };

      if (transaction) {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', transaction.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Transação atualizada com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert([transactionData]);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Transação adicionada com sucesso"
        });
      }

      if (onSuccess) onSuccess();
      
      // Reset form if it's a new transaction
      if (!transaction) {
        setAmount('');
        setCategory('');
        setDescription('');
        setDate(new Date());
        setIsRecurring(false);
        setWorkspaceId(current?.id ?? "");
      }

    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar transação"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full", isMobile && "px-2")}>
      <Card className="border-0 shadow-none">
        <CardHeader className="px-2 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <WorkspaceSelect
              value={workspaceId}
              onChange={setWorkspaceId}
              label="Workspace"
              disabled={workspaces.length <= 1}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">Tipo</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  required
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">Categoria</Label>
              <CategoryManager
                type={type}
                value={category}
                onChange={setCategory}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-10"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[300]" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    className="bg-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição opcional..."
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Recorrências avançadas */}
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <Switch
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
                <Label htmlFor="recurring" className="text-sm font-medium">Transação recorrente</Label>
              </div>
              {isRecurring && (
                <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Padrão de recorrência</Label>
                    <Select
                      value={transaction?.recurrence_pattern || ""}
                      onValueChange={(v) => {
                        if (transaction) transaction.recurrence_pattern = v;
                      }}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Selecione o padrão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Data de término</Label>
                    <Input
                      type="date"
                      value={transaction?.recurrence_end_date || ""}
                      onChange={e => {
                        if (transaction) transaction.recurrence_end_date = e.target.value;
                      }}
                      className="h-10"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="h-10">
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={loading} className="flex-1 h-10">
                {loading ? 'Salvando...' : (transaction ? 'Atualizar' : 'Adicionar')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
