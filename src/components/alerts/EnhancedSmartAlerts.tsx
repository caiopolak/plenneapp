import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Bell,
  X,
  Eye,
  CheckCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  PieChart,
  Calendar,
  Crown,
  Lightbulb,
  Wallet,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useIntelligentAlerts, IntelligentAlert } from '@/hooks/useIntelligentAlerts';
import { useIntelligentTips } from '@/hooks/useIntelligentTips';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function EnhancedSmartAlerts() {
  const [selectedAlert, setSelectedAlert] = useState<IntelligentAlert | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { alerts, loading: alertsLoading, markAsRead, deleteAlert, markAllAsRead, unreadCount } = useIntelligentAlerts();
  const { tips, loading: tipsLoading } = useIntelligentTips();
  const { limits } = useSubscriptionLimits();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const canAccessAdvancedFeatures = limits?.plan !== 'free';

  const handleMarkAsRead = async (alertId: string) => {
    await markAsRead(alertId);
    toast({
      title: "Alerta marcado como lido",
      description: "O alerta foi marcado como lido."
    });
  };

  const handleDeleteAlert = async (alertId: string) => {
    await deleteAlert(alertId);
    toast({
      title: "Alerta removido",
      description: "O alerta foi removido."
    });
    setShowDetailsModal(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast({
      title: "Todos marcados como lidos",
      description: `${unreadCount} alertas foram marcados como lidos.`
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'budget': return Wallet;
      case 'budget_exceeded': return AlertTriangle;
      case 'goal': return Target;
      case 'spending': return TrendingUp;
      case 'savings_low': return TrendingDown;
      case 'tip': return Lightbulb;
      case 'investment': return DollarSign;
      default: return Bell;
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityStyles = (priority: string, isRead: boolean) => {
    const opacity = isRead ? 'opacity-60' : '';
    switch (priority) {
      case 'high': 
        return `bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800 ${opacity}`;
      case 'medium': 
        return `bg-gradient-to-r from-amber-50 to-yellow-100/50 dark:from-amber-950/30 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800 ${opacity}`;
      case 'low': 
        return `bg-gradient-to-r from-blue-50 to-indigo-100/50 dark:from-blue-950/30 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 ${opacity}`;
      default: 
        return `bg-muted/50 border-border ${opacity}`;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'budget': return 'Orçamento';
      case 'goal': return 'Meta';
      case 'spending': return 'Gastos';
      case 'tip': return 'Dica';
      case 'investment': return 'Investimento';
      case 'challenge': return 'Desafio';
      default: return type;
    }
  };

  const openAlertDetails = (alert: IntelligentAlert) => {
    setSelectedAlert(alert);
    setShowDetailsModal(true);
    if (!alert.is_read) {
      markAsRead(alert.id);
    }
  };

  const handleActionClick = (url?: string) => {
    if (url) {
      navigate(url);
    }
  };

  const unreadAlerts = alerts?.filter(alert => !alert.is_read) || [];
  const readAlerts = alerts?.filter(alert => alert.is_read) || [];

  if (alertsLoading || tipsLoading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            Central de Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Central de Alertas
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      {unreadCount} {unreadCount === 1 ? 'novo' : 'novos'}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Acompanhe alertas e dicas sobre suas finanças
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Marcar todos como lidos
                </Button>
              )}
              {limits && (
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-1 ${
                    limits.plan === 'free' 
                      ? 'border-muted-foreground/30' 
                      : 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {limits.plan === 'free' && 'FREE'}
                  {limits.plan === 'pro' && <><Crown className="w-3 h-3" />PRO</>}
                  {limits.plan === 'business' && <><Crown className="w-3 h-3" />BUSINESS</>}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="alerts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="alerts" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
                <AlertTriangle className="w-4 h-4" />
                <span>Alertas</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {alerts?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="tips" className="flex items-center gap-2 data-[state=active]:bg-primary/10">
                <Lightbulb className="w-4 h-4" />
                <span>Dicas</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {tips?.length || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="alerts" className="mt-0">
              <ScrollArea className="h-[500px] pr-4">
                {alerts && alerts.length > 0 ? (
                  <div className="space-y-3">
                    {/* Alertas não lidos primeiro */}
                    {unreadAlerts.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Bell className="w-4 h-4" />
                          <span className="font-medium">Não lidos ({unreadAlerts.length})</span>
                        </div>
                        {unreadAlerts.map((alert) => {
                          const AlertIcon = getAlertIcon(alert.alert_type);
                          return (
                            <div
                              key={alert.id}
                              className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] ${
                                getPriorityStyles(alert.priority, false)
                              }`}
                              onClick={() => openAlertDetails(alert)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${
                                  alert.priority === 'high' ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' :
                                  alert.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' :
                                  'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                                }`}>
                                  <AlertIcon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="font-semibold text-sm truncate">{alert.title}</h4>
                                    <div className="flex items-center gap-1.5">
                                      <Badge variant={getAlertColor(alert.priority)} className="text-xs">
                                        {getPriorityLabel(alert.priority)}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {getTypeLabel(alert.alert_type)}
                                      </Badge>
                                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {alert.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      {format(new Date(alert.created_at), "dd 'de' MMM", { locale: ptBR })}
                                    </div>
                                    {alert.action_url && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleActionClick(alert.action_url);
                                        }}
                                      >
                                        Ver mais
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-60 hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(alert.id);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Alertas lidos */}
                    {readAlerts.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">Lidos ({readAlerts.length})</span>
                        </div>
                        {readAlerts.slice(0, 5).map((alert) => {
                          const AlertIcon = getAlertIcon(alert.alert_type);
                          return (
                            <div
                              key={alert.id}
                              className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                                getPriorityStyles(alert.priority, true)
                              }`}
                              onClick={() => openAlertDetails(alert)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-muted">
                                  <AlertIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate text-muted-foreground">{alert.title}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(alert.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                  </p>
                                </div>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </div>
                            </div>
                          );
                        })}
                        {readAlerts.length > 5 && (
                          <p className="text-xs text-center text-muted-foreground">
                            + {readAlerts.length - 5} alertas anteriores
                          </p>
                        )}
                      </div>
                    )}

                    {alerts.length === 0 && (
                      <div className="text-center py-12">
                        <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                          <Bell className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-muted-foreground mb-2">
                          Nenhum alerta no momento
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Quando houver alertas importantes sobre suas finanças, eles aparecerão aqui.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                      <Bell className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-muted-foreground mb-2">
                      Nenhum alerta no momento
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Quando houver alertas importantes sobre suas finanças, eles aparecerão aqui.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tips" className="mt-0">
              <ScrollArea className="h-[500px] pr-4">
                {tips && tips.length > 0 ? (
                  <div className="space-y-3">
                    {tips.slice(0, 10).map((tip, index) => (
                      <div
                        key={tip.id}
                        className="p-4 rounded-xl border bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800 transition-all hover:shadow-md"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-emerald-900 dark:text-emerald-100 mb-1">
                              {tip.title}
                            </h4>
                            <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-3">
                              {tip.content}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 dark:text-emerald-300">
                                {tip.category}
                              </Badge>
                              {tip.difficulty_level && (
                                <Badge variant="secondary" className="text-xs">
                                  {tip.difficulty_level}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                      <Lightbulb className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-muted-foreground mb-2">
                      Nenhuma dica disponível
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Continue usando o app para receber dicas personalizadas sobre suas finanças!
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Upgrade prompt para plano free */}
          {limits?.plan === 'free' && (
            <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Crown className="w-5 h-5" />
                <span className="font-semibold">Desbloqueie Análises Avançadas</span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Planos Pro e Business incluem alertas mais detalhados, análises preditivas e insights personalizados sobre seu perfil financeiro.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-amber-400 text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                onClick={() => navigate('/app/plans')}
              >
                Ver Planos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes do alerta */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedAlert && (() => {
                const AlertIcon = getAlertIcon(selectedAlert.alert_type);
                return (
                  <div className={`p-2 rounded-lg ${
                    selectedAlert.priority === 'high' ? 'bg-red-100 text-red-600' :
                    selectedAlert.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <AlertIcon className="h-5 w-5" />
                  </div>
                );
              })()}
              <span className="text-lg">{selectedAlert?.title}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getAlertColor(selectedAlert.priority)}>
                  Prioridade {getPriorityLabel(selectedAlert.priority)}
                </Badge>
                <Badge variant="outline">
                  {getTypeLabel(selectedAlert.alert_type)}
                </Badge>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(selectedAlert.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm leading-relaxed">
                  {selectedAlert.message}
                </p>
              </div>

              {canAccessAdvancedFeatures && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    Recomendações Personalizadas
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      Considere revisar seu orçamento para essa categoria
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      Defina alertas automáticos para gastos futuros
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      Analise padrões de gastos dos últimos 3 meses
                    </li>
                  </ul>
                </div>
              )}

              {selectedAlert.action_url && (
                <Button
                  className="w-full"
                  onClick={() => {
                    handleActionClick(selectedAlert.action_url);
                    setShowDetailsModal(false);
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ir para {getTypeLabel(selectedAlert.alert_type)}
                </Button>
              )}

              <div className="flex justify-between pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Fechar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteAlert(selectedAlert.id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Dispensar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
