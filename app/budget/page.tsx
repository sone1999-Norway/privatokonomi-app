"use client";

import { useEffect, useMemo, useState } from "react";
import { ResetBudgetButton } from "@/components/reset-budget-button";
import {
  fixedExpenseItems,
  monthlyOverview,
  variableExpenseItems,
} from "@/lib/demo-data";
import {
  calculateLeftThisMonth,
  calculateVariableExpenses,
  defaultBudgetFormData,
  formatCurrency,
  readBudgetFromStorage,
  readVariableExpensesFromStorage,
  saveVariableExpensesToStorage,
  type VariableExpense,
} from "@/lib/local-budget";

const budgetNotes = [
  "Start med faste kostnader, så blir resten av måneden lettere å planlegge.",
  "Små utgifter blir enklere å følge når du har et tydelig utgangspunkt.",
  "Et enkelt budsjett er ofte bedre enn et avansert budsjett du ikke bruker.",
];

export default function BudgetPage() {
  const [storedBudget, setStoredBudget] = useState(defaultBudgetFormData);
  const [variableEntries, setVariableEntries] = useState<VariableExpense[]>([]);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editExpenseError, setEditExpenseError] = useState("");
  const [editExpenseForm, setEditExpenseForm] = useState({
    category: "Mat",
    amount: "",
    note: "",
  });
  const [expenseError, setExpenseError] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    category: "Mat",
    amount: "",
    note: "",
  });

  useEffect(() => {
    const savedBudget = readBudgetFromStorage();
    const savedExpenses = readVariableExpensesFromStorage();

    if (savedBudget) {
      setStoredBudget(savedBudget);
    }

    if (savedExpenses) {
      setVariableEntries(savedExpenses);
      return;
    }

    setVariableEntries(
      variableExpenseItems.map((item, index) => ({
        id: `demo-${index + 1}`,
        category: item.category,
        amount: item.amount,
        note: item.note,
      })),
    );
  }, []);

  const variableExpenses = useMemo(
    () => calculateVariableExpenses(variableEntries),
    [variableEntries],
  );
  const leftThisMonth = useMemo(
    () =>
      calculateLeftThisMonth(
        storedBudget.income,
        storedBudget.fixedExpenses,
        variableExpenses,
        storedBudget.savingsGoal,
      ),
    [storedBudget.fixedExpenses, storedBudget.income, storedBudget.savingsGoal, variableExpenses],
  );
  const statusText = leftThisMonth > 0 ? monthlyOverview.status : "Strammere måned";

  function resetExpenseForm() {
    setExpenseForm({
      category: "Mat",
      amount: "",
      note: "",
    });
    setExpenseError("");
  }

  function handleAddExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(expenseForm.amount);

    if (!expenseForm.amount.trim()) {
      setExpenseError("Skriv inn hvor mye utgiften var.");
      return;
    }

    if (!amount || amount <= 0) {
      setExpenseError("Beløpet må være høyere enn 0 kr.");
      return;
    }

    setExpenseError("");

    const nextEntry = {
      id: crypto.randomUUID(),
      category: expenseForm.category,
      amount,
      note: expenseForm.note.trim(),
    };

    const nextEntries = [nextEntry, ...variableEntries];

    setVariableEntries(nextEntries);
    saveVariableExpensesToStorage(nextEntries);
    resetExpenseForm();
  }

  function handleEditExpense(expense: VariableExpense) {
    setEditingExpenseId(expense.id);
    setEditExpenseForm({
      category: expense.category,
      amount: String(expense.amount),
      note: expense.note,
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

  return (
    <main className="page-shell app-page-shell">
      <section className="app-hero">
        <div className="app-hero-copy">
          <p className="eyebrow">Budsjett</p>
          <h1 className="page-title">Se hvordan pengene kan fordeles denne måneden</h1>
          <p>
            Her får du en enkel oversikt over inntekt, faste utgifter, vanlige
            hverdagsutgifter og hva du har igjen når det viktigste er trukket fra.
          </p>
        </div>

        <div className="app-status-card">
          <p className="eyebrow">Budsjettstatus</p>
          <h2>Du har {formatCurrency(leftThisMonth)} igjen denne måneden</h2>
          <p>
            Når faste utgifter, variable utgifter og sparing er satt opp, ser du
            raskt hva du fortsatt har å rutte med.
          </p>
        </div>
      </section>

      <section className="app-grid-metrics">
        <article className="feature-card metric-card">
          <p className="eyebrow">Inntekt</p>
          <h2>{formatCurrency(storedBudget.income)}</h2>
        </article>
        <article className="feature-card metric-card">
          <p className="eyebrow">Faste utgifter</p>
          <h2>{formatCurrency(storedBudget.fixedExpenses)}</h2>
        </article>
        <article className="feature-card metric-card">
          <p className="eyebrow">Variable utgifter</p>
          <h2>{formatCurrency(variableExpenses)}</h2>
        </article>
      </section>

      <section className="app-grid-metrics budget-summary-grid">
        <article className="feature-card metric-card">
          <p className="eyebrow">Sparemål</p>
          <h2>{formatCurrency(storedBudget.savingsGoal)}</h2>
        </article>
        <article className="feature-card metric-card accent-metric-card">
          <p className="eyebrow">Igjen denne måneden</p>
          <h2>{formatCurrency(leftThisMonth)}</h2>
        </article>
        <article className="feature-card metric-card">
          <p className="eyebrow">Enkel status</p>
          <h2>{statusText}</h2>
        </article>
      </section>

      <section className="app-main-grid">
        <div className="app-side-stack">
          <div className="content-card app-panel">
            <p className="eyebrow">Faste utgifter</p>
            <h2>Det som vanligvis kommer hver måned</h2>
            <div className="table-list">
              {fixedExpenseItems.map((item) => (
                <div key={item.name} className="table-row">
                  <div>
                    <strong>{item.name}</strong>
                  </div>
                  <strong>{item.amount}</strong>
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
        </div>

        <div className="content-card app-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Ny utgift</p>
              <h2>Legg til en variabel utgift</h2>
            </div>
            <a href="/dashboard" className="secondary-link compact-link">
              Gå videre til oversikt
            </a>
          </div>

          <form className="simple-form budget-expense-form" onSubmit={handleAddExpense}>
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
              Beløp
              <input
                type="number"
                placeholder="450"
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

            {expenseError ? <p className="form-error">{expenseError}</p> : null}

            <div className="action-row">
              <button type="submit" className="primary-link button-reset">
                Legg til utgift
              </button>
            </div>
          </form>

          <div className="budget-breakdown">
            <div className="budget-breakdown-row">
              <span>Inntekt</span>
              <strong>{formatCurrency(storedBudget.income)}</strong>
            </div>
            <div className="budget-breakdown-row">
              <span>Faste utgifter</span>
              <strong>-{formatCurrency(storedBudget.fixedExpenses)}</strong>
            </div>
            <div className="budget-breakdown-row">
              <span>Variable utgifter</span>
              <strong>-{formatCurrency(variableExpenses)}</strong>
            </div>
            <div className="budget-breakdown-row">
              <span>Sparemål</span>
              <strong>-{formatCurrency(storedBudget.savingsGoal)}</strong>
            </div>
            <div className="budget-breakdown-row budget-breakdown-total">
              <span>Igjen denne måneden</span>
              <strong>{formatCurrency(leftThisMonth)}</strong>
            </div>
          </div>

          <div className="budget-action-box">
            <p className="eyebrow">Neste steg</p>
            <h2>Du er klar til å se måneden samlet</h2>
            <p>
              Når budsjettet er satt opp, blir det lettere å se om hverdagsbruken din
              holder seg innenfor planen.
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
        </div>
      </section>
    </main>
  );
}
