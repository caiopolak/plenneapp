
import React from "react";
import { cn } from "@/lib/utils";
import { TransactionTypeField } from "./TransactionTypeField";
import { TransactionAmountField } from "./TransactionAmountField";
import { TransactionCategoryField } from "./TransactionCategoryField";
import { TransactionDateField } from "./TransactionDateField";
import { TransactionDescriptionField } from "./TransactionDescriptionField";
import { TransactionRecurrenceFields } from "./TransactionRecurrenceFields";

interface TransactionFieldsGroupProps {
  type: string;
  setType: (type: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  category: string;
  setCategory: (cat: string) => void;
  date: Date;
  setDate: (d: Date) => void;
  description: string;
  setDescription: (desc: string) => void;
  isRecurring: boolean;
  setIsRecurring: (v: boolean) => void;
  recurrencePattern: string;
  setRecurrencePattern: (v: string) => void;
  recurrenceEndDate: string;
  setRecurrenceEndDate: (value: string) => void;
  isMobile: boolean;
  /** Deprecated - use mode instead */
  isScheduled?: boolean;
  canUseRecurring?: boolean;
  /** Current form mode: immediate (add now) or scheduled */
  mode?: 'immediate' | 'scheduled';
}

export function TransactionFieldsGroup({
  type, setType,
  amount, setAmount,
  category, setCategory,
  date, setDate,
  description, setDescription,
  isRecurring, setIsRecurring,
  recurrencePattern, setRecurrencePattern,
  recurrenceEndDate, setRecurrenceEndDate,
  isMobile,
  isScheduled = false,
  canUseRecurring = true,
  mode = 'immediate',
}: TransactionFieldsGroupProps) {
  // Determine if we should show date field
  // Only show date picker in scheduled mode or when editing recurring transactions
  const showDateField = mode === 'scheduled' || isRecurring;
  
  return (
    <div className="space-y-4">
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
      )}>
        <TransactionTypeField value={type} onChange={setType} isMobile={isMobile} />
        <TransactionAmountField value={amount} onChange={setAmount} isMobile={isMobile} />
      </div>
      
      <TransactionCategoryField type={type} value={category} onChange={setCategory} isMobile={isMobile} />
      
      {/* Date field - only show in scheduled mode or when recurring is active */}
      {showDateField && (
        <TransactionDateField 
          value={date} 
          onChange={setDate} 
          isMobile={isMobile}
        />
      )}
      
      <TransactionDescriptionField value={description} onChange={setDescription} isMobile={isMobile} />
      
      {/* Recurrence fields - only show in immediate mode (for instant recurring) or scheduled mode */}
      <TransactionRecurrenceFields
        isRecurring={isRecurring}
        setIsRecurring={setIsRecurring}
        recurrencePattern={recurrencePattern}
        setRecurrencePattern={setRecurrencePattern}
        recurrenceEndDate={recurrenceEndDate}
        setRecurrenceEndDate={setRecurrenceEndDate}
        canUseRecurring={canUseRecurring}
        isMobile={isMobile}
        mode={mode}
      />
    </div>
  );
}
