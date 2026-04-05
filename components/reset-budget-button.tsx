"use client";

import { clearBudgetFromStorage } from "@/lib/local-budget";

type ResetBudgetButtonProps = {
  className?: string;
};

export function ResetBudgetButton({ className }: ResetBudgetButtonProps) {
  return (
    <button
      type="button"
      className={className ?? "secondary-link button-reset"}
      onClick={() => {
        clearBudgetFromStorage();
        window.location.href = "/budget";
      }}
    >
      Start på nytt
    </button>
  );
}
