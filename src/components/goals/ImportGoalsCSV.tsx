
import React from "react";

// Placeholder simples - troque por lógica real quando quiser importar metas de CSV!
export function ImportGoalsCSV({ onSuccess }: { onSuccess: () => void }) {
  return (
    <div className="p-2">
      <div className="text-sm text-muted-foreground mb-2">
        (Funcionalidade de importação de CSV de metas em breve.)
      </div>
      <button
        type="button"
        className="px-4 py-2 rounded bg-[--secondary] text-white font-semibold"
        onClick={onSuccess}
      >
        Simular Importação
      </button>
    </div>
  );
}
