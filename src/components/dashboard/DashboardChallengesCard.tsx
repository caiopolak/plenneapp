import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, ChevronRight, Calendar, Flame, Sparkles, CheckCircle } from "lucide-react";
import { useChallenges } from "@/hooks/useChallenges";
import { useNavigate } from "react-router-dom";
import { differenceInDays, addDays } from "date-fns";

export function DashboardChallengesCard() {
  const { challenges, autoSuggestions, stats, isLoading } = useChallenges();
  const navigate = useNavigate();

  // Pegar apenas os 2 primeiros desafios ativos
  const activeChallenges = challenges.filter(c => c.status === 'active').slice(0, 2);

  const calculateProgress = (challenge: any) => {
    if (!challenge.started_at) return 0;
    const startDate = new Date(challenge.started_at);
    const endDate = addDays(startDate, challenge.duration_days);
    const today = new Date();
    const totalDays = challenge.duration_days;
    const daysElapsed = differenceInDays(today, startDate);
    return Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);
  };

  const getDaysRemaining = (challenge: any) => {
    if (!challenge.started_at) return challenge.duration_days;
    const startDate = new Date(challenge.started_at);
    const endDate = addDays(startDate, challenge.duration_days);
    return Math.max(differenceInDays(endDate, new Date()), 0);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se não tem desafios ativos mas tem sugestões, mostrar sugestões
  if (activeChallenges.length === 0 && autoSuggestions.length > 0) {
    const suggestion = autoSuggestions[0];
    return (
      <Card className="border-l-4 border-l-warning">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-warning" />
              Desafio Sugerido
              <Badge className="bg-warning text-warning-foreground text-xs">IA</Badge>
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/app/education')}
            >
              Ver mais
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-3 rounded-lg bg-warning/10 space-y-2">
            <div className="flex items-start gap-2">
              <Flame className="w-4 h-4 text-warning mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">{suggestion.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {suggestion.description}
                </p>
              </div>
            </div>
            <p className="text-xs text-primary italic">
              💡 {suggestion.reason}
            </p>
          </div>
          <Button 
            className="w-full mt-3"
            onClick={() => navigate('/app/education')}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Ver Todos os Desafios
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (activeChallenges.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-warning">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            Seus Desafios
            {stats.completed > 0 && (
              <Badge variant="outline" className="text-xs gap-1">
                <CheckCircle className="w-3 h-3" />
                {stats.completed} concluídos
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/app/education')}
          >
            Ver todos
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeChallenges.map((challenge) => {
          const progress = calculateProgress(challenge);
          const daysRemaining = getDaysRemaining(challenge);

          return (
            <div key={challenge.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-warning" />
                    <h4 className="font-medium text-sm">{challenge.title}</h4>
                    {challenge.is_automatic && (
                      <Badge variant="outline" className="text-xs">
                        <Sparkles className="w-2 h-2 mr-1" />
                        IA
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {challenge.description}
                  </p>
                </div>
                {challenge.target_amount && (
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    <Target className="w-3 h-3 mr-1" />
                    R$ {Number(challenge.target_amount).toLocaleString('pt-BR')}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {daysRemaining} dias restantes
                  </span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            </div>
          );
        })}

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/app/education')}
        >
          <Trophy className="w-4 h-4 mr-2" />
          {autoSuggestions.length > 0 ? `Ver ${autoSuggestions.length} sugestões` : 'Criar Novo Desafio'}
        </Button>
      </CardContent>
    </Card>
  );
}
