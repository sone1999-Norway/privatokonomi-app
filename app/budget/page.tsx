"use client";

import { useEffect, useMemo, useState } from "react";
import { ResetBudgetButton } from "@/components/reset-budget-button";
import {
  calculateFixedExpenses,
  calculateLeftThisMonth,
  calculateVariableExpenses,
  defaultBudgetFormData,
  formatCurrency,
  getAmountDisplay,
  readBudgetFromStorage,
  readFixedExpensesFromStorage,
  readVariableExpensesFromStorage,
  saveBudgetToStorage,
  saveFixedExpensesToStorage,
  saveVariableExpensesToStorage,
  type FixedExpense,
  type VariableExpense,
} from "@/lib/local-budget";

const budgetNotes = [
  "Start med de faste kostnadene.",
  "Følg opp de små utgiftene underveis.",
  "Et enkelt budsjett er ofte nok.",
];

const variableExpenseCategories = [
  { value: "Mat", label: "Mat" },
  { value: "Transport", label: "Transport" },
  { value: "Bolig", label: "Bolig" },
  { value: "Helse og apotek", label: "Helse" },
  { value: "Fritid", label: "Fritid" },
  { value: "Annet", label: "Annet" },
];

const variableExpensePlaceholders: Record<string, string> = {
  Mat: "For eksempel middag ute",
  Transport: "For eksempel busskort eller drivstoff",
  Bolig: "For eksempel strøm eller vedlikehold",
  "Helse og apotek": "For eksempel apotek eller lege",
  Fritid: "For eksempel kino eller trening",
  Annet: "For eksempel gave eller diverse kjøp",
};

function getBudgetStatus(leftThisMonth: number, income: number) {
  const nearLimitThreshold = Math.max(2000, income * 0.08);

  if (leftThisMonth < 0) {
    return {
      label: "I minus",
      title: "Du bruker mer enn du har denne måneden",
      description: `Du er ${formatCurrency(Math.abs(leftThisMonth))} i minus denne måneden. Se særlig på variable utgifter og faste kostnader du kan justere, så blir det lettere å hente inn balansen.`,
    };
  }

  if (leftThisMonth <= nearLimitThreshold) {
    return {
      label: "Nær grensen",
      title: "Du begynner å nærme deg grensen denne måneden",
      description: `Du har ${formatCurrency(leftThisMonth)} igjen. Det er fortsatt mulig å holde kontroll, men denne måneden tåler lite ekstra bruk.`,
    };
  }

  return {
    label: "God kontroll",
    title: "Du ligger godt an denne måneden",
    description: `Du har ${formatCurrency(leftThisMonth)} igjen etter utgiftene. Det gir deg god margin resten av måneden og rom for å sette av penger hvis du vil.`,
  };
}

export default function BudgetPage() {
  const [storedBudget, setStoredBudget] = useState(defaultBudgetFormData);
  const [hasBudgetSetup, setHasBudgetSetup] = useState(true);
  const [fixedEntries, setFixedEntries] = useState<FixedExpense[]>([]);
  const [variableEntries, setVariableEntries] = useState<VariableExpense[]>([]);
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [incomeError, setIncomeError] = useState("");
  const [incomeForm, setIncomeForm] = useState("");
  const [setupError, setSetupError] = useState("");
  const [setupForm, setSetupForm] = useState({
    income: "",
    fixedExpenses: "",
    savingsGoal: "",
  });
  const [editingFixedExpenseId, setEditingFixedExpenseId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editFixedExpenseError, setEditFixedExpenseError] = useState("");
  const [editExpenseError, setEditExpenseError] = useState("");
  const [editFixedExpenseForm, setEditFixedExpenseForm] = useState({
    expenseType: "fixed",
    name: "",
    category: "Bolig",
    amount: "",
    note: "",
  });
  const [editExpenseForm, setEditExpenseForm] = useState({
    expenseType: "variable",
    category: "Mat",
    amount: "",
    note: "",
    name: "",
  });
  const [expenseError, setExpenseError] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    expenseType: "variable",
    name: "",
    category: "Mat",
    amount: "",
    note: "",
  });

  useEffect(() => {
    const savedBudget = readBudgetFromStorage();
    const savedFixedExpenses = readFixedExpensesFromStorage();
    const savedExpenses = readVariableExpensesFromStorage();

    if (savedBudget) {
      setHasBudgetSetup(true);
      setStoredBudget(savedBudget);
      setIncomeForm(String(savedBudget.income));
      setSetupForm({
        income: String(savedBudget.income),
        fixedExpenses: String(savedBudget.fixedExpenses),
        savingsGoal: String(savedBudget.savingsGoal),
      });
    } else {
      setHasBudgetSetup(false);
      setStoredBudget({
        income: 0,
        fixedExpenses: 0,
        savingsGoal: 0,
      });
      setIncomeForm("");
      setFixedEntries([]);
      setVariableEntries([]);
      return;
    }

    if (savedFixedExpenses) {
      setFixedEntries(savedFixedExpenses);
    } else if (savedBudget.fixedExpenses > 0) {
      setFixedEntries([
        {
          id: "fixed-initial",
          name: "Faste utgifter",
          amount: savedBudget.fixedExpenses,
        },
      ]);
    } else {
      setFixedEntries([]);
    }

    if (savedExpenses) {
      setVariableEntries(savedExpenses);
    } else {
      setVariableEntries([]);
    }
  }, []);

  const fixedExpenses = useMemo(() => calculateFixedExpenses(fixedEntries), [fixedEntries]);
  const variableExpenses = useMemo(
    () => calculateVariableExpenses(variableEntries),
    [variableEntries],
  );
  const leftThisMonth = useMemo(
    () => calculateLeftThisMonth(storedBudget.income, fixedExpenses, variableExpenses),
    [fixedExpenses, storedBudget.income, variableExpenses],
  );
  const totalExpenses = useMemo(() => fixedExpenses + variableExpenses, [fixedExpenses, variableExpenses]);
  const budgetStatus = useMemo(
    () => getBudgetStatus(leftThisMonth, storedBudget.income),
    [leftThisMonth, storedBudget.income],
  );
  const budgetStatusDetail =
    leftThisMonth < 0
      ? `${formatCurrency(Math.abs(leftThisMonth))} i minus denne måneden`
      : `${formatCurrency(leftThisMonth)} igjen etter månedens utgifter`;
  const incomeDisplay = getAmountDisplay(storedBudget.income, "income");
  const totalExpensesDisplay = getAmountDisplay(totalExpenses, "expense");
  const leftThisMonthDisplay = getAmountDisplay(leftThisMonth, "balance");
  const fixedExpensesDisplay = getAmountDisplay(fixedExpenses, "expense");
  const variableExpensesDisplay = getAmountDisplay(variableExpenses, "expense");
  const expenseNotePlaceholder = variableExpensePlaceholders[expenseForm.category] ?? "Beskriv utgiften";

  useEffect(() => {
    if (!hasBudgetSetup) {
      return;
    }

    setStoredBudget((current) => {
      if (current.fixedExpenses === fixedExpenses) {
        return current;
      }

      const nextBudget = { ...current, fixedExpenses };
      saveBudgetToStorage(nextBudget);
      return nextBudget;
    });
  }, [fixedExpenses, hasBudgetSetup]);

  function handleInitialSetup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const income = Number(setupForm.income);
    const fixedExpenseAmount = Number(setupForm.fixedExpenses);
    const savingsGoal = Number(setupForm.savingsGoal || "0");

    if (!setupForm.income.trim()) {
      setSetupError("Skriv inn månedlig inntekt.");
      return;
    }

    if (!income || income <= 0) {
      setSetupError("Månedlig inntekt må være høyere enn 0 kr.");
      return;
    }

    if (!setupForm.fixedExpenses.trim()) {
      setSetupError("Skriv inn faste utgifter.");
      return;
    }

    if (Number.isNaN(fixedExpenseAmount) || fixedExpenseAmount < 0) {
      setSetupError("Skriv inn et gyldig beløp for faste utgifter.");
      return;
    }

    if (Number.isNaN(savingsGoal) || savingsGoal < 0) {
      setSetupError("Skriv inn et gyldig sparemål.");
      return;
    }

    const nextBudget = {
      income,
      fixedExpenses: fixedExpenseAmount,
      savingsGoal,
    };

    const nextFixedEntries =
      fixedExpenseAmount > 0
        ? [
            {
              id: crypto.randomUUID(),
              name: "Faste utgifter",
              amount: fixedExpenseAmount,
            },
          ]
        : [];

    setStoredBudget(nextBudget);
    setFixedEntries(nextFixedEntries);
    setVariableEntries([]);
    setHasBudgetSetup(true);
    setSetupError("");
    saveBudgetToStorage(nextBudget);
    saveFixedExpensesToStorage(nextFixedEntries);
    saveVariableExpensesToStorage([]);
  }

  function resetExpenseForm() {
    setExpenseForm({
      expenseType: "variable",
      name: "",
      category: "Mat",
      amount: "",
      note: "",
    });
    setExpenseError("");
  }

  function handleSaveIncome(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!incomeForm.trim()) {
      setIncomeError("Skriv inn månedlig inntekt.");
      return;
    }

    const income = Number(incomeForm);

    if (!income || income <= 0) {
      setIncomeError("Månedlig inntekt må være høyere enn 0 kr.");
      return;
    }

    const nextBudget = { ...storedBudget, income };
    setStoredBudget(nextBudget);
    saveBudgetToStorage(nextBudget);
    setIsEditingIncome(false);
    setIncomeError("");
  }

  function handleAddExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(expenseForm.amount);

    if (expenseForm.expenseType === "fixed" && !expenseForm.name.trim()) {
      setExpenseError("Skriv inn navnet på den faste utgiften.");
      return;
    }

    if (!expenseForm.amount.trim()) {
      setExpenseError("Skriv inn hvor mye utgiften var.");
      return;
    }

    if (!amount || amount <= 0) {
      setExpenseError("Beløpet må være høyere enn 0 kr.");
      return;
    }

    setExpenseError("");

    if (expenseForm.expenseType === "fixed") {
      const nextEntries = [
        {
          id: crypto.randomUUID(),
          name: expenseForm.name.trim(),
          amount,
        },
        ...fixedEntries,
      ];

      setFixedEntries(nextEntries);
      saveFixedExpensesToStorage(nextEntries);
    } else {
      const nextEntries = [
        {
          id: crypto.randomUUID(),
          category: expenseForm.category,
          amount,
          note: expenseForm.note.trim(),
        },
        ...variableEntries,
      ];

      setVariableEntries(nextEntries);
      saveVariableExpensesToStorage(nextEntries);
    }

    resetExpenseForm();
  }

  function handleEditFixedExpense(expense: FixedExpense) {
    setEditingFixedExpenseId(expense.id);
    setEditFixedExpenseForm({
      expenseType: "fixed",
      name: expense.name,
      category: "Bolig",
      amount: String(expense.amount),
      note: "",
    });
    setEditFixedExpenseError("");
  }

  function handleDeleteFixedExpense(expenseId: string) {
    const nextEntries = fixedEntries.filter((entry) => entry.id !== expenseId);

    setFixedEntries(nextEntries);
    saveFixedExpensesToStorage(nextEntries);

    if (editingFixedExpenseId === expenseId) {
      setEditingFixedExpenseId(null);
      setEditFixedExpenseError("");
    }
  }

  function handleSaveEditedFixedExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingFixedExpenseId) {
      return;
    }

    if (!editFixedExpenseForm.amount.trim()) {
      setEditFixedExpenseError("Skriv inn beløpet for den faste utgiften.");
      return;
    }

    const amount = Number(editFixedExpenseForm.amount);

    if (!amount || amount <= 0) {
      setEditFixedExpenseError("Beløpet må være høyere enn 0 kr.");
      return;
    }

    if (editFixedExpenseForm.expenseType === "fixed" && !editFixedExpenseForm.name.trim()) {
      setEditFixedExpenseError("Skriv inn navnet på den faste utgiften.");
      return;
    }

    if (editFixedExpenseForm.expenseType === "variable") {
      const fixedWithoutEdited = fixedEntries.filter((entry) => entry.id !== editingFixedExpenseId);
      const nextVariableEntries = [
        {
          id: editingFixedExpenseId,
          category: editFixedExpenseForm.category,
          amount,
          note: editFixedExpenseForm.note.trim(),
        },
        ...variableEntries,
      ];

      setFixedEntries(fixedWithoutEdited);
      setVariableEntries(nextVariableEntries);
      saveFixedExpensesToStorage(fixedWithoutEdited);
      saveVariableExpensesToStorage(nextVariableEntries);
      setEditingFixedExpenseId(null);
      setEditFixedExpenseError("");
      return;
    }

    const nextEntries = fixedEntries.map((entry) =>
      entry.id === editingFixedExpenseId
        ? { ...entry, name: editFixedExpenseForm.name.trim(), amount }
        : entry,
    );

    setFixedEntries(nextEntries);
    saveFixedExpensesToStorage(nextEntries);
    setEditingFixedExpenseId(null);
    setEditFixedExpenseError("");
  }

  function handleEditExpense(expense: VariableExpense) {
    setEditingExpenseId(expense.id);
    setEditExpenseForm({
      expenseType: "variable",
      category: expense.category,
      amount: String(expense.amount),
      note: expense.note,
      name: "",
    });
    setEditExpenseError("");
  }

  function handleDeleteExpense(expenseId: string) {
    const nextEntries = variableEntries.filter((entry) => entry.id !== expenseId);

    setVariableEntries(nextEntries);
    saveVariableExpensesToStorage(nextEntries);

    if (editingExpenseId === expenseId) {
      setEditingExpenseId(null);
      setEditExpenseError("");
    }
  }

  function handleSaveEditedExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingExpenseId) {
      return;
    }

    if (!editExpenseForm.amount.trim()) {
      setEditExpenseError("Skriv inn hvor mye utgiften var.");
      return;
    }

    const amount = Number(editExpenseForm.amount);

    if (!amount || amount <= 0) {
      setEditExpenseError("Beløpet må være høyere enn 0 kr.");
      return;
    }

    if (editExpenseForm.expenseType === "fixed" && !editExpenseForm.name.trim()) {
      setEditExpenseError("Skriv inn navnet på den faste utgiften.");
      return;
    }

    if (editExpenseForm.expenseType === "fixed") {
      const variableWithoutEdited = variableEntries.filter((entry) => entry.id !== editingExpenseId);
      const nextFixedEntries = [
        {
          id: editingExpenseId,
          name: editExpenseForm.name.trim(),
          amount,
        },
        ...fixedEntries,
      ];

      setVariableEntries(variableWithoutEdited);
      setFixedEntries(nextFixedEntries);
      saveVariableExpensesToStorage(variableWithoutEdited);
      saveFixedExpensesToStorage(nextFixedEntries);
      setEditingExpenseId(null);
      setEditExpenseError("");
      return;
    }

    const nextEntries = variableEntries.map((entry) =>
      entry.id === editingExpenseId
        ? {
            ...entry,
            category: editExpenseForm.category,
            amount,
            note: editExpenseForm.note.trim(),
          }
        : entry,
    );

    setVariableEntries(nextEntries);
    saveVariableExpensesToStorage(nextEntries);
    setEditingExpenseId(null);
    setEditExpenseError("");
  }

  if (!hasBudgetSetup) {
    return (
      <main className="page-shell app-page-shell">
        <section className="app-hero">
          <div className="app-hero-copy">
            <p className="eyebrow">Budsjett</p>
            <h1 className="page-title">Start med budsjettet ditt</h1>
            <p>Legg inn inntekt og faste utgifter, så får du oversikten her med én gang.</p>
          </div>

          <div className="app-status-card">
            <p className="eyebrow">Første steg</p>
            <h2>Begynn med de viktigste tallene</h2>
            <p>Du trenger bare inntekt, faste utgifter og et enkelt sparemål for å komme i gang.</p>
          </div>
        </section>

        <section className="section">
          <div className="content-card app-panel budget-setup-panel">
            <p className="eyebrow">Kom i gang</p>
            <h2>Legg inn tallene dine</h2>
            <form className="simple-form" onSubmit={handleInitialSetup}>
              <label>
                Månedlig inntekt
                <input
                  type="number"
                  placeholder="35 000"
                  value={setupForm.income}
                  aria-invalid={setupError ? "true" : "false"}
                  onChange={(event) => {
                    setSetupForm((current) => ({ ...current, income: event.target.value }));
                    if (setupError) {
                      setSetupError("");
                    }
                  }}
                />
              </label>

              <label>
                Faste utgifter
                <input
                  type="number"
                  placeholder="16 500"
                  value={setupForm.fixedExpenses}
                  aria-invalid={setupError ? "true" : "false"}
                  onChange={(event) => {
                    setSetupForm((current) => ({ ...current, fixedExpenses: event.target.value }));
                    if (setupError) {
                      setSetupError("");
                    }
                  }}
                />
              </label>

              <label>
                Sparemål
                <input
                  type="number"
                  placeholder="3 000"
                  value={setupForm.savingsGoal}
                  aria-invalid={setupError ? "true" : "false"}
                  onChange={(event) => {
                    setSetupForm((current) => ({ ...current, savingsGoal: event.target.value }));
                    if (setupError) {
                      setSetupError("");
                    }
                  }}
                />
              </label>

              {setupError ? <p className="form-error">{setupError}</p> : null}

              <div className="action-row">
                <button type="submit" className="primary-link button-reset">
                  Start med budsjettet
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell app-page-shell">
      <section className="app-hero">
        <div className="app-hero-copy">
          <p className="eyebrow">Budsjett</p>
          <h1 className="page-title">Se hva du har igjen denne måneden</h1>
          <p>Se hva som går ut, og hva du har igjen.</p>
        </div>

        <div className="app-status-card">
          <p className="eyebrow">Budsjettstatus</p>
          <h2>{budgetStatus.title}</h2>
          <p>{budgetStatus.description}</p>
          <p className="status-note">
            <strong>{budgetStatus.label}:</strong> {budgetStatusDetail}.
          </p>
        </div>
      </section>

      <section className="app-grid-metrics budget-primary-grid">
        <article className="feature-card metric-card">
          <p className="eyebrow">Inntekt</p>
          <h2 className={incomeDisplay.toneClassName}>{incomeDisplay.text}</h2>
          {isEditingIncome ? (
            <form className="inline-edit-card compact-inline-edit" onSubmit={handleSaveIncome}>
              <label>
                Månedlig inntekt
                <input
                  type="number"
                  value={incomeForm}
                  aria-invalid={incomeError ? "true" : "false"}
                  onChange={(event) => {
                    setIncomeForm(event.target.value);
                    if (incomeError) {
                      setIncomeError("");
                    }
                  }}
                />
              </label>
              {incomeError ? <p className="form-error">{incomeError}</p> : null}
              <div className="inline-action-links">
                <button type="submit" className="text-action button-reset">
                  Lagre
                </button>
                <button
                  type="button"
                  className="text-action button-reset"
                  onClick={() => {
                    setIncomeForm(String(storedBudget.income));
                    setIncomeError("");
                    setIsEditingIncome(false);
                  }}
                >
                  Avbryt
                </button>
              </div>
            </form>
          ) : (
            <div className="metric-card-actions">
              <button
                type="button"
                className="text-action button-reset"
                onClick={() => setIsEditingIncome(true)}
              >
                Endre inntekt
              </button>
            </div>
          )}
        </article>
        <article className="feature-card metric-card">
          <p className="eyebrow">Totale utgifter</p>
          <h2 className={totalExpensesDisplay.toneClassName}>{totalExpensesDisplay.text}</h2>
        </article>
        <article className="feature-card metric-card">
          <p className="eyebrow">Igjen denne måneden</p>
          <h2 className={leftThisMonthDisplay.toneClassName}>{leftThisMonthDisplay.text}</h2>
        </article>
      </section>

      <section className="app-main-grid">
        <div className="app-side-stack">
          <div className="content-card app-panel expense-list-panel">
            <h2 className="section-panel-title">Faste utgifter</h2>
            <div className="table-list expense-list">
              {fixedEntries.map((item) => {
                const itemDisplay = getAmountDisplay(item.amount, "expense");

                return (
                  <div
                    key={item.id}
                    className={
                      editingFixedExpenseId === item.id ? "expense-item expense-item-editing" : "expense-item"
                    }
                  >
                    <div className="table-row expense-list-row">
                      <div className="expense-item-main">
                        <strong>{item.name}</strong>
                        <p>Fast kostnad</p>
                      </div>
                      <div className="expense-row-actions expense-item-meta">
                        <strong className={itemDisplay.toneClassName}>{itemDisplay.text}</strong>
                        <div className="inline-action-links">
                          <button type="button" className="text-action button-reset" onClick={() => handleEditFixedExpense(item)}>
                            Rediger
                          </button>
                          <button type="button" className="text-action button-reset" onClick={() => handleDeleteFixedExpense(item.id)}>
                            Slett
                          </button>
                        </div>
                      </div>
                    </div>

                    {editingFixedExpenseId === item.id ? (
                      <form className="inline-edit-card" onSubmit={handleSaveEditedFixedExpense}>
                        <p className="inline-edit-label">Du redigerer denne faste utgiften</p>

                        <label>
                          Utgiftstype
                          <select
                            value={editFixedExpenseForm.expenseType}
                            onChange={(event) => {
                              setEditFixedExpenseForm((current) => ({
                                ...current,
                                expenseType: event.target.value,
                              }));
                              if (editFixedExpenseError) {
                                setEditFixedExpenseError("");
                              }
                            }}
                          >
                            <option value="fixed">Fast utgift</option>
                            <option value="variable">Variabel utgift</option>
                          </select>
                        </label>

                        {editFixedExpenseForm.expenseType === "fixed" ? (
                          <label>
                            Navn
                            <input
                              type="text"
                              value={editFixedExpenseForm.name}
                              aria-invalid={editFixedExpenseError ? "true" : "false"}
                              onChange={(event) => {
                                setEditFixedExpenseForm((current) => ({
                                  ...current,
                                  name: event.target.value,
                                }));
                                if (editFixedExpenseError) {
                                  setEditFixedExpenseError("");
                                }
                              }}
                            />
                          </label>
                        ) : (
                          <>
                            <label>
                              Kategori
                              <select
                                value={editFixedExpenseForm.category}
                                onChange={(event) => {
                                  setEditFixedExpenseForm((current) => ({
                                    ...current,
                                    category: event.target.value,
                                  }));
                                  if (editFixedExpenseError) {
                                    setEditFixedExpenseError("");
                                  }
                                }}
                              >
                                {variableExpenseCategories.map((category) => (
                                  <option key={category.value} value={category.value}>
                                    {category.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label>
                              Kort beskrivelse
                              <input
                                type="text"
                                value={editFixedExpenseForm.note}
                                onChange={(event) => {
                                  setEditFixedExpenseForm((current) => ({
                                    ...current,
                                    note: event.target.value,
                                  }));
                                }}
                              />
                            </label>
                          </>
                        )}

                        <label>
                          Beløp
                          <input
                            type="number"
                            value={editFixedExpenseForm.amount}
                            aria-invalid={editFixedExpenseError ? "true" : "false"}
                            onChange={(event) => {
                              setEditFixedExpenseForm((current) => ({
                                ...current,
                                amount: event.target.value,
                              }));
                              if (editFixedExpenseError) {
                                setEditFixedExpenseError("");
                              }
                            }}
                          />
                        </label>

                        {editFixedExpenseError ? <p className="form-error">{editFixedExpenseError}</p> : null}

                        <div className="action-row">
                          <button type="submit" className="primary-link button-reset">
                            Lagre endring
                          </button>
                          <button
                            type="button"
                            className="secondary-link button-reset"
                            onClick={() => {
                              setEditingFixedExpenseId(null);
                              setEditFixedExpenseError("");
                            }}
                          >
                            Avbryt
                          </button>
                        </div>
                      </form>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="content-card app-panel expense-list-panel">
            <h2 className="section-panel-title">Variable utgifter</h2>
            {variableEntries.length === 0 ? (
              <div className="empty-state">
                <h3>Ingen variable utgifter ennå</h3>
                <p>Når du registrerer et kjøp her, oppdateres både budsjettet og månedsoversikten automatisk.</p>
              </div>
            ) : (
              <div className="table-list expense-list">
                {variableEntries.map((item) => {
                  const itemDisplay = getAmountDisplay(item.amount, "expense");

                  return (
                    <div
                      key={item.id}
                    className={
                      editingExpenseId === item.id ? "expense-item expense-item-editing" : "expense-item"
                    }
                  >
                      <div className="table-row expense-list-row">
                        <div className="expense-item-main">
                          <strong>{item.category}</strong>
                          <p>{item.note || "Løpende utgift"}</p>
                        </div>
                        <div className="expense-row-actions expense-item-meta">
                          <strong className={itemDisplay.toneClassName}>{itemDisplay.text}</strong>
                          <div className="inline-action-links">
                            <button type="button" className="text-action button-reset" onClick={() => handleEditExpense(item)}>
                              Rediger
                            </button>
                            <button type="button" className="text-action button-reset" onClick={() => handleDeleteExpense(item.id)}>
                              Slett
                            </button>
                          </div>
                        </div>
                      </div>

                      {editingExpenseId === item.id ? (
                        <form className="inline-edit-card" onSubmit={handleSaveEditedExpense}>
                          <p className="inline-edit-label">Du redigerer denne utgiften</p>

                          <label>
                            Utgiftstype
                            <select
                              value={editExpenseForm.expenseType}
                              onChange={(event) => {
                                setEditExpenseForm((current) => ({
                                  ...current,
                                  expenseType: event.target.value,
                                }));
                                if (editExpenseError) {
                                  setEditExpenseError("");
                                }
                              }}
                            >
                              <option value="variable">Variabel utgift</option>
                              <option value="fixed">Fast utgift</option>
                            </select>
                          </label>

                          {editExpenseForm.expenseType === "variable" ? (
                            <>
                              <label>
                                Kategori
                                <select
                                  value={editExpenseForm.category}
                                  onChange={(event) =>
                                    setEditExpenseForm((current) => ({
                                      ...current,
                                      category: event.target.value,
                                    }))
                                  }
                                >
                                  {variableExpenseCategories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                      {category.label}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label>
                                Kort beskrivelse
                                <input
                                  type="text"
                                  value={editExpenseForm.note}
                                  onChange={(event) =>
                                    setEditExpenseForm((current) => ({
                                      ...current,
                                      note: event.target.value,
                                    }))
                                  }
                                />
                              </label>
                            </>
                          ) : (
                            <label>
                              Navn
                              <input
                                type="text"
                                value={editExpenseForm.name}
                                aria-invalid={editExpenseError ? "true" : "false"}
                                onChange={(event) => {
                                  setEditExpenseForm((current) => ({
                                    ...current,
                                    name: event.target.value,
                                  }));
                                  if (editExpenseError) {
                                    setEditExpenseError("");
                                  }
                                }}
                              />
                            </label>
                          )}

                          <label>
                            Beløp
                            <input
                              type="number"
                              value={editExpenseForm.amount}
                              aria-invalid={editExpenseError ? "true" : "false"}
                              onChange={(event) => {
                                setEditExpenseForm((current) => ({
                                  ...current,
                                  amount: event.target.value,
                                }));
                                if (editExpenseError) {
                                  setEditExpenseError("");
                                }
                              }}
                            />
                          </label>

                          {editExpenseError ? <p className="form-error">{editExpenseError}</p> : null}

                          <div className="action-row">
                            <button type="submit" className="primary-link button-reset">
                              Lagre endring
                            </button>
                            <button
                              type="button"
                              className="secondary-link button-reset"
                              onClick={() => {
                                setEditingExpenseId(null);
                                setEditExpenseError("");
                              }}
                            >
                              Avbryt
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        <div className="content-card app-panel budget-form-panel">
          <div className="panel-header">
            <h2>Legg til utgift</h2>
          </div>

          <form className="simple-form budget-expense-form" onSubmit={handleAddExpense}>
            <fieldset className="expense-type-group segmented-control-group">
              <legend>Utgiftstype</legend>
              <div className="expense-type-options segmented-control">
                <label
                  className={
                    expenseForm.expenseType === "variable"
                      ? "expense-type-option expense-type-option-selected segmented-option"
                      : "expense-type-option"
                  }
                >
                  <input
                    type="radio"
                    name="expenseType"
                    value="variable"
                    checked={expenseForm.expenseType === "variable"}
                    onChange={(event) =>
                      setExpenseForm((current) => ({ ...current, expenseType: event.target.value }))
                    }
                  />
                  <span>Variabel utgift</span>
                </label>
                <label
                  className={
                    expenseForm.expenseType === "fixed"
                      ? "expense-type-option expense-type-option-selected segmented-option"
                      : "expense-type-option"
                  }
                >
                  <input
                    type="radio"
                    name="expenseType"
                    value="fixed"
                    checked={expenseForm.expenseType === "fixed"}
                    onChange={(event) =>
                      setExpenseForm((current) => ({ ...current, expenseType: event.target.value }))
                    }
                  />
                  <span>Fast utgift</span>
                </label>
              </div>
            </fieldset>

            {expenseForm.expenseType === "fixed" ? (
              <label>
                Navn på utgift
                <p className="field-help">For eksempel bolig, strøm og nettleie eller barnehage.</p>
                <input
                  type="text"
                  placeholder="For eksempel strøm og nettleie"
                  value={expenseForm.name}
                  aria-invalid={expenseError ? "true" : "false"}
                  onChange={(event) => setExpenseForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
            ) : (
              <>
                <label>
                  Kategori
                  <div className="category-options chip-group">
                    {variableExpenseCategories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        className={
                          expenseForm.category === category.value
                            ? "category-option category-option-selected chip-button"
                            : "category-option chip-button"
                        }
                        onClick={() => setExpenseForm((current) => ({ ...current, category: category.value }))}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </label>

                <label>
                  Kort beskrivelse
                  <p className="field-help">Valgfritt.</p>
                  <input
                    type="text"
                    placeholder={expenseNotePlaceholder}
                    value={expenseForm.note}
                    onChange={(event) => setExpenseForm((current) => ({ ...current, note: event.target.value }))}
                  />
                </label>
              </>
            )}

            <label>
              Beløp
              <input
                type="number"
                placeholder={expenseForm.expenseType === "fixed" ? "1200" : "450"}
                value={expenseForm.amount}
                aria-invalid={expenseError ? "true" : "false"}
                onChange={(event) => setExpenseForm((current) => ({ ...current, amount: event.target.value }))}
              />
            </label>

            {expenseError ? <p className="form-error">{expenseError}</p> : null}

            <div className="action-row">
              <button type="submit" className="primary-link button-reset">
                Legg til utgift
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="budget-action-box">
          <p className="eyebrow">Neste steg</p>
          <div className="action-row">
            <a href="/saving" className="primary-link compact-link">
              Fortsett til sparing
            </a>
            <ResetBudgetButton className="secondary-link button-reset compact-link" />
          </div>
        </div>
      </section>
    </main>
  );
}
