import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileText,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataImportExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'transactions' | 'goals' | 'investments' | 'budgets';
  onImport: (file: File) => Promise<{ success: boolean; message: string; errors?: string[] }>;
  onExport: () => void;
  templateColumns: string[];
  exampleData: string[];
}

const typeLabels: Record<string, string> = {
  transactions: 'Transações',
  goals: 'Metas',
  investments: 'Investimentos',
  budgets: 'Orçamentos'
};

export function DataImportExportModal({
  open,
  onOpenChange,
  type,
  onImport,
  onExport,
  templateColumns,
  exampleData
}: DataImportExportModalProps) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    errors?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const result = await onImport(file);
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: 'Importação concluída',
          description: result.message
        });
      }
    } catch (error: any) {
      setImportResult({
        success: false,
        message: error.message || 'Erro ao importar arquivo'
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const BOM = '\uFEFF';
    const content = templateColumns.join(';') + '\n' + exampleData.join(';');
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modelo_${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    try {
      onExport();
      toast({
        title: 'Exportação concluída',
        description: `${typeLabels[type]} exportados com sucesso`
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro na exportação',
        description: error.message
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Importar/Exportar {typeLabels[type]}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Instruções de Importação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  O arquivo CSV deve conter as seguintes colunas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {templateColumns.map((col, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Baixar Modelo CSV
                </Button>
              </CardContent>
            </Card>

            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
            />

            <Button
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing ? 'Importando...' : 'Selecionar Arquivo CSV'}
            </Button>

            {importResult && (
              <Alert variant={importResult.success ? 'default' : 'destructive'}>
                {importResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <p className="font-medium">{importResult.message}</p>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <ScrollArea className="h-32 mt-2">
                      <ul className="text-xs space-y-1">
                        {importResult.errors.slice(0, 10).map((err, idx) => (
                          <li key={idx} className="text-destructive">• {err}</li>
                        ))}
                        {importResult.errors.length > 10 && (
                          <li className="text-muted-foreground">
                            ... e mais {importResult.errors.length - 10} erros
                          </li>
                        )}
                      </ul>
                    </ScrollArea>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Exportação de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Exporte todos os seus dados de {typeLabels[type].toLowerCase()} em formato CSV.
                  O arquivo será compatível com Excel e Google Sheets.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">Formato: CSV</Badge>
                  <Badge variant="secondary">Codificação: UTF-8</Badge>
                  <Badge variant="secondary">Separador: Ponto-e-vírgula</Badge>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar {typeLabels[type]} (CSV)
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
