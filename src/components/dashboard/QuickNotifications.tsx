
import React from "react";
import { Button } from "@/components/ui/button";
import { BellRing, Plus } from "lucide-react";

export function QuickNotifications({ onAddTransaction }: { onAddTransaction: () => void }) {
  return (
    <div className="flex gap-2 flex-row-reverse">
      <Button variant="default" className="flex items-center gap-2 border border-emerald-700" onClick={onAddTransaction}>
        <Plus className="w-5 h-5" /> Nova Transação
      </Button>
      <Button variant="outline" className="flex items-center gap-2 border border-yellow-400 text-yellow-600 hover:bg-yellow-100">
        <BellRing className="w-5 h-5" /> Notificações
      </Button>
    </div>
  );
}
