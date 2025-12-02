// Utilitários centralizados para importação de dados

export interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

export interface FieldMapping<T> {
  csvHeader: string;
  field: keyof T;
  required: boolean;
  transform?: (value: string) => any;
  validate?: (value: any) => boolean;
}

// Parser de CSV robusto
export function parseCSV(content: string): Record<string, string>[] {
  const lines = content
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const [headerLine, ...dataLines] = lines;
  
  // Detectar separador (vírgula ou ponto-e-vírgula)
  const separator = headerLine.includes(';') ? ';' : ',';
  
  const headers = headerLine.split(separator).map(h => 
    h.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  );

  return dataLines.map(line => {
    const values = parseCSVLine(line, separator);
    return Object.fromEntries(
      headers.map((h, idx) => [h, values[idx]?.trim() || ''])
    );
  });
}

// Parser de linha CSV com suporte a aspas
function parseCSVLine(line: string, separator: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// Transformadores comuns
export const transforms = {
  toNumber: (value: string): number => {
    const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  },
  
  toDate: (value: string): string | null => {
    if (!value) return null;
    
    // Tenta diferentes formatos de data
    const formats = [
      // DD/MM/YYYY
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      // YYYY-MM-DD
      /^(\d{4})-(\d{2})-(\d{2})$/,
      // DD-MM-YYYY
      /^(\d{2})-(\d{2})-(\d{4})$/,
    ];

    for (const format of formats) {
      const match = value.match(format);
      if (match) {
        let year, month, day;
        
        if (format === formats[0] || format === formats[2]) {
          [, day, month, year] = match;
        } else {
          [, year, month, day] = match;
        }
        
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    return null;
  },
  
  toBoolean: (value: string): boolean => {
    const lower = value.toLowerCase();
    return ['true', 'sim', 'yes', '1', 'verdadeiro'].includes(lower);
  },
  
  toString: (value: string): string => value.trim(),
  
  toType: (value: string): string => {
    const lower = value.toLowerCase();
    if (['receita', 'income', 'entrada'].includes(lower)) return 'income';
    if (['despesa', 'expense', 'saida', 'saída'].includes(lower)) return 'expense';
    return lower;
  },

  toPriority: (value: string): string => {
    const lower = value.toLowerCase();
    if (['alta', 'high', '1'].includes(lower)) return 'high';
    if (['baixa', 'low', '3'].includes(lower)) return 'low';
    return 'medium';
  },

  toInvestmentType: (value: string): string => {
    const typeMap: Record<string, string> = {
      'acoes': 'stocks',
      'ações': 'stocks',
      'titulos': 'bonds',
      'títulos': 'bonds',
      'criptomoedas': 'crypto',
      'crypto': 'crypto',
      'imoveis': 'real_estate',
      'imóveis': 'real_estate',
      'fundos': 'funds',
      'poupanca': 'savings',
      'poupança': 'savings',
    };
    const lower = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return typeMap[lower] || value.toLowerCase();
  },
};

// Importador genérico com validação
export function importData<T>(
  csvData: Record<string, string>[],
  mappings: FieldMapping<T>[],
  additionalValidation?: (item: Partial<T>) => string | null
): ImportResult<T> {
  const errors: string[] = [];
  const validData: T[] = [];

  csvData.forEach((row, index) => {
    const rowNum = index + 2; // +2 para contar header e 1-indexed
    const item: Partial<T> = {};
    let rowValid = true;

    for (const mapping of mappings) {
      // Normalizar header para busca
      const normalizedHeader = mapping.csvHeader.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      // Buscar valor no CSV
      let value = row[normalizedHeader];
      
      // Tentar variações do header se não encontrar
      if (value === undefined) {
        const altHeaders = Object.keys(row).filter(k => 
          k.includes(normalizedHeader) || normalizedHeader.includes(k)
        );
        if (altHeaders.length > 0) {
          value = row[altHeaders[0]];
        }
      }

      // Verificar se campo obrigatório está presente
      if (mapping.required && (!value || value.trim() === '')) {
        errors.push(`Linha ${rowNum}: Campo "${mapping.csvHeader}" é obrigatório`);
        rowValid = false;
        continue;
      }

      // Aplicar transformação
      let transformedValue = value || '';
      if (mapping.transform && value) {
        transformedValue = mapping.transform(value);
      }

      // Validar valor
      if (mapping.validate && !mapping.validate(transformedValue)) {
        errors.push(`Linha ${rowNum}: Valor inválido para "${mapping.csvHeader}"`);
        rowValid = false;
        continue;
      }

      item[mapping.field] = transformedValue as any;
    }

    // Validação adicional
    if (rowValid && additionalValidation) {
      const additionalError = additionalValidation(item);
      if (additionalError) {
        errors.push(`Linha ${rowNum}: ${additionalError}`);
        rowValid = false;
      }
    }

    if (rowValid) {
      validData.push(item as T);
    }
  });

  return {
    success: errors.length === 0,
    data: validData,
    errors,
    totalRows: csvData.length,
    validRows: validData.length
  };
}

// ============ MAPEAMENTOS ESPECÍFICOS ============

// Mapeamento para Transações
export interface TransactionImport {
  amount: number;
  category: string;
  type: string;
  date: string;
  description?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  recurrence_end_date?: string;
}

export const transactionMappings: FieldMapping<TransactionImport>[] = [
  { csvHeader: 'valor', field: 'amount', required: true, transform: transforms.toNumber, validate: v => v > 0 },
  { csvHeader: 'amount', field: 'amount', required: false, transform: transforms.toNumber },
  { csvHeader: 'categoria', field: 'category', required: true, transform: transforms.toString },
  { csvHeader: 'category', field: 'category', required: false, transform: transforms.toString },
  { csvHeader: 'tipo', field: 'type', required: true, transform: transforms.toType },
  { csvHeader: 'type', field: 'type', required: false, transform: transforms.toType },
  { csvHeader: 'data', field: 'date', required: true, transform: transforms.toDate },
  { csvHeader: 'date', field: 'date', required: false, transform: transforms.toDate },
  { csvHeader: 'descricao', field: 'description', required: false, transform: transforms.toString },
  { csvHeader: 'description', field: 'description', required: false, transform: transforms.toString },
  { csvHeader: 'recorrente', field: 'is_recurring', required: false, transform: transforms.toBoolean },
  { csvHeader: 'is_recurring', field: 'is_recurring', required: false, transform: transforms.toBoolean },
  { csvHeader: 'padrao_recorrencia', field: 'recurrence_pattern', required: false, transform: transforms.toString },
  { csvHeader: 'recurrence_pattern', field: 'recurrence_pattern', required: false, transform: transforms.toString },
];

// Mapeamento para Metas
export interface GoalImport {
  name: string;
  target_amount: number;
  current_amount?: number;
  priority?: string;
  target_date?: string;
  note?: string;
}

export const goalMappings: FieldMapping<GoalImport>[] = [
  { csvHeader: 'nome', field: 'name', required: true, transform: transforms.toString },
  { csvHeader: 'name', field: 'name', required: false, transform: transforms.toString },
  { csvHeader: 'valor alvo', field: 'target_amount', required: true, transform: transforms.toNumber, validate: v => v > 0 },
  { csvHeader: 'target_amount', field: 'target_amount', required: false, transform: transforms.toNumber },
  { csvHeader: 'valor atual', field: 'current_amount', required: false, transform: transforms.toNumber },
  { csvHeader: 'current_amount', field: 'current_amount', required: false, transform: transforms.toNumber },
  { csvHeader: 'prioridade', field: 'priority', required: false, transform: transforms.toPriority },
  { csvHeader: 'priority', field: 'priority', required: false, transform: transforms.toPriority },
  { csvHeader: 'data limite', field: 'target_date', required: false, transform: transforms.toDate },
  { csvHeader: 'target_date', field: 'target_date', required: false, transform: transforms.toDate },
  { csvHeader: 'observacao', field: 'note', required: false, transform: transforms.toString },
  { csvHeader: 'note', field: 'note', required: false, transform: transforms.toString },
];

// Mapeamento para Investimentos
export interface InvestmentImport {
  name: string;
  type: string;
  amount: number;
  expected_return?: number;
  purchase_date?: string;
}

export const investmentMappings: FieldMapping<InvestmentImport>[] = [
  { csvHeader: 'nome', field: 'name', required: true, transform: transforms.toString },
  { csvHeader: 'name', field: 'name', required: false, transform: transforms.toString },
  { csvHeader: 'tipo', field: 'type', required: true, transform: transforms.toInvestmentType },
  { csvHeader: 'type', field: 'type', required: false, transform: transforms.toInvestmentType },
  { csvHeader: 'valor', field: 'amount', required: true, transform: transforms.toNumber, validate: v => v > 0 },
  { csvHeader: 'valor investido', field: 'amount', required: false, transform: transforms.toNumber },
  { csvHeader: 'amount', field: 'amount', required: false, transform: transforms.toNumber },
  { csvHeader: 'retorno esperado', field: 'expected_return', required: false, transform: transforms.toNumber },
  { csvHeader: 'expected_return', field: 'expected_return', required: false, transform: transforms.toNumber },
  { csvHeader: 'data compra', field: 'purchase_date', required: false, transform: transforms.toDate },
  { csvHeader: 'data da compra', field: 'purchase_date', required: false, transform: transforms.toDate },
  { csvHeader: 'purchase_date', field: 'purchase_date', required: false, transform: transforms.toDate },
];

// Mapeamento para Orçamentos
export interface BudgetImport {
  category: string;
  amount_limit: number;
  month: number;
  year: number;
}

export const budgetMappings: FieldMapping<BudgetImport>[] = [
  { csvHeader: 'categoria', field: 'category', required: true, transform: transforms.toString },
  { csvHeader: 'category', field: 'category', required: false, transform: transforms.toString },
  { csvHeader: 'limite', field: 'amount_limit', required: true, transform: transforms.toNumber, validate: v => v > 0 },
  { csvHeader: 'amount_limit', field: 'amount_limit', required: false, transform: transforms.toNumber },
  { csvHeader: 'mes', field: 'month', required: true, transform: transforms.toNumber, validate: v => v >= 1 && v <= 12 },
  { csvHeader: 'month', field: 'month', required: false, transform: transforms.toNumber },
  { csvHeader: 'ano', field: 'year', required: true, transform: transforms.toNumber, validate: v => v >= 2000 && v <= 2100 },
  { csvHeader: 'year', field: 'year', required: false, transform: transforms.toNumber },
];
