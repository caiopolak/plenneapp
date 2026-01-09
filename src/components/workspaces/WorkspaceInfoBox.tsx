
import React from "react";
import { Info, Users, Briefcase, Home, AlertTriangle, Pencil, Trash2 } from "lucide-react";

export function WorkspaceInfoBox() {
  return (
    <div className="mb-6 p-5 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3 shadow-sm">
      <div className="p-2 rounded-full bg-primary/10 shrink-0">
        <Info className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground text-lg">O que são Workspaces?</h3>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Workspaces</strong> são espaços independentes para organizar suas finanças por contexto — pessoal, família ou empresa.
        </p>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            <Home className="h-3.5 w-3.5" /> Pessoal
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Família
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5" /> Empresa
          </span>
        </div>

        <div className="pt-2 border-t border-border/50 space-y-2 text-sm">
          <p className="flex items-center gap-2 text-muted-foreground">
            <Pencil className="h-3.5 w-3.5 text-primary" />
            <span>Clique no <strong className="text-foreground">lápis</strong> para renomear</span>
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
            <span>Clique na <strong className="text-foreground">lixeira</strong> para excluir</span>
          </p>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">
            <strong>Atenção:</strong> Ao excluir um workspace, todos os dados (transações, metas, orçamentos) serão permanentemente apagados.
          </p>
        </div>
      </div>
    </div>
  );
}
