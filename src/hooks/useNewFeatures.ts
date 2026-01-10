/**
 * Hook para gerenciar badges de features novas
 * 
 * Sistema híbrido:
 * 1. Badge aparece se a feature foi lançada nos últimos 14 dias
 * 2. Badge desaparece quando o usuário visita a página
 * 3. Estado de visitas é persistido no localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getFeatureNewInfo, FEATURE_URL_MAP, NEW_FEATURE_DAYS } from '@/config/newFeatures';

const STORAGE_KEY = 'plenne_visited_features';

interface VisitedFeatures {
  [url: string]: {
    visitedAt: string;
    version: string;
  };
}

function getVisitedFeatures(): VisitedFeatures {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveVisitedFeatures(visited: VisitedFeatures): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visited));
  } catch {
    // localStorage não disponível
  }
}

// Limpar badges de versões antigas ao inicializar
function cleanupOldVisits(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const visited = JSON.parse(stored) as VisitedFeatures;
    const cleaned = Object.entries(visited).reduce((acc, [key, val]) => {
      const visitDate = new Date(val.visitedAt);
      const daysSinceVisit = Math.floor((Date.now() - visitDate.getTime()) / (24 * 60 * 60 * 1000));
      // Manter apenas visitas recentes (menos de 7 dias para garantir badges apareçam)
      if (daysSinceVisit < 7) {
        acc[key] = val;
      }
      return acc;
    }, {} as VisitedFeatures);
    
    // Só salvar se algo foi removido
    if (Object.keys(cleaned).length !== Object.keys(visited).length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
  } catch {
    // Ignore
  }
}

export function useNewFeatures() {
  const location = useLocation();
  
  // Limpar visitas antigas na inicialização
  useEffect(() => {
    cleanupOldVisits();
  }, []);
  
  const [visitedFeatures, setVisitedFeatures] = useState<VisitedFeatures>(getVisitedFeatures);

  // Marcar página atual como visitada
  useEffect(() => {
    const currentPath = location.pathname;
    const featureInfo = getFeatureNewInfo(currentPath);
    
    // Se a feature é nova e ainda não foi visitada nessa versão
    if (featureInfo.isNew && featureInfo.latestVersion) {
      const visited = getVisitedFeatures();
      const previousVisit = visited[currentPath];
      
      // Só marca como visitada se não visitou ou se visitou em versão anterior
      if (!previousVisit || previousVisit.version !== featureInfo.latestVersion) {
        // Limpar automaticamente visitas de versões antigas para mostrar badges novos
        // Também limpar visitas com mais de 30 dias para permitir re-exibição
        const cleanedVisited = Object.entries(visited).reduce((acc, [key, val]) => {
          const visitDate = new Date(val.visitedAt);
          const daysSinceVisit = Math.floor((Date.now() - visitDate.getTime()) / (24 * 60 * 60 * 1000));
          // Manter apenas visitas recentes (menos de 30 dias)
          if (daysSinceVisit < 30) {
            acc[key] = val;
          }
          return acc;
        }, {} as VisitedFeatures);
        
        const updated = {
          ...cleanedVisited,
          [currentPath]: {
            visitedAt: new Date().toISOString(),
            version: featureInfo.latestVersion
          }
        };
        saveVisitedFeatures(updated);
        setVisitedFeatures(updated);
      }
    }
  }, [location.pathname]);

  /**
   * Verifica se uma URL deve mostrar o badge "Novo"
   * Retorna true se:
   * 1. A feature foi lançada nos últimos X dias
   * 2. O usuário ainda não visitou essa página desde o lançamento
   */
  const shouldShowNewBadge = useCallback((url: string): boolean => {
    const featureInfo = getFeatureNewInfo(url);
    
    // Se não é nova por data, não mostra
    if (!featureInfo.isNew || !featureInfo.latestVersion) {
      return false;
    }
    
    // Verificar se o usuário já visitou essa versão
    const visited = visitedFeatures[url];
    if (visited && visited.version === featureInfo.latestVersion) {
      return false;
    }
    
    return true;
  }, [visitedFeatures]);

  /**
   * Retorna informações detalhadas sobre o badge
   */
  const getNewBadgeInfo = useCallback((url: string): {
    show: boolean;
    version: string | null;
    daysRemaining: number | null;
  } => {
    const featureInfo = getFeatureNewInfo(url);
    
    if (!featureInfo.isNew || !featureInfo.latestVersion) {
      return { show: false, version: null, daysRemaining: null };
    }
    
    const visited = visitedFeatures[url];
    if (visited && visited.version === featureInfo.latestVersion) {
      return { show: false, version: null, daysRemaining: null };
    }
    
    const daysRemaining = featureInfo.releasedDaysAgo !== null 
      ? NEW_FEATURE_DAYS - featureInfo.releasedDaysAgo 
      : null;
    
    return {
      show: true,
      version: featureInfo.latestVersion,
      daysRemaining
    };
  }, [visitedFeatures]);

  /**
   * Limpar histórico de visitas (para testes)
   */
  const clearVisitedFeatures = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setVisitedFeatures({});
  }, []);

  /**
   * Retorna contagem total de features novas não visitadas
   */
  const getNewFeaturesCount = useCallback((): number => {
    return FEATURE_URL_MAP.filter(f => shouldShowNewBadge(f.url)).length;
  }, [shouldShowNewBadge]);

  return {
    shouldShowNewBadge,
    getNewBadgeInfo,
    clearVisitedFeatures,
    getNewFeaturesCount
  };
}
