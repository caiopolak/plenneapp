
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Trophy, Calendar, DollarSign, Play, Pause, CheckCircle, X, Plus } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface FinancialChallenge {
  id: string;
  title: string;
  description: string;
  target_amount: number | null;
  duration_days: number;
  status: 'active' | 'completed' | 'failed' | 'paused';
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export function FinancialChallenges() {
  const [challenges, setChallenges] = useState<FinancialChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    duration_days: ''
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Simulando dados locais para evitar erros de banco
    const mockChallenges: FinancialChallenge[] = [
      {
        id: '1',
        title: 'Desafio 30 dias sem delivery',
        description: 'Economizar dinheiro cozinhando em casa por 30 dias',
        target_amount: 500,
        duration_days: 30,
        status: 'active',
        started_at: new Date().toISOString(),
        completed_at: null,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Poupar R$ 1000 em 60 dias',
        description: 'Meta de economia através de redução de gastos supérfluos',
        target_amount: 1000,
        duration_days: 60,
        status: 'active',
        started_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: null,
        created_at: new Date().toISOString()
      }
    ];
    
    setChallenges(mockChallenges);
    setLoading(false);
  }, [user]);

  const createChallenge = async (e: React.FormEvent) => {
    e.preventDefault();

    const newChallenge: FinancialChallenge = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      target_amount: formData.target_amount ? parseFloat(formData.target_amount) : null,
      duration_days: parseInt(formData.duration_days),
      status: 'active',
      started_at: new Date().toISOString(),
      completed_at: null,
      created_at: new Date().toISOString()
    };

    setChallenges(prev => [newChallenge, ...prev]);

    toast({
      title: "Sucesso!",
      description: "Desafio criado com sucesso"
    });

    setFormData({ title: '', description: '', target_amount: '', duration_days: '' });
    setShowForm(false);
  };

  const updateChallengeStatus = async (challengeId: string, status: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { 
            ...challenge, 
            status: status as any,
            completed_at: status === 'completed' ? new Date().toISOString() : challenge.completed_at
          }
        : challenge
    ));

    toast({
      title: "Sucesso!",
      description: `Desafio ${status === 'completed' ? 'concluído' : 'atualizado'} com sucesso`
    });
  };

  const deleteChallenge = async (challengeId: string) => {
    setChallenges(prev => prev.filter(challenge => challenge.id !== challengeId));

    toast({
      title: "Sucesso!",
      description: "Desafio removido com sucesso"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      case 'paused': return 'Pausado';
      case 'failed': return 'Falhado';
      default: return 'Desconhecido';
    }
  };

  const calculateProgress = (challenge: FinancialChallenge) => {
    const startDate = new Date(challenge.started_at);
    const endDate = addDays(startDate, challenge.duration_days);
    const today = new Date();
    
    const totalDays = challenge.duration_days;
    const daysElapsed = differenceInDays(today, startDate);
    
    return Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);
  };

  const getDaysRemaining = (challenge: FinancialChallenge) => {
    const startDate = new Date(challenge.started_at);
    const endDate = addDays(startDate, challenge.duration_days);
    const today = new Date();
    
    return Math.max(differenceInDays(endDate, today), 0);
  };

  if (loading) {
    return <div>Carregando desafios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#003f5c] flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Desafios Financeiros
          </h2>
          <p className="text-[#2b2b2b]/70">Desafie-se e evolua suas finanças</p>
        </div>
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="bg-[#2f9e44] hover:bg-[#2f9e44]/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Desafio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Desafio</DialogTitle>
            </DialogHeader>
            <form onSubmit={createChallenge} className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Desafio</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Economizar R$ 1000 em 30 dias"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva seu desafio e como pretende alcançá-lo"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="target_amount">Meta (R$) - Opcional</Label>
                <Input
                  id="target_amount"
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <Label htmlFor="duration_days">Duração (dias)</Label>
                <Input
                  id="duration_days"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_days: e.target.value }))}
                  placeholder="30"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-[#2f9e44] hover:bg-[#2f9e44]/90">
                  Criar Desafio
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {challenges.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto text-[#003f5c]/50 mb-4" />
            <p className="text-[#2b2b2b]/70">Nenhum desafio criado ainda</p>
            <p className="text-sm text-[#2b2b2b]/50 mt-2">
              Crie seu primeiro desafio financeiro e comece a evoluir!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((challenge) => {
            const progress = calculateProgress(challenge);
            const daysRemaining = getDaysRemaining(challenge);
            
            return (
              <Card key={challenge.id} className="border-l-4 border-l-[#f8961e]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-[#003f5c]">{challenge.title}</CardTitle>
                      <Badge className={`mt-2 ${getStatusColor(challenge.status)} text-white`}>
                        {getStatusLabel(challenge.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-1">
                      {challenge.status === 'active' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateChallengeStatus(challenge.id, 'completed')}
                            title="Marcar como concluído"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateChallengeStatus(challenge.id, 'paused')}
                            title="Pausar desafio"
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {challenge.status === 'paused' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateChallengeStatus(challenge.id, 'active')}
                          title="Retomar desafio"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteChallenge(challenge.id)}
                        title="Remover desafio"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-[#2b2b2b]">{challenge.description}</p>
                  
                  {challenge.target_amount && (
                    <div className="flex items-center gap-2 text-sm text-[#2b2b2b]/70">
                      <DollarSign className="w-4 h-4" />
                      Meta: R$ {challenge.target_amount.toFixed(2).replace('.', ',')}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso temporal</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-[#2b2b2b]/70">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Prazo expirado'}
                    </div>
                    <div>
                      {challenge.duration_days} dias total
                    </div>
                  </div>
                  
                  {challenge.completed_at && (
                    <div className="text-sm text-green-600">
                      Concluído em {format(new Date(challenge.completed_at), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
