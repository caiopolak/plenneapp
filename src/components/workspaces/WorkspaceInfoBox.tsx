
import React from "react";
import { Info } from "lucide-react";

export function WorkspaceInfoBox() {
  return (
    <div className="mb-6 p-4 bg-[hsl(var(--card-info-bg))] border border-[hsl(var(--card-info-border))] rounded-lg flex items-start gap-2 shadow">
      <Info className="text-[hsl(var(--card-info-accent))] mt-1 shrink-0" />
      <div>
        <p className="font-semibold text-[hsl(var(--card-info-text))] mb-1">O que são Workspaces?</p>
        <p className="text-sm text-[hsl(var(--card-info-text))]">
          <span className="block mb-1">
            <b>Workspaces</b> são ambientes organizados para separar diferentes conjuntos de informações e finanças dentro do Plenne.
          </span>
          • Use um workspace para separar suas contas pessoais, familiares ou de trabalho.<br />
          • Cada workspace tem membros, contas e dados independentes.<br /><br />
          <b>Edição & exclusão:</b> Clique no lápis para editar o nome ou no lixo para excluir.<br />
          <span className="text-[hsl(var(--card-error-accent))] font-semibold">
            Atenção: só é possível excluir workspaces extras e <b>todos os dados desse workspace serão apagados</b>.
          </span>
        </p>
      </div>
    </div>
  );
}
