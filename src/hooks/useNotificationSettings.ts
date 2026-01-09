import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { safeLog } from '@/lib/security';

interface NotificationSettings {
  id?: string;
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  budget_alerts: boolean;
  goal_reminders: boolean;
  transaction_notifications: boolean;
  weekly_summary: boolean;
  monthly_report: boolean;
  reminder_time: string;
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings(data);
      } else {
        // Criar configurações padrão se não existir
        const defaultSettings = {
          user_id: user!.id,
          push_enabled: true,
          email_enabled: true,
          budget_alerts: true,
          goal_reminders: true,
          transaction_notifications: true,
          weekly_summary: true,
          monthly_report: true,
          reminder_time: '09:00:00'
        };
        
        const { data: newSettings, error: createError } = await supabase
          .from('notification_settings')
          .insert([defaultSettings])
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      }
    } catch (error) {
      safeLog('error', 'Error fetching notification settings', { error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .update(updates)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setSettings(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (error) {
      safeLog('error', 'Error updating notification settings', { error: String(error) });
      return { error };
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings
  };
}