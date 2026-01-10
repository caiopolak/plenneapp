
import React from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Users, Briefcase, Building2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ collapsed = false }: WorkspaceSwitcherProps) {
  const { workspaces, current, setCurrent, isLoading } = useWorkspace();
  const navigate = useNavigate();

  const getTypeIcon = (type?: string | null) => {
    switch (type) {
      case "family":
        return <Users className="w-4 h-4" />;
      case "business":
        return <Briefcase className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type?: string | null) => {
    switch (type) {
      case "family":
        return "Família";
      case "business":
        return "Empresa";
      default:
        return "Pessoal";
    }
  };

  const handleChange = (workspaceId: string) => {
    if (workspaceId === "__manage__") {
      navigate("/app/workspaces");
      return;
    }
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (ws) {
      setCurrent(ws);
    }
  };

  if (isLoading || workspaces.length === 0) {
    return null;
  }

  if (collapsed) {
    return (
      <div className="flex items-center justify-center p-2">
        <div
          className="p-2 rounded-lg bg-primary/10 text-primary"
          title={`Workspace: ${current?.name || "Nenhum"}`}
        >
          {getTypeIcon(current?.type)}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <Select value={current?.id || ""} onValueChange={handleChange}>
        <SelectTrigger
          className={cn(
            "w-full border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5",
            "hover:border-primary/50 focus:ring-primary/30",
            "h-10 rounded-lg"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {current && getTypeIcon(current.type)}
            <SelectValue placeholder="Selecione">
              <span className="truncate font-medium">{current?.name}</span>
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {workspaces.map((ws) => (
            <SelectItem key={ws.id} value={ws.id} className="cursor-pointer">
              <div className="flex items-center gap-2">
                {getTypeIcon(ws.type)}
                <div className="flex flex-col">
                  <span className="font-medium">{ws.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {getTypeLabel(ws.type)}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
          <SelectItem value="__manage__" className="cursor-pointer border-t mt-1 pt-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Settings className="w-4 h-4" />
              <span>Gerenciar Workspaces</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
