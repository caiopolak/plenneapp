import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface InvestmentFormProps {
  onSuccess?: () => void;
  investment?: any;
  onCancel?: () => void;
}

const investmentTypes = [
  { value: 'stocks', label: 'Ações' },
  { value: 'bonds', label: 'Títulos' },
  { value: 'crypto', label: 'Criptomoedas' },
  { value: 'real_estate', label: 'Imóveis' },
  { value: 'funds', label: 'Fundos' },
  { value: 'savings', label: 'Poupança' }
];

export function InvestmentForm({ onSuccess, investment, onCancel }: InvestmentFormProps) {
  const [name, setName] = useState(investment?.name || '');
  const [type, setType] = useState(investment?.type || '');
  const [amount, setAmount] = useState(investment?.amount || '');
  const [expectedReturn, setExpectedReturn] = useState(investment?.expected_return || '');
  const [purchaseDate, setPurchaseDate] = useState<Date>(
    investment?.purchase_date ? new Date(investment.purchase_date) : new Date()
  );
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { current, workspaces } = useWorkspace();
  const [workspaceId, setWorkspaceId] = useState(
    investment?.workspace_id ?? current?.id ?? (workspaces.length === 1 ? workspaces[0].id : "")
  );

  React.useEffect(() => {
    if (!workspaceId && current?.id) setWorkspaceId(current.id);
  }, [current?.id, workspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !type || !amount || !user || !workspaceId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios"
      });
      return;
    }

    setLoading(true);

    try {
      const investmentData = {
        user_id: user.id,
        workspace_id: workspaceId,
        name,
        type,
        amount: parseFloat(amount),
        expected_return: expectedReturn ? parseFloat(expectedReturn) : null,
        purchase_date: format(purchaseDate, 'yyyy-MM-dd')
      };

      if (investment) {
        const { error } = await supabase
          .from('investments')
          .update(investmentData)
          .eq('id', investment.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Investimento atualizado com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('investments')
          .insert([investmentData]);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Investimento adicionado com sucesso"
        });
      }

      if (onSuccess) onSuccess();

      // Reset form if it's a new investment
      if (!investment) {
        setName('');
        setType('');
        setAmount('');
        setExpectedReturn('');
        setPurchaseDate(new Date());
        setWorkspaceId(current?.id ?? "");
      }

    } catch (error) {
      console.error('Error saving investment:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar investimento"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {investment ? 'Editar Investimento' : 'Novo Investimento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <WorkspaceSelect
            value={workspaceId}
            onChange={setWorkspaceId}
            label="Workspace"
            disabled={workspaces.length <= 1}
          />
          <div>
            <Label htmlFor="name">Nome do Investimento</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: PETR4, Tesouro Direto, Bitcoin..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {investmentTypes.map((investmentType) => (
                    <SelectItem key={investmentType.value} value={investmentType.value}>
                      {investmentType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Valor Investido (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expectedReturn">Retorno Esperado (%)</Label>
              <Input
                id="expectedReturn"
                type="number"
                step="0.01"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
                placeholder="Ex: 12.5"
              />
            </div>

            <div>
              <Label htmlFor="purchaseDate">Data da Compra</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(purchaseDate, "dd/MM/yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={purchaseDate}
                    onSelect={(date) => date && setPurchaseDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : (investment ? 'Atualizar' : 'Adicionar')}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
