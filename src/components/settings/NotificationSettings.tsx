import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell, Clock, Mail, Smartphone } from "lucide-react";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useToast } from "@/hooks/use-toast";

export function NotificationSettings() {
  const { settings, loading, updateSettings } = useNotificationSettings();
  const { toast } = useToast();

  const handleSettingChange = async (key: string, value: boolean | string) => {
    const { error } = await updateSettings({ [key]: value });
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar as configurações"
      });
    } else {
      toast({
        title: "Sucesso!",
        description: "Configurações atualizadas"
      });
    }
  };

  if (loading) return <div>Carregando configurações...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferências de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Canais de notificação */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Canais de Notificação
            </h4>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push_enabled">Notificações Push no App</Label>
                <Switch
                  id="push_enabled"
                  checked={settings?.push_enabled}
                  onCheckedChange={(checked) => handleSettingChange('push_enabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email_enabled">Notificações por Email</Label>
                <Switch
                  id="email_enabled"
                  checked={settings?.email_enabled}
                  onCheckedChange={(checked) => handleSettingChange('email_enabled', checked)}
                />
              </div>
            </div>
          </div>

          {/* Tipos de alertas */}
          <div className="space-y-4">
            <h4 className="font-medium">Tipos de Alertas</h4>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="budget_alerts">Alertas de Orçamento</Label>
                <Switch
                  id="budget_alerts"
                  checked={settings?.budget_alerts}
                  onCheckedChange={(checked) => handleSettingChange('budget_alerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="goal_reminders">Lembretes de Metas</Label>
                <Switch
                  id="goal_reminders"
                  checked={settings?.goal_reminders}
                  onCheckedChange={(checked) => handleSettingChange('goal_reminders', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="transaction_notifications">Notificações de Transações</Label>
                <Switch
                  id="transaction_notifications"
                  checked={settings?.transaction_notifications}
                  onCheckedChange={(checked) => handleSettingChange('transaction_notifications', checked)}
                />
              </div>
            </div>
          </div>

          {/* Relatórios */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Relatórios Automáticos
            </h4>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="weekly_summary">Resumo Semanal</Label>
                <Switch
                  id="weekly_summary"
                  checked={settings?.weekly_summary}
                  onCheckedChange={(checked) => handleSettingChange('weekly_summary', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="monthly_report">Relatório Mensal</Label>
                <Switch
                  id="monthly_report"
                  checked={settings?.monthly_report}
                  onCheckedChange={(checked) => handleSettingChange('monthly_report', checked)}
                />
              </div>
            </div>
          </div>

          {/* Horário de lembretes */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário dos Lembretes
            </h4>
            <div className="flex items-center gap-2">
              <Label htmlFor="reminder_time">Enviar lembretes às:</Label>
              <Input
                id="reminder_time"
                type="time"
                value={settings?.reminder_time?.slice(0, 5) || '09:00'}
                onChange={(e) => handleSettingChange('reminder_time', e.target.value + ':00')}
                className="w-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}