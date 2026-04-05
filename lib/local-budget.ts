export const budgetStorageKey = "privatokonomi-budget";
export const fixedExpensesStorageKey = "privatokonomi-fixed-expenses";
export const variableExpensesStorageKey = "privatokonomi-variable-expenses";
export const savingsEntriesStorageKey = "privatokonomi-savings-entries";

export type BudgetFormData = {
  income: number;
  fixedExpenses: number;
  savingsGoal: number;
};

export type VariableExpense = {
  id: string;
  category: string;
  amount: number;
  note: string;
};

export type FixedExpense = {
  id: string;
  name: string;
  amount: number;
};

export type SavingsEntry = {
  id: string;
  name: string;
  amount: number;
};

export const defaultBudgetFormData: BudgetFormData = {
  income: 35000,
  fixedExpenses: 14698,
  savingsGoal: 3000,
};

export function readBudgetFromStorage(): BudgetFormData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(budgetStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<BudgetFormData>;

    if (
      typeof parsed.income !== "number" ||
      typeof parsed.fixedExpenses !== "number" ||
      typeof parsed.savingsGoal !== "number"
    ) {
      return null;
    }

    return {
      income: parsed.income,
      fixedExpenses: parsed.fixedExpenses,
      savingsGoal: parsed.savingsGoal,
    };
  } catch {
    return null;
  }
}

export function saveBudgetToStorage(data: BudgetFormData) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(budgetStorageKey, JSON.stringify(data));
}

export function clearBudgetFromStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(budgetStorageKey);
  window.localStorage.removeItem(fixedExpensesStorageKey);
  window.localStorage.removeItem(variableExpensesStorageKey);
  window.localStorage.removeItem(savingsEntriesStorageKey);
}

export function readFixedExpensesFromStorage(): FixedExpense[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(fixedExpensesStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as FixedExpense[];

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed.filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.amount === "number",
    );
  } catch {
    return null;
  }
}

export function saveFixedExpensesToStorage(expenses: FixedExpense[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(fixedExpensesStorageKey, JSON.stringify(expenses));
}

export function readVariableExpensesFromStorage(): VariableExpense[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(variableExpensesStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as VariableExpense[];

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed.filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.category === "string" &&
        typeof item.amount === "number" &&
        typeof item.note === "string",
    );
  } catch {
    return null;
  }
}

export function saveVariableExpensesToStorage(expenses: VariableExpense[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(variableExpensesStorageKey, JSON.stringify(expenses));
}

export function readSavingsEntriesFromStorage(): SavingsEntry[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(savingsEntriesStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as SavingsEntry[];

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed.filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.amount === "number",
    );
  } catch {
    return null;
  }
}

export function saveSavingsEntriesToStorage(entries: SavingsEntry[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(savingsEntriesStorageKey, JSON.stringify(entries));
}

export function calculateVariableExpenses(expenses: VariableExpense[]) {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function calculateFixedExpenses(expenses: FixedExpense[]) {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function calculateSavedAmount(entries: SavingsEntry[]) {
  return entries.reduce((sum, entry) => sum + entry.amount, 0);
}

export function calculateTotalExpenses(fixedExpenses: number, variableExpenses: number) {
  return fixedExpenses + variableExpenses;
}

export function calculateLeftThisMonth(
  income: number,
  fixedExpenses: number,
  variableExpenses: number,
) {
  return income - fixedExpenses - variableExpenses;
}

export function getSavingsStatusMessage(savingsGoal: number, possibleSavings: number) {
  if (savingsGoal > possibleSavings) {
    return "Sparemålet er høyere enn det du har igjen denne måneden.";
  }

  return "Sparemålet ditt er innenfor det som ser mulig ut denne måneden.";
}

export function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("nb-NO").format(value)} kr`;
}

export type AmountKind = "income" | "expense" | "balance" | "saving" | "neutral";

export function getAmountDisplay(value: number, kind: AmountKind = "neutral") {
  if (kind === "income") {
    return {
      text: formatCurrency(Math.abs(value)),
      toneClassName: "amount-positive",
    };
  }

  if (kind === "expense") {
    return {
      text: `-${formatCurrency(Math.abs(value))}`,
      toneClassName: "amount-negative",
    };
  }

  if (kind === "saving") {
    if (value < 0) {
      return {
        text: `-${formatCurrency(Math.abs(value))}`,
        toneClassName: "amount-negative",
      };
    }

    if (value > 0) {
      return {
        text: formatCurrency(value),
        toneClassName: "amount-positive",
      };
    }

    return {
      text: formatCurrency(0),
      toneClassName: "",
    };
  }

  if (kind === "balance") {
    if (value < 0) {
      return {
        text: `-${formatCurrency(Math.abs(value))}`,
        toneClassName: "amount-negative",
      };
    }

    if (value > 0) {
      return {
        text: formatCurrency(value),
        toneClassName: "amount-positive",
      };
    }

    return {
      text: formatCurrency(0),
      toneClassName: "",
    };
  }

  return {
    text: formatCurrency(value),
    toneClassName: "",
  };
}
