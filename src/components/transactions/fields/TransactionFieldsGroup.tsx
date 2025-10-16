
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
  isScheduled?: boolean;
  canUseRecurring?: boolean;
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
}: TransactionFieldsGroupProps) {
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
        <TransactionDateField 
          value={date} 
          onChange={setDate} 
          isMobile={isMobile}
        />
        <TransactionDescriptionField value={description} onChange={setDescription} isMobile={isMobile} />
        {!isScheduled && (
          <TransactionRecurrenceFields
            isRecurring={isRecurring}
            setIsRecurring={setIsRecurring}
            recurrencePattern={recurrencePattern}
            setRecurrencePattern={setRecurrencePattern}
            recurrenceEndDate={recurrenceEndDate}
            setRecurrenceEndDate={setRecurrenceEndDate}
            canUseRecurring={canUseRecurring}
          />
        )}
    </div>
  );
}
