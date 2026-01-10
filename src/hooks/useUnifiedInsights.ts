import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIntelligentAlerts, IntelligentAlert } from './useIntelligentAlerts';
import { useIntelligentTips, IntelligentTip } from './useIntelligentTips';
import { useChallenges, AutoChallengeSuggestion } from './useChallenges';

export type InsightType = 'alert' | 'tip' | 'challenge';

export interface UnifiedInsight {
  id: string;
  type: InsightType;
  title: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  icon: string;
  action_url?: string;
  is_read?: boolean;
  is_automatic: boolean;
  created_at: string;
  // Para challenges
  challenge_data?: AutoChallengeSuggestion;
  // Para tips
  difficulty?: string;
}

export function useUnifiedInsights() {
  const { alerts, loading: alertsLoading, markAsRead, deleteAlert, refetch: refetchAlerts, unreadCount } = useIntelligentAlerts();
  const { tips, loading: tipsLoading, refetch: refetchTips } = useIntelligentTips();
  const { autoSuggestions, isLoading: challengesLoading, acceptSuggestion } = useChallenges();

  const [filter, setFilter] = useState<InsightType | 'all'>('all');

  // Converter alertas para formato unificado
  const alertInsights: UnifiedInsight[] = useMemo(() => {
    return alerts.map(alert => ({
      id: alert.id,
      type: 'alert' as InsightType,
      title: alert.title,
      message: alert.message,
      category: alert.alert_type,
      priority: alert.priority,
      icon: getAlertIcon(alert.alert_type),
      action_url: alert.action_url,
      is_read: alert.is_read,
      is_automatic: alert.is_automatic,
      created_at: alert.created_at
    }));
  }, [alerts]);

  // Converter dicas para formato unificado
  const tipInsights: UnifiedInsight[] = useMemo(() => {
    return tips.slice(0, 5).map(tip => ({
      id: tip.id,
      type: 'tip' as InsightType,
      title: tip.title,
      message: tip.content,
      category: tip.category,
      priority: tip.priority,
      icon: getTipIcon(tip.category),
      action_url: tip.action_url,
      is_automatic: tip.is_automatic,
      difficulty: tip.difficulty_level,
      created_at: tip.created_at
    }));
  }, [tips]);

  // Converter sugestões de desafios para formato unificado
  const challengeInsights: UnifiedInsight[] = useMemo(() => {
    return autoSuggestions.slice(0, 3).map(suggestion => ({
      id: suggestion.id,
      type: 'challenge' as InsightType,
      title: suggestion.title,
      message: suggestion.description,
      category: suggestion.category,
      priority: suggestion.difficulty === 'hard' ? 'high' : suggestion.difficulty === 'medium' ? 'medium' : 'low',
      icon: suggestion.icon,
      is_automatic: true,
      created_at: new Date().toISOString(),
      challenge_data: suggestion
    }));
  }, [autoSuggestions]);

  // Combinar e ordenar insights
  const allInsights: UnifiedInsight[] = useMemo(() => {
    const combined = [...alertInsights, ...tipInsights, ...challengeInsights];
    
    // Ordenar por: não lidos primeiro, depois por prioridade, depois por data
    return combined.sort((a, b) => {
      // Não lidos primeiro (apenas para alertas)
      if (a.is_read !== undefined && b.is_read !== undefined) {
        if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
      }
      
      // Por prioridade
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const pA = priorityOrder[a.priority];
      const pB = priorityOrder[b.priority];
      if (pA !== pB) return pA - pB;
      
      // Por data
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [alertInsights, tipInsights, challengeInsights]);

  // Filtrar insights
  const filteredInsights = useMemo(() => {
    if (filter === 'all') return allInsights;
    return allInsights.filter(insight => insight.type === filter);
  }, [allInsights, filter]);

  // Estatísticas
  const stats = useMemo(() => ({
    total: allInsights.length,
    alerts: alertInsights.length,
    tips: tipInsights.length,
    challenges: challengeInsights.length,
    unreadAlerts: unreadCount,
    highPriority: allInsights.filter(i => i.priority === 'high').length
  }), [allInsights, alertInsights, tipInsights, challengeInsights, unreadCount]);

  const loading = alertsLoading || tipsLoading || challengesLoading;

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchAlerts(),
      refetchTips()
    ]);
  }, [refetchAlerts, refetchTips]);

  return {
    insights: filteredInsights,
    allInsights,
    stats,
    loading,
    filter,
    setFilter,
    // Ações para alertas
    markAlertAsRead: markAsRead,
    deleteAlert,
    // Ações para desafios
    acceptChallenge: acceptSuggestion,
    // Refetch
    refetch: refetchAll
  };
}

function getAlertIcon(type: string): string {
  switch (type) {
    case 'budget': return '💰';
    case 'spending': return '💸';
    case 'goal': return '🎯';
    case 'investment': return '📈';
    case 'tip': return '💡';
    case 'challenge': return '🏆';
    default: return '🔔';
  }
}

function getTipIcon(category: string): string {
  switch (category) {
    case 'budgeting': return '📊';
    case 'saving': return '💰';
    case 'investment': return '📈';
    case 'emergency_fund': return '🛡️';
    case 'spending': return '🛒';
    default: return '💡';
  }
}
