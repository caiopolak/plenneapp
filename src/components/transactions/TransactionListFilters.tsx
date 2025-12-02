import React from "react";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionActionButtons } from "./TransactionActionButtons";
import { TransactionExport } from "@/utils/dataExport";

type Props = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterMonth: string;
  setFilterMonth: (month: string) => void;
  onImportSuccess: () => void;
  showForm: boolean;
  setShowForm: (open: boolean) => void;
  transactions?: TransactionExport[];
};

export function TransactionListFilters({
  searchTerm, setSearchTerm,
  filterType, setFilterType,
  filterMonth, setFilterMonth,
  onImportSuccess,
  showForm, setShowForm,
  transactions = [],
}: Props) {
  // Gerar opções de meses dinamicamente
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="font-display text-primary text-xl md:text-2xl">Transações</div>
        <TransactionActionButtons
          onImportSuccess={onImportSuccess}
          showForm={showForm}
          setShowForm={setShowForm}
          transactions={transactions}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4 mt-2">
        <div className="flex-1">
          <Input
            placeholder="Buscar transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full font-text"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-40 font-text border-primary/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-full md:w-48 font-text border-primary/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os meses</SelectItem>
            {monthOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
