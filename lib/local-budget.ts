export const budgetStorageKey = "privatokonomi-budget";
export const variableExpensesStorageKey = "privatokonomi-variable-expenses";

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
  window.localStorage.removeItem(variableExpensesStorageKey);
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

export function calculateVariableExpenses(expenses: VariableExpense[]) {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function calculateTotalExpenses(fixedExpenses: number, variableExpenses: number) {
  return fixedExpenses + variableExpenses;
}

export function calculateLeftThisMonth(
  income: number,
  fixedExpenses: number,
  variableExpenses: number,
  savingsGoal: number,
) {
  return income - fixedExpenses - variableExpenses - savingsGoal;
}

export function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("nb-NO").format(value)} kr`;
}
