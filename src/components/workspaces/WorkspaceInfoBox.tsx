
import React from "react";
import { Info } from "lucide-react";

export function WorkspaceInfoBox() {
  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2 shadow">
      <Info className="text-blue-500 mt-1 shrink-0" />
      <div>
        <p className="font-semibold text-blue-800 mb-1">O que são Workspaces?</p>
        <p className="text-sm text-blue-700">
          <span className="block mb-1">
            <b>Workspaces</b> são ambientes organizados para separar diferentes conjuntos de informações e finanças dentro do Plenne.
          </span>
          • Use um workspace para separar suas contas pessoais, familiares ou de trabalho.<br />
          • Cada workspace tem membros, contas e dados independentes.<br /><br />
          <b>Edição & exclusão:</b> Clique no lápis para editar o nome ou no lixo para excluir.<br />
          <span className="text-red-700 font-semibold">
            Atenção: só é possível excluir workspaces extras e <b>todos os dados desse workspace serão apagados</b>.
          </span>
        </p>
      </div>
    </div>
  );
}
