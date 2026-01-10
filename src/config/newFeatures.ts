/**
 * Sistema de Features Novas
 * 
 * Mapeia features do changelog para URLs do app.
 * Usado para exibir badges "Novo" automaticamente baseado em:
 * 1. Tempo desde o lançamento (14 dias)
 * 2. Se o usuário já visitou a feature
 */

import { CHANGELOG } from './changelog';

// Mapeamento de features para URLs
// Cada entrada mapeia uma URL para as versões que trouxeram novidades
export interface FeatureMapping {
  url: string;
  versions: string[]; // Versões que trouxeram features para essa URL
  keywords?: string[]; // Palavras-chave para detectar automaticamente no changelog
}

export const FEATURE_URL_MAP: FeatureMapping[] = [
  {
    url: "/app/reports",
    versions: ["2.4.0", "2.5.0"],
    keywords: ["relatório", "report", "pdf", "exportação"]
  },
  {
    url: "/app/assistant",
    versions: ["2.5.0", "2.5.1"],
    keywords: ["assistente", "ia", "ai", "gemini", "streaming"]
  },
  {
    url: "/app/education",
    versions: ["2.4.0"],
    keywords: ["educação", "curso", "aula", "aprender", "módulo"]
  },
  {
    url: "/app/alerts",
    versions: ["2.4.0"],
    keywords: ["alerta", "notificação", "aviso"]
  },
  {
    url: "/app/workspaces",
    versions: ["2.6.0"],
    keywords: ["workspace", "convite", "membro", "colaboração"]
  },
  {
    url: "/app/settings",
    versions: ["2.5.1"],
    keywords: ["tema", "aparência", "configuração"]
  },
  {
    url: "/app/goals",
    versions: [],
    keywords: ["meta", "objetivo", "aporte"]
  },
  {
    url: "/app/investments",
    versions: [],
    keywords: ["investimento", "carteira", "ativo"]
  }
];

// Número de dias que uma feature é considerada "nova"
export const NEW_FEATURE_DAYS = 14;

/**
 * Verifica se uma feature é nova baseado na data de lançamento
 */
export function isFeatureNewByDate(versions: string[]): boolean {
  if (versions.length === 0) return false;
  
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - NEW_FEATURE_DAYS * 24 * 60 * 60 * 1000);
  
  // Verificar se alguma das versões foi lançada nos últimos X dias
  for (const version of versions) {
    const entry = CHANGELOG.find(c => c.version === version);
    if (entry) {
      try {
        const releaseDate = new Date(entry.date);
        if (releaseDate >= cutoffDate) {
          return true;
        }
      } catch {
        // Data inválida, ignorar
      }
    }
  }
  
  return false;
}

/**
 * Detecta automaticamente versões relacionadas a uma URL baseado em keywords
 */
export function detectVersionsForUrl(url: string): string[] {
  const mapping = FEATURE_URL_MAP.find(f => f.url === url);
  if (!mapping) return [];
  
  const detectedVersions = new Set<string>(mapping.versions);
  
  // Buscar no changelog por keywords
  if (mapping.keywords && mapping.keywords.length > 0) {
    for (const entry of CHANGELOG) {
      const allText = [
        entry.notes,
        ...(entry.changes || [])
      ].join(' ').toLowerCase();
      
      const hasKeyword = mapping.keywords.some(kw => 
        allText.includes(kw.toLowerCase())
      );
      
      if (hasKeyword) {
        detectedVersions.add(entry.version);
      }
    }
  }
  
  return Array.from(detectedVersions);
}

/**
 * Retorna informações sobre uma feature nova
 */
export function getFeatureNewInfo(url: string): {
  isNew: boolean;
  latestVersion: string | null;
  releasedDaysAgo: number | null;
} {
  const versions = detectVersionsForUrl(url);
  
  if (versions.length === 0) {
    return { isNew: false, latestVersion: null, releasedDaysAgo: null };
  }
  
  // Encontrar a versão mais recente
  let latestEntry: { version: string; date: string } | null = null;
  
  for (const version of versions) {
    const entry = CHANGELOG.find(c => c.version === version);
    if (entry) {
      if (!latestEntry || entry.date > latestEntry.date) {
        latestEntry = { version: entry.version, date: entry.date };
      }
    }
  }
  
  if (!latestEntry) {
    return { isNew: false, latestVersion: null, releasedDaysAgo: null };
  }
  
  const releaseDate = new Date(latestEntry.date);
  const now = new Date();
  const daysAgo = Math.floor((now.getTime() - releaseDate.getTime()) / (24 * 60 * 60 * 1000));
  
  return {
    isNew: daysAgo <= NEW_FEATURE_DAYS,
    latestVersion: latestEntry.version,
    releasedDaysAgo: daysAgo
  };
}
