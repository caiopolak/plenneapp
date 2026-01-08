import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  AlertTriangle, 
  Target, 
  Wallet,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Crown,
  Lock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useIntelligentAlerts } from '@/hooks/useIntelligentAlerts';
import { useIntelligentTips } from '@/hooks/useIntelligentTips';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DashboardAlertsCard() {
  const { alerts, loading: alertsLoading, unreadCount } = useIntelligentAlerts();
  const { tips, loading: tipsLoading } = useIntelligentTips();
  const { limits, isLoading: limitsLoading } = useSubscriptionLimits();
  const navigate = useNavigate();

  const isLoading = alertsLoading || tipsLoading || limitsLoading;
  const isFreeUser = limits?.plan === 'free';

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'budget': return Wallet;
      case 'goal': return Target;
      case 'spending': return TrendingUp;
      case 'tip': return Lightbulb;
      case 'investment': return DollarSign;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400';
      case 'medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-400';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  // Pegar os 3 primeiros alertas não lidos e 1 dica
  const recentAlerts = alerts?.filter(a => !a.is_read).slice(0, 3) || [];
  const recentTip = tips?.[0];

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Alertas & Dicas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Conteúdo para usuários free (com blur)
  if (isFreeUser) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/30 relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Alertas & Dicas</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              <Lock className="w-3 h-3 mr-1" />
              PRO
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {/* Conteúdo borrado */}
          <div className="space-y-3 blur-sm select-none pointer-events-none">
            <div className="p-3 rounded-lg border bg-red-50 border-red-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-red-100">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                </div>
                <span className="text-sm font-medium">Orçamento excedido</span>
              </div>
            </div>
            <div className="p-3 rounded-lg border bg-amber-50 border-amber-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-amber-100">
                  <Target className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <span className="text-sm font-medium">Meta próxima do prazo</span>
              </div>
            </div>
            <div className="p-3 rounded-lg border bg-emerald-50 border-emerald-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-100">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">Dica personalizada</span>
              </div>
            </div>
          </div>

          {/* Overlay com CTA */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px]">
            <div className="text-center p-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 w-fit mx-auto mb-3">
                <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="font-semibold mb-1">Alertas Inteligentes</h4>
              <p className="text-sm text-muted-foreground mb-3 max-w-[200px]">
                Receba alertas automáticos sobre orçamentos, metas e dicas personalizadas.
              </p>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                onClick={() => navigate('/app/plans')}
              >
                <Crown className="w-3.5 h-3.5 mr-1.5" />
                Fazer Upgrade
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Conteúdo para usuários Pro/Business
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Alertas & Dicas</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7"
            onClick={() => navigate('/app/alerts')}
          >
            Ver todos
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Alertas recentes */}
        {recentAlerts.length > 0 ? (
          <>
            {recentAlerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.alert_type);
              return (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg border bg-gradient-to-r from-muted/50 to-transparent cursor-pointer hover:shadow-sm transition-all hover:scale-[1.01]"
                  onClick={() => navigate('/app/alerts')}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-lg ${getPriorityColor(alert.priority)}`}>
                      <AlertIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{alert.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {alert.message}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(alert.created_at), "dd/MM", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Bell className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum alerta pendente</p>
          </div>
        )}

        {/* Dica do dia */}
        {recentTip && (
          <div className="p-3 rounded-lg border bg-gradient-to-r from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Dica do dia</span>
                </div>
                <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-100 truncate">
                  {recentTip.title}
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 line-clamp-2 mt-0.5">
                  {recentTip.content}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
