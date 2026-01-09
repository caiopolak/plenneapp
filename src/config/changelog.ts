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
    version: "2.2.0",
    date: "2025-01-09",
    notes: "Corrigido e atualizado nova funcionalidade de MODULOS DE APRENDIZADO, Educação Financeira e Alertas & Dicas Inteligentes, além de melhorias no UX",
    changes: [
      "Nova funcionalidade de Módulos de Aprendizado",
      "Melhorias na Educação Financeira",
      "Alertas & Dicas Inteligentes aprimorados",
      "Melhorias gerais de UX"
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
