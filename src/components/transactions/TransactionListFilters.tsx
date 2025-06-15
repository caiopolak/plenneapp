
import React from "react";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionActionButtons } from "./TransactionActionButtons";

type Props = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterMonth: string;
  setFilterMonth: (month: string) => void;
  onExport: () => void;
  onImportSuccess: () => void;
  showForm: boolean;
  setShowForm: (open: boolean) => void;
};

export function TransactionListFilters({
  searchTerm, setSearchTerm,
  filterType, setFilterType,
  filterMonth, setFilterMonth,
  onExport, onImportSuccess,
  showForm, setShowForm,
}: Props) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="font-display text-[--primary] text-xl md:text-2xl">Transações</div>
        <TransactionActionButtons
          onExport={onExport}
          onImportSuccess={onImportSuccess}
          showForm={showForm}
          setShowForm={setShowForm}
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
          <SelectTrigger className="w-full md:w-40 font-text border-[--primary]/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-full md:w-40 font-text border-[--primary]/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os meses</SelectItem>
            <SelectItem value="2024-12">Dezembro 2024</SelectItem>
            <SelectItem value="2024-11">Novembro 2024</SelectItem>
            <SelectItem value="2024-10">Outubro 2024</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
