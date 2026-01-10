import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Users, Briefcase, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  creating: boolean;
  newName: string;
  setNewName: (s: string) => void;
  newType: string;
  setNewType: (s: string) => void;
  onCreate: () => void;
  onCancel: () => void;
  setCreating: (b: boolean) => void;
}

const WORKSPACE_TYPES = [
  {
    value: "personal",
    label: "Pessoal",
    description: "Suas finanças individuais",
    icon: User,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    value: "family",
    label: "Família",
    description: "Compartilhe com familiares",
    icon: Users,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  {
    value: "business",
    label: "Empresa",
    description: "Gestão empresarial",
    icon: Briefcase,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
];

export function WorkspaceCreateForm({
  creating, newName, setNewName, newType, setNewType, onCreate, onCancel, setCreating
}: Props) {
  if (!creating) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCreating(true)}
        className="flex gap-2 mx-auto"
      >
        <Plus className="w-4 h-4" />
        Adicionar workspace
      </Button>
    );
  }

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Novo Workspace
            </CardTitle>
            <CardDescription>
              Crie um espaço para organizar suas finanças
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nome do Workspace */}
        <div className="space-y-2">
          <Label htmlFor="workspace-name">Nome do Workspace</Label>
          <Input
            id="workspace-name"
            autoFocus
            placeholder="Ex: Minha Família, Empresa XYZ..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="bg-background"
          />
        </div>

        {/* Tipo do Workspace */}
        <div className="space-y-2">
          <Label>Tipo do Workspace</Label>
          <RadioGroup
            value={newType}
            onValueChange={setNewType}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {WORKSPACE_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = newType === type.value;
              
              return (
                <Label
                  key={type.value}
                  htmlFor={`type-${type.value}`}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                    "hover:shadow-md hover:scale-[1.02]",
                    isSelected 
                      ? `${type.bgColor} ${type.borderColor} shadow-md` 
                      : "bg-card border-border hover:border-primary/30"
                  )}
                >
                  <RadioGroupItem
                    value={type.value}
                    id={`type-${type.value}`}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors",
                    isSelected ? type.bgColor : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-6 h-6",
                      isSelected ? type.color : "text-muted-foreground"
                    )} />
                  </div>
                  <span className={cn(
                    "font-semibold text-sm",
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {type.label}
                  </span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    {type.description}
                  </span>
                </Label>
              );
            })}
          </RadioGroup>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            variant="cta"
            onClick={onCreate}
            disabled={!newName.trim()}
          >
            <Plus className="w-4 h-4 mr-1" />
            Criar Workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
