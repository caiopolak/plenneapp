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
    version: "2.6.0",
    date: "2025-01-10",
    notes: "Sistema de convites por e-mail para workspaces e melhorias de colaboração",
    changes: [
      "Convites de workspace enviados por e-mail via Resend",
      "E-mails profissionais com domínio próprio @plenne.app",
      "Link de aceitar convite direto no e-mail",
      "Gestão de membros do workspace com papéis (Admin/Membro)",
      "Sistema de fallback automático para criação de workspace padrão",
      "Melhorias na persistência de seleção de workspace"
    ]
  },
  {
    version: "2.5.1",
    date: "2025-01-10",
    notes: "Preview de temas para todos os planos e badges de novidades",
    changes: [
      "Preview visual de temas ao passar o mouse (todos os planos podem visualizar)",
      "Badge 'Novo' no Assistente IA no menu lateral",
      "Badge 'Novo' na aba Aparência das configurações",
      "Temas bloqueados agora mostram preview antes de exigir upgrade",
      "Melhorias de UX na seleção de temas"
    ]
  },
  {
    version: "2.5.0",
    date: "2025-01-10",
    notes: "Assistente IA com streaming, histórico de conversas e exportação PDF/CSV",
    changes: [
      "Streaming de respostas em tempo real no Assistente Financeiro IA",
      "Histórico de conversas persistente com aba dedicada",
      "Exportação de conversas para PDF e CSV",
      "UI melhorada com contraste adequado para todas as cores de tema",
      "Integração com Lovable AI Gateway (google/gemini-3-flash-preview)",
      "Nova tabela de conversas e mensagens no banco de dados"
    ]
  },
  {
    version: "2.4.0",
    date: "2025-01-10",
    notes: "Banner de trial no dashboard, página FAQ, melhorias na landing page e tela de login",
    changes: [
      "Banner de trial Pro com contador regressivo no dashboard principal",
      "Nova página de FAQ com perguntas frequentes organizadas por categoria",
      "Landing page atualizada com informações precisas sobre planos e trial",
      "Tela de login melhorada com destaque para trial Pro de 7 dias",
      "Melhorias gerais de UX e navegação"
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
