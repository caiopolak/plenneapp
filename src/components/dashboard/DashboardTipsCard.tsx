import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ChevronRight, TrendingUp, Shield, PiggyBank, BookOpen, Brain } from "lucide-react";
import { useIntelligentTips } from "@/hooks/useIntelligentTips";
import { useNavigate } from "react-router-dom";

export function DashboardTipsCard() {
  const { tips, loading } = useIntelligentTips();
  const navigate = useNavigate();

  // Pegar apenas as 2 dicas mais urgentes para consistência
  const urgentTips = tips
    .filter(t => t.is_automatic)
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
    })
    .slice(0, 2);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'budgeting': return <BookOpen className="w-3.5 h-3.5" />;
      case 'saving': return <PiggyBank className="w-3.5 h-3.5" />;
      case 'investment': return <TrendingUp className="w-3.5 h-3.5" />;
      case 'emergency_fund': return <Shield className="w-3.5 h-3.5" />;
      default: return <Brain className="w-3.5 h-3.5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/30 h-full min-h-[320px]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <Lightbulb className="h-4 w-4 text-warning" />
            </div>
            <CardTitle className="text-lg">Dicas Personalizadas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mesmo sem dicas, mostrar o card com estado vazio
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/30 h-full min-h-[320px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <Lightbulb className="h-4 w-4 text-warning" />
            </div>
            <CardTitle className="text-lg">Dicas Personalizadas</CardTitle>
            {tips.filter(t => t.priority === 'high').length > 0 && (
              <Badge className="bg-destructive text-destructive-foreground text-xs">
                {tips.filter(t => t.priority === 'high').length} urgentes
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs h-7"
            onClick={() => navigate('/app/education')}
          >
            Ver todas
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {urgentTips.length > 0 ? (
          <div className="space-y-3 flex-1">
            {urgentTips.map((tip) => (
              <div 
                key={tip.id} 
                className={`p-3 rounded-lg border ${getPriorityColor(tip.priority)} cursor-pointer hover:shadow-sm transition-all hover:scale-[1.01]`}
                onClick={() => navigate('/app/education')}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-background">
                    {getCategoryIcon(tip.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{tip.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {tip.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-4 text-muted-foreground">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Suas dicas aparecerão aqui</p>
              <p className="text-xs mt-1 opacity-70">Baseadas no seu perfil financeiro</p>
            </div>
          </div>
        )}

        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => navigate('/app/education')}
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Ver Mais Dicas
        </Button>
      </CardContent>
    </Card>
  );
}
