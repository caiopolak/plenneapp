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

  // Pegar apenas as 3 dicas mais urgentes
  const urgentTips = tips
    .filter(t => t.is_automatic)
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
    })
    .slice(0, 3);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'budgeting': return <BookOpen className="w-4 h-4" />;
      case 'saving': return <PiggyBank className="w-4 h-4" />;
      case 'investment': return <TrendingUp className="w-4 h-4" />;
      case 'emergency_fund': return <Shield className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
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
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (urgentTips.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-warning">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-warning" />
            Dicas Personalizadas
            {tips.filter(t => t.priority === 'high').length > 0 && (
              <Badge className="bg-destructive text-destructive-foreground text-xs">
                {tips.filter(t => t.priority === 'high').length} urgentes
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/app/education')}
          >
            Ver todas
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {urgentTips.map((tip) => (
          <div 
            key={tip.id} 
            className={`p-3 rounded-lg border ${getPriorityColor(tip.priority)}`}
          >
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-background">
                {getCategoryIcon(tip.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{tip.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {tip.content}
                </p>
              </div>
            </div>
          </div>
        ))}

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/app/education')}
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Ver Mais Dicas
        </Button>
      </CardContent>
    </Card>
  );
}
