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
    const totalDays = challenge.duration_days;
    const daysElapsed = differenceInDays(new Date(), startDate);
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
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/30 h-full min-h-[320px]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <Trophy className="h-4 w-4 text-warning" />
            </div>
            <CardTitle className="text-lg">Seus Desafios</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se não tem desafios ativos mas tem sugestões, mostrar sugestões
  const hasSuggestions = autoSuggestions.length > 0;
  const suggestion = autoSuggestions[0];

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/30 h-full min-h-[320px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <Trophy className="h-4 w-4 text-warning" />
            </div>
            <CardTitle className="text-lg">Seus Desafios</CardTitle>
            {stats.completed > 0 && (
              <Badge variant="outline" className="text-xs gap-1">
                <CheckCircle className="w-3 h-3" />
                {stats.completed}
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs h-7"
            onClick={() => navigate('/app/education')}
          >
            Ver todos
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {activeChallenges.length > 0 ? (
          <div className="space-y-3 flex-1">
            {activeChallenges.map((challenge) => {
              const progress = calculateProgress(challenge);
              const daysRemaining = getDaysRemaining(challenge);

              return (
                <div 
                  key={challenge.id} 
                  className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-2 cursor-pointer hover:shadow-sm transition-all hover:scale-[1.01]"
                  onClick={() => navigate('/app/education')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                        <h4 className="font-medium text-sm truncate">{challenge.title}</h4>
                        {challenge.is_automatic && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                            IA
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {challenge.description}
                      </p>
                    </div>
                    {challenge.target_amount && (
                      <Badge variant="outline" className="text-[10px] whitespace-nowrap flex-shrink-0">
                        <Target className="w-2.5 h-2.5 mr-0.5" />
                        R$ {Number(challenge.target_amount).toLocaleString('pt-BR')}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progresso</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {daysRemaining} dias restantes
                      </span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : hasSuggestions && suggestion ? (
          <div className="flex-1">
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-warning/20">
                  <Sparkles className="w-3.5 h-3.5 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-warning">Sugestão IA</span>
                  </div>
                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {suggestion.description}
                  </p>
                </div>
              </div>
              <p className="text-xs text-primary/80 italic pl-8">
                💡 {suggestion.reason}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-4 text-muted-foreground">
              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum desafio ativo</p>
              <p className="text-xs mt-1 opacity-70">Inicie um desafio financeiro</p>
            </div>
          </div>
        )}

        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => navigate('/app/education')}
        >
          <Trophy className="w-4 h-4 mr-2" />
          {hasSuggestions ? `Ver ${autoSuggestions.length} sugestões` : 'Ver Desafios'}
        </Button>
      </CardContent>
    </Card>
  );
}
