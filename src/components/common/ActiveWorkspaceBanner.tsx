
import React from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { User, Users, Briefcase, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActiveWorkspaceBannerProps {
  className?: string;
}

export function ActiveWorkspaceBanner({ className }: ActiveWorkspaceBannerProps) {
  const { current, isLoading } = useWorkspace();

  const getTypeIcon = (type?: string | null) => {
    switch (type) {
      case "family":
        return <Users className="w-3.5 h-3.5" />;
      case "business":
        return <Briefcase className="w-3.5 h-3.5" />;
      default:
        return <User className="w-3.5 h-3.5" />;
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

  if (isLoading || !current) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 ${className || ""}`}
    >
      {getTypeIcon(current.type)}
      <span className="font-medium truncate max-w-[150px]">{current.name}</span>
      <span className="text-[10px] text-muted-foreground">({getTypeLabel(current.type)})</span>
    </Badge>
  );
}
