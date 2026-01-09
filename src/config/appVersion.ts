/**
 * Configuração de Versão do App Plenne
 * 
 * VERSÃO: Atualize manualmente a cada release significativo.
 * BUILD e DATA: Gerados automaticamente a cada deploy/publicação.
 * 
 * Convenção de versionamento (SemVer):
 * - MAJOR: Mudanças incompatíveis ou redesign completo
 * - MINOR: Novas funcionalidades retrocompatíveis
 * - PATCH: Correções de bugs e pequenas melhorias
 */

// Declaração de tipos para variáveis injetadas pelo Vite
declare const __BUILD_DATE__: string;
declare const __BUILD_ID__: string;

/** Versão manual - atualize quando fizer mudanças significativas */
const MANUAL_VERSION = "2.2.0";

/** Notas da versão atual - atualize junto com a versão */
const RELEASE_NOTES = "Corrigido e atualizado nova funcionalidade de MODULOS DE APRENDIZADO, Educação Financeira e Alertas & Dicas Inteligentes,, alem de melhorias no UX";
const RELEASE_NOTES = "Correções de cores no modo escuro e melhorias de UX nos workspaces";
const RELEASE_NOTES = "Melhorias em Cards, dashboard principal, Melhorias de UX em Transações,Investimentos, entre outros Modulos"

export const APP_VERSION = {
  /** Versão atual do app (SemVer) - MANUAL */
  version: MANUAL_VERSION,
  
  /** Data/hora do build (automático a cada deploy) */
  buildDate: typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : new Date().toISOString(),
  
  /** Build ID único (automático a cada deploy) */
  buildId: typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : "dev",
  
  /** Notas da versão atual - MANUAL */
  releaseNotes: RELEASE_NOTES,
} as const;

/**
 * Detecta o ambiente atual baseado na URL
 */
export function getEnvironment(): "development" | "staging" | "production" {
  if (typeof window === "undefined") return "production";
  
  const hostname = window.location.hostname;
  
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "development";
  }
  
  if (hostname.includes("preview") || hostname.includes("staging") || hostname.includes("lovableproject.com")) {
    return "staging";
  }
  
  return "production";
}

/**
 * Retorna label amigável do ambiente
 */
export function getEnvironmentLabel(): string {
  const env = getEnvironment();
  
  switch (env) {
    case "development":
      return "Desenvolvimento";
    case "staging":
      return "Preview";
    case "production":
      return "Produção";
  }
}

/**
 * Formata a data de build para exibição
 */
export function formatBuildDate(): string {
  const date = new Date(APP_VERSION.buildDate);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
