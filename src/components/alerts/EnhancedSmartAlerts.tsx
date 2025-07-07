import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Bell,
  X,
  Eye,
  CheckCircle,
  Clock,
  DollarSign,
  PieChart,
  Calendar,
  Crown
} from 'lucide-react';
import { useIntelligentAlerts } from '@/hooks/useIntelligentAlerts';
import { useIntelligentTips } from '@/hooks/useIntelligentTips';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function EnhancedSmartAlerts() {
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { alerts, loading: alertsLoading, refetch: refetchAlerts } = useIntelligentAlerts();
  const { tips, loading: tipsLoading } = useIntelligentTips();
  const { limits } = useSubscriptionLimits();
  const { user } = useAuth();
  const { toast } = useToast();

  const canAccessAdvancedFeatures = limits?.plan !== 'free';

  const handleMarkAsRead = async (alertId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('financial_alerts')
        .update({ is_read: true })
        .eq('id', alertId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Alerta marcado como lido",
        description: "O alerta foi marcado como lido com sucesso."
      });

      refetchAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao marcar alerta como lido."
      });
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('financial_alerts')
        .delete()
        .eq('id', alertId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Alerta removido",
        description: "O alerta foi removido com sucesso."
      });

      refetchAlerts();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover alerta."
      });
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'budget_exceeded': return AlertTriangle;
      case 'goal_close': return Target;
      case 'spending_pattern': return TrendingUp;
      case 'savings_low': return TrendingDown;
      case 'income_increase': return DollarSign;
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const openAlertDetails = (alert: any) => {
    setSelectedAlert(alert);
    setShowDetailsModal(true);
    if (!alert.is_read) {
      handleMarkAsRead(alert.id);
    }
  };

  const unreadAlerts = alerts?.filter(alert => !alert.is_read) || [];
  const readAlerts = alerts?.filter(alert => alert.is_read) || [];

  if (alertsLoading || tipsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas e Dicas Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Central de Alertas
              {unreadAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadAlerts.length}
                </Badge>
              )}
            </CardTitle>
            {limits && (
              <Badge variant="outline" className="flex items-center gap-1">
                {limits.plan === 'free' && 'FREE'}
                {limits.plan === 'pro' && <><Crown className="w-3 h-3" />PRO</>}
                {limits.plan === 'business' && <><Crown className="w-3 h-3" />BUSINESS</>}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="alerts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Alertas ({alerts?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="tips" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Dicas ({tips?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="alerts" className="space-y-4 mt-4">
              {alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                  {/* Alertas não lidos primeiro */}
                  {unreadAlerts.map((alert) => {
                    const AlertIcon = getAlertIcon(alert.alert_type);
                    return (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          getPriorityColor(alert.priority)
                        }`}
                        onClick={() => openAlertDetails(alert)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <AlertIcon className="h-5 w-5 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{alert.title}</h4>
                <Badge variant={getAlertColor(alert.priority)}>
                  {alert.priority}
                </Badge>
                                {!alert.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                              </div>
                              <p className="text-sm opacity-90 line-clamp-2">
                                {alert.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs opacity-75">
                                <Clock className="w-3 h-3" />
                                {new Date(alert.created_at).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-60 hover:opacity-100"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Alertas lidos */}
                  {readAlerts.length > 0 && (
                    <div className="pt-4 border-t">
                      <h5 className="text-sm font-medium text-muted-foreground mb-3">
                        Alertas Lidos ({readAlerts.length})
                      </h5>
                      <div className="space-y-2">
                        {readAlerts.slice(0, 3).map((alert) => {
                          const AlertIcon = getAlertIcon(alert.alert_type);
                          return (
                            <div
                              key={alert.id}
                              className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 cursor-pointer opacity-75 hover:opacity-100 transition-opacity"
                              onClick={() => openAlertDetails(alert)}
                            >
                              <div className="flex items-center gap-3">
                                <AlertIcon className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{alert.title}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(alert.created_at).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-muted-foreground mb-2">
                    Nenhum alerta no momento
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Quando houver alertas importantes sobre suas finanças, eles aparecerão aqui.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tips" className="space-y-4 mt-4">
              {tips && tips.length > 0 ? (
                <div className="space-y-3">
                  {tips.slice(0, 5).map((tip) => (
                    <div
                      key={tip.id}
                      className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 mb-1">
                            {tip.title}
                          </h4>
                          <p className="text-sm text-blue-800 mb-2">
                            {tip.content}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
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
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-muted-foreground mb-2">
                    Nenhuma dica disponível
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Continue usando o app para receber dicas personalizadas!
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Upgrade prompt para plano free */}
          {limits?.plan === 'free' && (
            <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 text-sm">
                <Crown className="w-4 h-4" />
                <span className="font-medium">Desbloqueie Análises Avançadas</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Planos Pro e Business incluem alertas mais detalhados, análises preditivas e insights personalizados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes do alerta */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert && (() => {
                const AlertIcon = getAlertIcon(selectedAlert.alert_type);
                return <AlertIcon className="h-5 w-5" />;
              })()}
              {selectedAlert?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={getAlertColor(selectedAlert.priority)}>
                  {selectedAlert.priority} prioridade
                </Badge>
                <Badge variant="outline">
                  {selectedAlert.alert_type?.replace('_', ' ')}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(selectedAlert.created_at).toLocaleString('pt-BR')}
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm leading-relaxed">
                  {selectedAlert.message}
                </p>
              </div>

              {canAccessAdvancedFeatures && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    Recomendações Personalizadas
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Considere revisar seu orçamento para essa categoria</li>
                    <li>• Defina alertas automáticos para gastos futuros</li>
                    <li>• Analise padrões de gastos dos últimos 3 meses</li>
                  </ul>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Fechar
                </Button>
                <div className="flex gap-2">
                  {!selectedAlert.is_read && (
                    <Button
                      variant="secondary"
                      onClick={() => handleMarkAsRead(selectedAlert.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como Lido
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteAlert(selectedAlert.id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}