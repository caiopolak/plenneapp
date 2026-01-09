import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Calendar, DollarSign, Play, Pause, CheckCircle, X, Plus, 
  Sparkles, Target, TrendingDown, PiggyBank, Flame, Zap
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useChallenges, Challenge, AutoChallengeSuggestion } from '@/hooks/useChallenges';
import { useConfetti } from '@/hooks/useConfetti';

export function FinancialChallengesNew() {
  const { 
    challenges, 
    isLoading, 
    autoSuggestions, 
    stats,
    createChallengeMutation,
    updateStatusMutation,
    deleteChallengeMutation,
    acceptSuggestion
  } = useChallenges();
  const { fireAchievement } = useConfetti();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    duration_days: '30'
  });

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    await createChallengeMutation.mutateAsync({
      title: formData.title,
      description: formData.description,
      target_amount: formData.target_amount ? parseFloat(formData.target_amount) : null,
      duration_days: parseInt(formData.duration_days)
    });
    setFormData({ title: '', description: '', target_amount: '', duration_days: '30' });
    setShowForm(false);
  };

  const handleComplete = async (id: string) => {
    await updateStatusMutation.mutateAsync({ id, status: 'completed' });
    fireAchievement();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-secondary text-secondary-foreground';
      case 'completed': return 'bg-success text-success-foreground';
      case 'paused': return 'bg-warning text-warning-foreground';
      case 'failed': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      case 'paused': return 'Pausado';
      case 'failed': return 'Não concluído';
      default: return status;
    }
  };

  const calculateProgress = (challenge: Challenge) => {
    if (!challenge.started_at) return 0;
    const startDate = new Date(challenge.started_at);
    const endDate = addDays(startDate, challenge.duration_days);
    const today = new Date();
    const totalDays = challenge.duration_days;
    const daysElapsed = differenceInDays(today, startDate);
    return Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);
  };

  const getDaysRemaining = (challenge: Challenge) => {
    if (!challenge.started_at) return challenge.duration_days;
    const startDate = new Date(challenge.started_at);
    const endDate = addDays(startDate, challenge.duration_days);
    return Math.max(differenceInDays(endDate, new Date()), 0);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spending': return <TrendingDown className="w-5 h-5" />;
      case 'saving': return <PiggyBank className="w-5 h-5" />;
      case 'emergency_fund': return <Target className="w-5 h-5" />;
      default: return <Flame className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando desafios...</div>;
  }

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Trophy className="w-6 h-6 text-warning" />
            Desafios Financeiros
          </h2>
          <p className="text-muted-foreground">
            Desafie-se e evolua suas finanças com metas personalizadas
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2 text-sm">
            <Badge variant="outline" className="gap-1">
              <Flame className="w-3 h-3" />
              {stats.active} ativos
            </Badge>
            <Badge variant="outline" className="gap-1 bg-success/10 text-success border-success/20">
              <CheckCircle className="w-3 h-3" />
              {stats.completed} concluídos
            </Badge>
          </div>
          
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-warning to-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Novo Desafio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Desafio</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateChallenge} className="space-y-4">
                <div>
                  <Label>Título do Desafio</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Economizar R$ 1000 em 30 dias"
                    required
                  />
                </div>
                
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva seu desafio e como pretende alcançá-lo"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Meta (R$) - Opcional</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.target_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label>Duração (dias)</Label>
                    <Input
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_days: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createChallengeMutation.isPending}
                >
                  {createChallengeMutation.isPending ? 'Criando...' : 'Criar Desafio'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sugestões Automáticas */}
      {autoSuggestions.length > 0 && (
        <Card className="border-warning/50 bg-gradient-to-r from-warning/5 to-secondary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-warning" />
              Desafios Sugeridos para Você
              <Badge className="bg-warning text-warning-foreground">IA</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {autoSuggestions.slice(0, 4).map((suggestion) => (
                <div 
                  key={suggestion.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-warning/10 text-warning">
                      {getCategoryIcon(suggestion.category)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {suggestion.duration_days} dias
                        {suggestion.target_amount && (
                          <>
                            <span>•</span>
                            <DollarSign className="w-3 h-3" />
                            R$ {suggestion.target_amount.toFixed(2)}
                          </>
                        )}
                      </div>
                      <p className="text-xs text-primary mt-2 italic">
                        💡 {suggestion.reason}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => acceptSuggestion(suggestion)}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Aceitar Desafio
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Abas de Desafios */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <Flame className="w-4 h-4" />
            Ativos ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Concluídos ({completedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeChallenges.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum desafio ativo</p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  Crie um novo desafio ou aceite uma sugestão acima!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeChallenges.map((challenge) => {
                const progress = calculateProgress(challenge);
                const daysRemaining = getDaysRemaining(challenge);
                
                return (
                  <Card key={challenge.id} className="border-l-4 border-l-warning">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {challenge.title}
                            {challenge.is_automatic && (
                              <Badge variant="outline" className="text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                IA
                              </Badge>
                            )}
                          </CardTitle>
                          <Badge className={`mt-2 ${getStatusColor(challenge.status)}`}>
                            {getStatusLabel(challenge.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleComplete(challenge.id)}
                            title="Marcar como concluído"
                          >
                            <CheckCircle className="w-4 h-4 text-success" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateStatusMutation.mutate({ 
                              id: challenge.id, 
                              status: challenge.status === 'paused' ? 'active' : 'paused' 
                            })}
                            title={challenge.status === 'paused' ? 'Retomar' : 'Pausar'}
                          >
                            {challenge.status === 'paused' ? (
                              <Play className="w-4 h-4" />
                            ) : (
                              <Pause className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteChallengeMutation.mutate(challenge.id)}
                            title="Remover"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-foreground">{challenge.description}</p>
                      
                      {challenge.target_amount && (
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-primary" />
                          Meta: R$ {Number(challenge.target_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso temporal</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Prazo expirado'}
                        </div>
                        <div>{challenge.duration_days} dias total</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedChallenges.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum desafio concluído ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedChallenges.map((challenge) => (
                <Card key={challenge.id} className="border-l-4 border-l-success bg-success/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      {challenge.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground mb-3">{challenge.description}</p>
                    {challenge.completed_at && (
                      <p className="text-sm text-success">
                        🎉 Concluído em {format(new Date(challenge.completed_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
