
import React from "react";
import { InvestmentActionButtons } from "./InvestmentActionButtons";

interface Props {
  investments: any[];
  onImportSuccess: () => void;
  onCreateClick: () => void;
  showForm: boolean;
  setShowForm: (b: boolean) => void;
}

export function InvestmentsHeaderActions(props: Props) {
  return (
    <div className="flex w-full justify-between mb-0 gap-2">
      <div />
      <InvestmentActionButtons {...props} />
    </div>
  );
}
