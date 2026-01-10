/**
 * Changelog do App Plenne
 * 
 * Este arquivo é atualizado automaticamente quando há mudanças no sistema.
 * A versão mais recente sempre fica no topo do array.
 */

export interface ChangelogEntry {
  version: string;
  date: string;
  notes: string;
  changes?: string[];
}


export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.3.0",
    date: "2025-01-10",
    notes: "Sistema de trial Pro, página de comparação de planos, contador real de IA e correções de segurança de temas",
    changes: [
      "Trial gratuito de 7 dias do plano Pro para novos usuários",
      "Nova página de comparação de planos (/app/plans) com tabela de features e depoimentos",
      "Contador real de perguntas do assistente IA no banco de dados com reset mensal",
      "Correção de restrição de temas por plano (usuários free não podem usar temas premium)",
      "Melhorias gerais de UX e CTAs de upgrade em todas as páginas"
    ]
  },
  {
    version: "2.1.0",
    date: "2025-01-08",
    notes: "Correções de cores no modo escuro e melhorias de UX nos workspaces",
    changes: [
      "Correções de cores no modo escuro",
      "Melhorias de UX em Workspaces"
    ]
  },
  {
    version: "2.0.0",
    date: "2025-01-07",
    notes: "Melhorias em Cards, dashboard principal, Melhorias de UX em Transações, Investimentos, entre outros Módulos",
    changes: [
      "Redesign dos Cards",
      "Dashboard principal melhorado",
      "UX aprimorada em Transações",
      "UX aprimorada em Investimentos"
    ]
  }
];

/**
 * Retorna a entrada mais recente do changelog
 */
export function getLatestRelease(): ChangelogEntry {
  return CHANGELOG[0];
}

/**
 * Retorna as notas da versão atual
 */
export function getCurrentReleaseNotes(): string {
  return CHANGELOG[0].notes;
}

/**
 * Retorna a versão atual do changelog
 */
export function getCurrentVersion(): string {
  return CHANGELOG[0].version;
}
