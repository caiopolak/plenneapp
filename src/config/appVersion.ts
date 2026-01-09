/**
 * Configuração de Versão do App Plenne
 * 
 * IMPORTANTE: Este arquivo deve ser atualizado manualmente a cada release.
 * 
 * Convenção de versionamento (SemVer):
 * - MAJOR: Mudanças incompatíveis ou redesign completo
 * - MINOR: Novas funcionalidades retrocompatíveis
 * - PATCH: Correções de bugs e pequenas melhorias
 * 
 * Exemplo de changelog:
 * - v2.2.0 - Novo sistema de alertas inteligentes
 * - v2.1.5 - Correção de cores no modo escuro
 */

export const APP_VERSION = {
  /** Versão atual do app (SemVer) */
  version: "2.2.0",
  
  /** Data do último deploy/release (formato: YYYY-MM-DD) */
  releaseDate: "2025-01-09",
  
  /** Build ID (pode ser gerado automaticamente ou manual) */
  buildId: "20250109-001",
  
  /** Notas da versão atual */
  releaseNotes: "Correções de cores no modo escuro e melhorias de UX nos workspaces",
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
 * Formata a data de release para exibição
 */
export function formatReleaseDate(): string {
  const date = new Date(APP_VERSION.releaseDate + "T00:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
