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
    version: "2.1.0",
    date: "2025-01-09",
    notes: "Correções de cores no modo escuro e melhorias de UX nos workspaces",
    changes: [
      "Correções de cores no modo escuro",
      "Melhorias de UX em Workspaces"
      "Nova funcionalidade de Módulos de Aprendizado",
      "Melhorias na Educação Financeira",
      "Alertas & Dicas Inteligentes aprimorados",
      "Melhorias gerais de UX"   
      "Redesign dos Cards",
      "Dashboard principal melhorado",
      "UX aprimorada em Transações",
      "UX aprimorada em Investimentos"      
    ]
  },
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
