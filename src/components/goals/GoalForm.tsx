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
import { Textarea } from "@/components/ui/textarea";

interface GoalFormProps {
  onSuccess?: () => void;
  goal?: any;
  onCancel?: () => void;
}

export function GoalForm({ onSuccess, goal, onCancel }: GoalFormProps) {
  const [name, setName] = useState(goal?.name || '');
  const [targetAmount, setTargetAmount] = useState(goal?.target_amount || '');
  const [currentAmount, setCurrentAmount] = useState(goal?.current_amount || '');
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    goal?.target_date ? new Date(goal.target_date) : undefined
  );
  const [priority, setPriority] = useState(goal?.priority || 'medium');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(goal?.note || '');
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { current, workspaces } = useWorkspace();
  const [workspaceId, setWorkspaceId] = useState(
    goal?.workspace_id ?? current?.id ?? (workspaces.length === 1 ? workspaces[0].id : "")
  );

  // Reset workspaceId se current mudar
  React.useEffect(() => {
    if (!workspaceId && current?.id) setWorkspaceId(current.id);
  }, [current?.id, workspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !targetAmount || !user || !workspaceId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios"
      });
      return;
    }

    setLoading(true);

    try {
      const goalData = {
        user_id: user.id,
        workspace_id: workspaceId,
        name,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount) || 0,
        target_date: targetDate ? format(targetDate, 'yyyy-MM-dd') : null,
        priority,
        note: note || null
      };

      if (goal) {
        const { error } = await supabase
          .from('financial_goals')
          .update(goalData)
          .eq('id', goal.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Meta atualizada com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('financial_goals')
          .insert([goalData]);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Meta criada com sucesso"
        });
      }

      if (onSuccess) onSuccess();

      // Reset form if it's a new goal
      if (!goal) {
        setName('');
        setTargetAmount('');
        setCurrentAmount('');
        setTargetDate(undefined);
        setPriority('medium');
        setWorkspaceId(current?.id ?? "");
        setNote('');
      }

    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar meta"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {goal ? 'Editar Meta' : 'Nova Meta Financeira'}
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
            <Label htmlFor="name">Nome da Meta</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Viagem para Europa, Carro novo..."
              required
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetDate">Data Limite</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetDate ? format(targetDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={setTargetDate}
                    initialFocus
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
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* NOVO: campo de observações */}
          <div>
            <Label htmlFor="note">Observações (opcional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Escreva anotações extras sobre esta meta (ex: motivo, dicas, motivação...)"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : (goal ? 'Atualizar' : 'Criar Meta')}
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
