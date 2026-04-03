"use client";

import { useEffect, useMemo, useState } from "react";
import { ResetBudgetButton } from "@/components/reset-budget-button";
import {
  fixedExpenseItems,
  savingsItems,
  variableExpenseItems,
} from "@/lib/demo-data";
import {
  calculateFixedExpenses,
  calculateSavedAmount,
  calculateLeftThisMonth,
  calculateVariableExpenses,
  defaultBudgetFormData,
  formatCurrency,
  readBudgetFromStorage,
  readFixedExpensesFromStorage,
  readSavingsEntriesFromStorage,
  readVariableExpensesFromStorage,
  saveBudgetToStorage,
  saveFixedExpensesToStorage,
  saveSavingsEntriesToStorage,
  saveVariableExpensesToStorage,
  type FixedExpense,
  type SavingsEntry,
  type VariableExpense,
} from "@/lib/local-budget";

const budgetNotes = [
  "Start med faste kostnader, så blir resten av måneden lettere å planlegge.",
  "Små utgifter blir enklere å følge når du har et tydelig utgangspunkt.",
  "Et enkelt budsjett er ofte bedre enn et avansert budsjett du ikke bruker.",
];

function getBudgetStatus(leftThisMonth: number, income: number) {
  const nearLimitThreshold = Math.max(2000, income * 0.08);

  if (leftThisMonth < 0) {
    return {
      label: "Måned i minus",
      title: "Du bruker mer enn du har tilgjengelig denne måneden",
      description: `Du ligger ${formatCurrency(Math.abs(leftThisMonth))} over det som er tilgjengelig. Se særlig på variable utgifter hvis du vil hente inn balansen.`,
    };
  }

  if (leftThisMonth <= nearLimitThreshold) {
    return {
      label: "Strammere måned",
      title: "Du ligger tett opptil grensen denne måneden",
      description: `Du har ${formatCurrency(leftThisMonth)} igjen. Det er fortsatt mulig å holde kontroll, men denne måneden tåler lite ekstra.`,
    };
  }

  return {
    label: "God kontroll",
    title: "Du har fortsatt god kontroll denne måneden",
    description: `Du har ${formatCurrency(leftThisMonth)} igjen etter utgiftene. Det gir rom for både buffer og sparing hvis du ønsker det.`,
  };
}

function getSavingsProgress(goal: number, savedAmount: number) {
  const difference = Math.abs(goal - savedAmount);

  if (savedAmount > goal) {
    return {
      title: "Du ligger foran sparemålet",
      description: `Du har spart ${formatCurrency(difference)} mer enn målet ditt så langt.`,
    };
  }

  if (savedAmount === goal) {
    return {
      title: "Du er i rute med sparemålet",
      description: "Du har nå spart like mye som målet ditt for denne måneden.",
    };
  }

  return {
    title: "Du ligger bak sparemålet",
    description: `Du mangler ${formatCurrency(difference)} for å nå sparemålet.`,
  };
}

export default function BudgetPage() {
  const [storedBudget, setStoredBudget] = useState(defaultBudgetFormData);
  const [fixedEntries, setFixedEntries] = useState<FixedExpense[]>([]);
  const [variableEntries, setVariableEntries] = useState<VariableExpense[]>([]);
  const [savingsEntries, setSavingsEntries] = useState<SavingsEntry[]>([]);
  const [editingFixedExpenseId, setEditingFixedExpenseId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editFixedExpenseError, setEditFixedExpenseError] = useState("");
  const [editingSavingsId, setEditingSavingsId] = useState<string | null>(null);
  const [editExpenseError, setEditExpenseError] = useState("");
  const [editSavingsError, setEditSavingsError] = useState("");
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
  const [editSavingsForm, setEditSavingsForm] = useState({
    name: "",
    amount: "",
  });
  const [expenseError, setExpenseError] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    expenseType: "variable",
    name: "",
    category: "Mat",
    amount: "",
    note: "",
  });
  const [savingsError, setSavingsError] = useState("");
  const [savingsForm, setSavingsForm] = useState({
    name: "",
    amount: "",
  });

  useEffect(() => {
    const savedBudget = readBudgetFromStorage();
    const savedFixedExpenses = readFixedExpensesFromStorage();
    const savedExpenses = readVariableExpensesFromStorage();
    const savedSavingsEntries = readSavingsEntriesFromStorage();

    if (savedBudget) {
      setStoredBudget(savedBudget);
    }

    if (savedFixedExpenses) {
      setFixedEntries(savedFixedExpenses);
    } else {
      setFixedEntries(
        fixedExpenseItems.map((item, index) => ({
          id: `fixed-demo-${index + 1}`,
          name: item.name,
          amount: item.amount,
        })),
      );
    }

    if (savedExpenses) {
      setVariableEntries(savedExpenses);
    } else {
      setVariableEntries(
        variableExpenseItems.map((item, index) => ({
          id: `demo-${index + 1}`,
          category: item.category,
          amount: item.amount,
          note: item.note,
        })),
      );
    }

    if (savedSavingsEntries) {
      setSavingsEntries(savedSavingsEntries);
    } else {
      setSavingsEntries(
        savingsItems.map((item, index) => ({
          id: `savings-demo-${index + 1}`,
          name: item.name,
          amount: item.amount,
        })),
      );
    }
  }, []);

  const fixedExpenses = useMemo(() => calculateFixedExpenses(fixedEntries), [fixedEntries]);
  const variableExpenses = useMemo(
    () => calculateVariableExpenses(variableEntries),
    [variableEntries],
  );
  const leftThisMonth = useMemo(
    () =>
      calculateLeftThisMonth(
        storedBudget.income,
        fixedExpenses,
        variableExpenses,
      ),
    [fixedExpenses, storedBudget.income, variableExpenses],
  );
  const totalExpenses = useMemo(
    () => fixedExpenses + variableExpenses,
    [fixedExpenses, variableExpenses],
  );
  const possibleSavings = useMemo(() => Math.max(leftThisMonth, 0), [leftThisMonth]);
  const actualSavedAmount = useMemo(() => calculateSavedAmount(savingsEntries), [savingsEntries]);
  const budgetStatus = useMemo(
    () => getBudgetStatus(leftThisMonth, storedBudget.income),
    [leftThisMonth, storedBudget.income],
  );
  const savingsStatus = useMemo(
    () => getSavingsProgress(storedBudget.savingsGoal, actualSavedAmount),
    [actualSavedAmount, storedBudget.savingsGoal],
  );
  const budgetStatusDetail = leftThisMonth < 0
    ? `${formatCurrency(Math.abs(leftThisMonth))} over det som er tilgjengelig`
    : `${formatCurrency(leftThisMonth)} igjen etter månedens utgifter`;

  useEffect(() => {
    setStoredBudget((current) => {
      if (current.fixedExpenses === fixedExpenses) {
        return current;
      }

      const nextBudget = {
        ...current,
        fixedExpenses,
      };

      saveBudgetToStorage(nextBudget);
      return nextBudget;
    });
  }, [fixedExpenses]);

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

  function resetSavingsForm() {
    setSavingsForm({
      name: "",
      amount: "",
    });
    setSavingsError("");
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
      const nextEntry = {
        id: crypto.randomUUID(),
        category: expenseForm.category,
        amount,
        note: expenseForm.note.trim(),
      };

      const nextEntries = [nextEntry, ...variableEntries];

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
        ? {
            ...entry,
            name: editFixedExpenseForm.name.trim(),
            amount,
          }
        : entry,
    );

    setFixedEntries(nextEntries);
    saveFixedExpensesToStorage(nextEntries);
    setEditingFixedExpenseId(null);
    setEditFixedExpenseError("");
  }

  function handleAddSavingsEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(savingsForm.amount);

    if (!savingsForm.name.trim()) {
      setSavingsError("Skriv inn hva du sparer til eller hvor pengene settes av.");
      return;
    }

    if (!savingsForm.amount.trim()) {
      setSavingsError("Skriv inn hvor mye du har spart.");
      return;
    }

    if (!amount || amount <= 0) {
      setSavingsError("Beløpet må være høyere enn 0 kr.");
      return;
    }

    const nextEntries = [
      {
        id: crypto.randomUUID(),
        name: savingsForm.name.trim(),
        amount,
      },
      ...savingsEntries,
    ];

    setSavingsEntries(nextEntries);
    saveSavingsEntriesToStorage(nextEntries);
    resetSavingsForm();
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

  function handleDeleteSavingsEntry(entryId: string) {
    const nextEntries = savingsEntries.filter((entry) => entry.id !== entryId);

    setSavingsEntries(nextEntries);
    saveSavingsEntriesToStorage(nextEntries);

    if (editingSavingsId === entryId) {
      setEditingSavingsId(null);
      setEditSavingsError("");
    }
  }

  function handleEditSavingsEntry(entry: SavingsEntry) {
    setEditingSavingsId(entry.id);
    setEditSavingsForm({
      name: entry.name,
      amount: String(entry.amount),
    });
    setEditSavingsError("");
  }

  function handleSaveEditedSavingsEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingSavingsId) {
      return;
    }

    if (!editSavingsForm.name.trim()) {
      setEditSavingsError("Skriv inn hva denne sparelinjen gjelder.");
      return;
    }

    if (!editSavingsForm.amount.trim()) {
      setEditSavingsError("Skriv inn hvor mye du har spart.");
      return;
    }

    const amount = Number(editSavingsForm.amount);

    if (!amount || amount <= 0) {
      setEditSavingsError("Beløpet må være høyere enn 0 kr.");
      return;
    }

    const nextEntries = savingsEntries.map((entry) =>
      entry.id === editingSavingsId
        ? {
            ...entry,
            name: editSavingsForm.name.trim(),
            amount,
          }
        : entry,
    );

    setSavingsEntries(nextEntries);
    saveSavingsEntriesToStorage(nextEntries);
    setEditingSavingsId(null);
    setEditSavingsError("");
  }

  return (
    <main className="page-shell app-page-shell">
      <section className="app-hero">
        <div className="app-hero-copy">
          <p className="eyebrow">Budsjett</p>
          <h1 className="page-title">Se hva du har igjen, og hva du kan sette til side</h1>
          <p>
            Her ser du raskt hvordan måneden ligger an: hva som går ut, hva som er igjen,
            og hvordan sparingen din faktisk fordeler seg.
          </p>
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
          <h2>{formatCurrency(storedBudget.income)}</h2>
        </article>
        <article className="feature-card metric-card">
          <p className="eyebrow">Totale utgifter</p>
          <h2>{formatCurrency(totalExpenses)}</h2>
        </article>
        <article className="feature-card metric-card">
          <p className="eyebrow">Igjen denne måneden</p>
          <h2>{formatCurrency(leftThisMonth)}</h2>
        </article>
      </section>

      <section className="app-grid-metrics budget-detail-grid">
        <article className="feature-card metric-card">
          <p className="eyebrow">Faste utgifter</p>
          <h2>{formatCurrency(fixedExpenses)}</h2>
        </article>
        <article className="feature-card metric-card">
          <p className="eyebrow">Variable utgifter</p>
          <h2>{formatCurrency(variableExpenses)}</h2>
        </article>
        <article className="feature-card metric-card">
          <p className="eyebrow">Månedsvurdering</p>
          <h2>{budgetStatus.label}</h2>
        </article>
      </section>

      <section className="app-main-grid">
        <div className="app-side-stack">
          <div className="content-card app-panel">
            <p className="eyebrow">Faste utgifter</p>
            <h2>Det som vanligvis kommer hver måned</h2>
            <div className="table-list">
              {fixedEntries.map((item) => (
                <div
                  key={item.id}
                  className={
                    editingFixedExpenseId === item.id ? "expense-item expense-item-editing" : "expense-item"
                  }
                >
                  <div className="table-row">
                    <div>
                      <strong>{item.name}</strong>
                    </div>
                    <div className="expense-row-actions">
                      <strong>{formatCurrency(item.amount)}</strong>
                      <div className="inline-action-links">
                        <button
                          type="button"
                          className="text-action button-reset"
                          onClick={() => handleEditFixedExpense(item)}
                        >
                          Rediger
                        </button>
                        <button
                          type="button"
                          className="text-action button-reset"
                          onClick={() => handleDeleteFixedExpense(item.id)}
                        >
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
                              <option value="Mat">Mat</option>
                              <option value="Transport">Transport</option>
                              <option value="Helse og apotek">Helse og apotek</option>
                              <option value="Fritid">Fritid</option>
                              <option value="Annet">Annet</option>
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
              ))}
            </div>
          </div>

          <div className="content-card app-panel">
            <p className="eyebrow">Variable utgifter</p>
            <h2>Vanlige utgifter i løpet av måneden</h2>
            {variableEntries.length === 0 ? (
              <div className="empty-state">
                <h3>Ingen variable utgifter ennå</h3>
                <p>
                  Når du registrerer et kjøp her, oppdateres både budsjettet og månedsoversikten automatisk.
                </p>
              </div>
            ) : (
              <div className="table-list">
                {variableEntries.map((item) => (
                  <div
                    key={item.id}
                    className={
                      editingExpenseId === item.id ? "expense-item expense-item-editing" : "expense-item"
                    }
                  >
                    <div className="table-row">
                      <div>
                        <strong>{item.category}</strong>
                        <p>{item.note || "Løpende utgift"}</p>
                      </div>
                      <div className="expense-row-actions">
                        <strong>{formatCurrency(item.amount)}</strong>
                        <div className="inline-action-links">
                          <button
                            type="button"
                            className="text-action button-reset"
                            onClick={() => handleEditExpense(item)}
                          >
                            Rediger
                          </button>
                          <button
                            type="button"
                            className="text-action button-reset"
                            onClick={() => handleDeleteExpense(item.id)}
                          >
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
                                <option value="Mat">Mat</option>
                                <option value="Transport">Transport</option>
                                <option value="Helse og apotek">Helse og apotek</option>
                                <option value="Fritid">Fritid</option>
                                <option value="Annet">Annet</option>
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
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="content-card app-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Ny utgift</p>
              <h2>Legg til en utgift</h2>
            </div>
            <a href="/dashboard" className="secondary-link compact-link">
              Gå videre til oversikt
            </a>
          </div>

          <form className="simple-form budget-expense-form" onSubmit={handleAddExpense}>
            <label>
              Utgiftstype
              <p className="field-help">Velg om dette er noe som kommer fast, eller en vanlig utgift i løpet av måneden.</p>
              <select
                value={expenseForm.expenseType}
                onChange={(event) =>
                  setExpenseForm((current) => ({
                    ...current,
                    expenseType: event.target.value,
                  }))
                }
              >
                <option value="variable">Variabel utgift</option>
                <option value="fixed">Fast utgift</option>
              </select>
            </label>

            {expenseForm.expenseType === "fixed" ? (
              <label>
                Navn på utgift
                <p className="field-help">For eksempel bolig, strøm og nettleie eller barnehage.</p>
                <input
                  type="text"
                  placeholder="For eksempel strøm og nettleie"
                  value={expenseForm.name}
                  aria-invalid={expenseError ? "true" : "false"}
                  onChange={(event) =>
                    setExpenseForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
            ) : (
              <>
                <label>
                  Kategori
                  <p className="field-help">Velg det som passer best for utgiften du registrerer.</p>
                  <select
                    value={expenseForm.category}
                    onChange={(event) =>
                      setExpenseForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                  >
                    <option value="Mat">Mat</option>
                    <option value="Transport">Transport</option>
                    <option value="Helse og apotek">Helse og apotek</option>
                    <option value="Fritid">Fritid</option>
                    <option value="Annet">Annet</option>
                  </select>
                </label>

                <label>
                  Kort beskrivelse
                  <p className="field-help">Dette er valgfritt, men gjør det lettere å kjenne igjen utgiften senere.</p>
                  <input
                    type="text"
                    placeholder="For eksempel middag ute"
                    value={expenseForm.note}
                    onChange={(event) =>
                      setExpenseForm((current) => ({
                        ...current,
                        note: event.target.value,
                      }))
                    }
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
                onChange={(event) =>
                  setExpenseForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
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

      <section className="section split-section budget-insight-grid">
        <div className="content-card accent-card app-panel">
          <p className="eyebrow">Gode råd</p>
          <h2>Et ryddig budsjett trenger ikke være komplisert</h2>
          <div className="stack-list">
            {budgetNotes.map((note) => (
              <div key={note} className="soft-note">
                {note}
              </div>
            ))}
          </div>
        </div>

        <div className="content-card app-panel budget-summary-card">
          <p className="eyebrow">Kort oppsummering</p>
          <h2>Slik ser budsjettet ut akkurat nå</h2>
          <div className="budget-breakdown">
            <div className="budget-breakdown-row">
              <span>Inntekt</span>
              <strong>{formatCurrency(storedBudget.income)}</strong>
            </div>
            <div className="budget-breakdown-row">
              <span>Faste utgifter</span>
              <strong>-{formatCurrency(fixedExpenses)}</strong>
            </div>
            <div className="budget-breakdown-row">
              <span>Variable utgifter</span>
              <strong>-{formatCurrency(variableExpenses)}</strong>
            </div>
            <div className="budget-breakdown-row budget-breakdown-total">
              <span>Igjen denne måneden</span>
              <strong>{formatCurrency(leftThisMonth)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section savings-goal-section">
        <div className="section-heading savings-heading">
          <p className="eyebrow">Sparemål</p>
          <h2>Følg sparingen din på en enkel måte</h2>
          <p>
            Når du først har oversikt over utgiftene, blir det lettere å se hva du kan sette
            til side og hvordan du ligger an mot målet ditt.
          </p>
        </div>

        <div className="app-grid-metrics budget-summary-grid">
          <article className="feature-card metric-card accent-metric-card">
            <p className="eyebrow">Mulig å spare nå</p>
            <h2>{formatCurrency(possibleSavings)}</h2>
            <p>Det du har igjen når månedens utgifter er trukket fra.</p>
          </article>
          <article className="feature-card metric-card">
            <p className="eyebrow">Sparemål</p>
            <h2>{formatCurrency(storedBudget.savingsGoal)}</h2>
            <p>Det du ønsker å sette til side i løpet av denne måneden.</p>
          </article>
          <article className="feature-card metric-card accent-metric-card">
            <p className="eyebrow">Faktisk spart</p>
            <h2>{formatCurrency(actualSavedAmount)}</h2>
            <p>Det du har registrert som spart så langt denne måneden.</p>
          </article>
          <article className="feature-card metric-card savings-status-card">
            <p className="eyebrow">Status</p>
            <h2>{savingsStatus.title}</h2>
            <p>{savingsStatus.description}</p>
          </article>
        </div>

        <div className="savings-grid">
          <div className="content-card app-panel">
            <p className="eyebrow">Sparelinjer</p>
            <h2>Fordel sparingen din på flere steder</h2>
            {savingsEntries.length === 0 ? (
              <div className="empty-state compact-empty-state">
                <h3>Ingen sparelinjer ennå</h3>
                <p>
                  Legg inn det du faktisk har spart, for eksempel på BSU, sparekonto eller i fond.
                </p>
              </div>
            ) : (
              <div className="table-list">
                {savingsEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={
                      editingSavingsId === entry.id ? "expense-item expense-item-editing" : "expense-item"
                    }
                  >
                    <div className="table-row savings-row">
                      <div>
                        <strong>{entry.name}</strong>
                        <p>Registrert som faktisk spart denne måneden</p>
                      </div>
                      <div className="expense-row-actions">
                        <strong>{formatCurrency(entry.amount)}</strong>
                        <div className="inline-action-links">
                          <button
                            type="button"
                            className="text-action button-reset"
                            onClick={() => handleEditSavingsEntry(entry)}
                          >
                            Rediger
                          </button>
                          <button
                            type="button"
                            className="text-action button-reset"
                            onClick={() => handleDeleteSavingsEntry(entry.id)}
                          >
                            Slett
                          </button>
                        </div>
                      </div>
                    </div>

                    {editingSavingsId === entry.id ? (
                      <form className="inline-edit-card" onSubmit={handleSaveEditedSavingsEntry}>
                        <p className="inline-edit-label">Du redigerer denne sparelinjen</p>

                        <label>
                          Sparetype
                          <input
                            type="text"
                            value={editSavingsForm.name}
                            aria-invalid={editSavingsError ? "true" : "false"}
                            onChange={(event) => {
                              setEditSavingsForm((current) => ({
                                ...current,
                                name: event.target.value,
                              }));
                              if (editSavingsError) {
                                setEditSavingsError("");
                              }
                            }}
                          />
                        </label>

                        <label>
                          Beløp spart
                          <input
                            type="number"
                            value={editSavingsForm.amount}
                            aria-invalid={editSavingsError ? "true" : "false"}
                            onChange={(event) => {
                              setEditSavingsForm((current) => ({
                                ...current,
                                amount: event.target.value,
                              }));
                              if (editSavingsError) {
                                setEditSavingsError("");
                              }
                            }}
                          />
                        </label>

                        {editSavingsError ? <p className="form-error">{editSavingsError}</p> : null}

                        <div className="action-row">
                          <button type="submit" className="primary-link button-reset">
                            Lagre endring
                          </button>
                          <button
                            type="button"
                            className="secondary-link button-reset"
                            onClick={() => {
                              setEditingSavingsId(null);
                              setEditSavingsError("");
                            }}
                          >
                            Avbryt
                          </button>
                        </div>
                      </form>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            <div className="budget-breakdown-note savings-total-note">
              <span>Forskjell til sparemålet</span>
              <strong>
                {actualSavedAmount >= storedBudget.savingsGoal
                  ? `${formatCurrency(actualSavedAmount - storedBudget.savingsGoal)} foran`
                  : `${formatCurrency(storedBudget.savingsGoal - actualSavedAmount)} igjen`}
              </strong>
              <p>Du ser raskt om faktisk spart er over, likt eller under det du ønsket å spare.</p>
            </div>
          </div>

          <div className="content-card app-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Legg til sparing</p>
                <h2>Registrer hva du faktisk har spart</h2>
              </div>
            </div>

            <form className="simple-form" onSubmit={handleAddSavingsEntry}>
              <label>
                Sparetype
                <p className="field-help">For eksempel fond og aksjer, BSU eller sparekonto.</p>
                <input
                  type="text"
                  placeholder="For eksempel BSU"
                  value={savingsForm.name}
                  aria-invalid={savingsError ? "true" : "false"}
                  onChange={(event) => {
                    setSavingsForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }));
                    if (savingsError) {
                      setSavingsError("");
                    }
                  }}
                />
              </label>

              <label>
                Beløp spart
                <input
                  type="number"
                  placeholder="1000"
                  value={savingsForm.amount}
                  aria-invalid={savingsError ? "true" : "false"}
                  onChange={(event) => {
                    setSavingsForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }));
                    if (savingsError) {
                      setSavingsError("");
                    }
                  }}
                />
              </label>

              {savingsError ? <p className="form-error">{savingsError}</p> : null}

              <div className="action-row">
                <button type="submit" className="primary-link button-reset">
                  Legg til sparelinje
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="budget-action-box">
          <p className="eyebrow">Neste steg</p>
          <h2>Du er klar til å se måneden samlet</h2>
          <p>
            Når du har gått gjennom både budsjettet og sparingen, blir det lettere å se hele
            månedsbildet i oversikten.
          </p>
          <div className="action-row">
            <a href="/dashboard" className="primary-link compact-link">
              Fortsett til oversikt
            </a>
            <ResetBudgetButton className="secondary-link button-reset compact-link" />
          </div>
          <p className="helper-text">
            Hvis du vil teste på nytt, kan du slette tallene dine og starte fra begynnelsen.
          </p>
        </div>
      </section>
    </main>
  );
}
