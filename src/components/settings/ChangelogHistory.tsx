import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  GitBranch, 
  ChevronDown, 
  ChevronUp, 
  Calendar,
  CheckCircle,
  Sparkles,
  History,
  Tag
} from "lucide-react";
import { CHANGELOG, ChangelogEntry } from "@/config/changelog";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChangelogItemProps {
  entry: ChangelogEntry;
  isLatest: boolean;
  defaultOpen?: boolean;
}

function ChangelogItem({ entry, isLatest, defaultOpen = false }: ChangelogItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const formattedDate = (() => {
    try {
      return format(parseISO(entry.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return entry.date;
    }
  })();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`rounded-lg border transition-all ${isLatest ? 'border-primary/50 bg-primary/5' : 'bg-card hover:bg-muted/50'}`}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between text-left gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isLatest ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {isLatest ? <Sparkles className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-lg">v{entry.version}</span>
                  {isLatest && (
                    <Badge className="bg-primary/20 text-primary border-0 text-xs">
                      Atual
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{entry.notes}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0">
            {/* Data mobile */}
            <div className="sm:hidden flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </div>

            {/* Descrição resumida */}
            <div className="p-3 rounded-lg bg-muted/50 border mb-4">
              <p className="text-sm">{entry.notes}</p>
            </div>

            {/* Lista de mudanças */}
            {entry.changes && entry.changes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  O que mudou nesta versão
                </h4>
                <ul className="space-y-2">
                  {entry.changes.map((change, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="text-foreground">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function ChangelogHistory() {
  const [showAll, setShowAll] = useState(false);
  const displayedChangelog = showAll ? CHANGELOG : CHANGELOG.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Histórico de Atualizações
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Acompanhe todas as novidades e melhorias do Plenne
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 rounded-lg bg-muted/50 border">
            <span className="text-2xl font-bold text-primary">{CHANGELOG.length}</span>
            <p className="text-xs text-muted-foreground mt-1">Versões</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50 border">
            <span className="text-2xl font-bold text-primary">
              {CHANGELOG.reduce((acc, entry) => acc + (entry.changes?.length || 0), 0)}
            </span>
            <p className="text-xs text-muted-foreground mt-1">Melhorias</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50 border">
            <span className="text-2xl font-bold text-primary">{CHANGELOG[0]?.version || '-'}</span>
            <p className="text-xs text-muted-foreground mt-1">Versão Atual</p>
          </div>
        </div>

        {/* Lista de versões */}
        <div className="space-y-3">
          {displayedChangelog.map((entry, index) => (
            <ChangelogItem 
              key={entry.version} 
              entry={entry} 
              isLatest={index === 0}
              defaultOpen={index === 0}
            />
          ))}
        </div>

        {/* Botão ver mais */}
        {CHANGELOG.length > 3 && (
          <div className="pt-2">
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Mostrar menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Ver todas as {CHANGELOG.length} versões
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
