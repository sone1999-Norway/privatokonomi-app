"use client";

import { useEffect, useMemo, useState } from "react";
import { ResetBudgetButton } from "@/components/reset-budget-button";
import { savingsItems, variableExpenseItems } from "@/lib/demo-data";
import {
  calculateLeftThisMonth,
  calculateSavedAmount,
  calculateVariableExpenses,
  defaultBudgetFormData,
  formatCurrency,
  getAmountDisplay,
  readBudgetFromStorage,
  readSavingsEntriesFromStorage,
  readVariableExpensesFromStorage,
  saveBudgetToStorage,
  saveSavingsEntriesToStorage,
  type SavingsEntry,
  type VariableExpense,
} from "@/lib/local-budget";

const savingsTypeOptions = ["Fond og aksjer", "BSU", "Sparekonto", "Annet"];

function getSavingsStatus(goal: number, savedAmount: number) {
  if (savedAmount >= goal) {
    return {
      title: "Du ligger godt an med sparingen denne måneden",
      description: "Du har nå spart minst like mye som målet ditt for denne måneden.",
    };
  }

  const difference = goal - savedAmount;

  return {
    title: `Du mangler ${formatCurrency(difference)} for å nå sparemålet`,
    description: "Du kan bruke dette som en enkel påminnelse om hvor mye som gjenstår.",
  };
}

export default function SavingPage() {
  const [storedBudget, setStoredBudget] = useState(defaultBudgetFormData);
  const [variableEntries, setVariableEntries] = useState<VariableExpense[]>([]);
  const [savingsEntries, setSavingsEntries] = useState<SavingsEntry[]>([]);
  const [isEditingSavingsGoal, setIsEditingSavingsGoal] = useState(false);
  const [savingsGoalError, setSavingsGoalError] = useState("");
  const [savingsGoalForm, setSavingsGoalForm] = useState("");
  const [editingSavingsId, setEditingSavingsId] = useState<string | null>(null);
  const [editSavingsError, setEditSavingsError] = useState("");
  const [editSavingsForm, setEditSavingsForm] = useState({
    name: "",
    amount: "",
  });
  const [savingsError, setSavingsError] = useState("");
  const [savingsForm, setSavingsForm] = useState({
    name: "",
    amount: "",
  });

  useEffect(() => {
    const savedBudget = readBudgetFromStorage();
    const savedExpenses = readVariableExpensesFromStorage();
    const savedSavings = readSavingsEntriesFromStorage();

    if (savedBudget) {
      setStoredBudget(savedBudget);
      setSavingsGoalForm(String(savedBudget.savingsGoal));
    } else {
      setSavingsGoalForm(String(defaultBudgetFormData.savingsGoal));
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

    if (savedSavings) {
      setSavingsEntries(savedSavings);
    } else {
      setSavingsEntries(
        savingsItems.map((item, index) => ({
          id: `saving-demo-${index + 1}`,
          name: item.name,
          amount: item.amount,
        })),
      );
    }
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
      ),
    [storedBudget.fixedExpenses, storedBudget.income, variableExpenses],
  );
  const availableToSave = useMemo(() => Math.max(leftThisMonth, 0), [leftThisMonth]);
  const actualSavedAmount = useMemo(() => calculateSavedAmount(savingsEntries), [savingsEntries]);
  const savingsStatus = useMemo(
    () => getSavingsStatus(storedBudget.savingsGoal, actualSavedAmount),
    [actualSavedAmount, storedBudget.savingsGoal],
  );
  const isInMinus = leftThisMonth < 0;
  const isAtBalance = leftThisMonth === 0;
  const hasNoAvailableToSave = leftThisMonth <= 0;
  const minusAmount = Math.abs(leftThisMonth);
  const availableDisplay = isInMinus
    ? getAmountDisplay(0, "neutral")
    : getAmountDisplay(availableToSave, "saving");
  const actualSavedDisplay = getAmountDisplay(actualSavedAmount, "saving");
  const savingsGoalDisplay = getAmountDisplay(storedBudget.savingsGoal, "neutral");
  const differenceToGoal = actualSavedAmount - storedBudget.savingsGoal;
  const differenceDisplay = getAmountDisplay(differenceToGoal, "balance");
  const overAvailable = actualSavedAmount > availableToSave;

  const savingPageCopy = useMemo(() => {
    if (isInMinus) {
      return {
        heroTitle: "Du er i minus denne måneden",
        heroBody: "Du har brukt mer enn du har tilgjengelig.",
        heroNote:
          actualSavedAmount > 0
            ? "Du har registrert sparing denne måneden, men ligger fortsatt i minus totalt."
            : "Få budsjettet i balanse før du sparer videre.",
        actionLabel: "Gå tilbake til budsjett",
        actionHref: "/budget",
        actionHelp: "Se hvor du kan justere utgiftene.",
        availableHelp: "Du har ikke noe igjen å spare nå.",
        savedHelp:
          actualSavedAmount > 0
            ? "Dette er sparing du har registrert denne måneden."
            : "Ingen sparing registrert ennå.",
        targetTitle: "Før du sparer videre, bør du få budsjettet i balanse",
        targetBody: "Få budsjettet i balanse før du sparer videre.",
        emptyTitle: "Ingen sparelinjer ennå",
        emptyBody: "Få først budsjettet i balanse, så kan du registrere sparing.",
        formTitle: "Sparing blir tilgjengelig når budsjettet er i balanse",
        formBody: "Du må først få budsjettet i balanse før du registrerer sparing.",
      };
    }

    if (isAtBalance) {
      return {
        heroTitle: "Ingen midler tilgjengelig for sparing akkurat nå",
        heroBody: "Du går i null denne måneden.",
        heroNote:
          actualSavedAmount > 0
            ? "Du har registrert sparing, men har ikke mer å sette til side nå."
            : "Du har ikke noe tilgjengelig til sparing akkurat nå.",
        actionLabel: "Gå tilbake til budsjett",
        actionHref: "/budget",
        actionHelp: "Se om du kan frigjøre litt mer til sparing.",
        availableHelp: "Du har ikke noe igjen å spare denne måneden.",
        savedHelp:
          actualSavedAmount > 0
            ? "Dette er sparing du har registrert så langt."
            : "Ingen sparing registrert ennå.",
        targetTitle: "Når du får litt mer rom, blir det lettere å jobbe mot målet",
        targetBody: "Frigjør litt mer i budsjettet før du sparer videre.",
        emptyTitle: "Ingen sparelinjer ennå",
        emptyBody: "Når du får noe tilgjengelig å spare, kan du registrere det her.",
        formTitle: "Sparing blir tilgjengelig når budsjettet gir mer rom",
        formBody: "Du må først frigjøre litt mer i budsjettet.",
      };
    }

    return {
      heroTitle: "Du har penger tilgjengelig til sparing denne måneden",
      heroBody: savingsStatus.description,
      heroNote: overAvailable
        ? "Du har registrert mer sparing enn det som er tilgjengelig denne måneden."
        : "Neste steg er å registrere eller fordele sparingen din.",
      actionLabel: "Registrer sparing",
      actionHref: "#legg-til-sparing",
      actionHelp: "Legg inn det du faktisk har spart denne måneden.",
      availableHelp: "Dette kommer direkte fra budsjettsiden.",
      savedHelp:
        actualSavedAmount > 0
          ? "Dette er det du har registrert som spart."
          : "Ingen sparing registrert ennå.",
      targetTitle: savingsStatus.title,
      targetBody:
        differenceToGoal >= 0
          ? `${formatCurrency(differenceToGoal)} foran målet`
          : `${formatCurrency(Math.abs(differenceToGoal))} igjen til målet`,
      emptyTitle: "Ingen sparelinjer ennå",
      emptyBody: "Legg inn det du faktisk har spart.",
      formTitle: "Registrer hva du faktisk har spart",
      formBody: "",
    };
  }, [
    actualSavedAmount,
    differenceToGoal,
    isAtBalance,
    isInMinus,
    overAvailable,
    savingsStatus.description,
    savingsStatus.title,
  ]);

  function resetSavingsForm() {
    setSavingsForm({
      name: "",
      amount: "",
    });
    setSavingsError("");
  }

  function handleSaveSavingsGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!savingsGoalForm.trim()) {
      setSavingsGoalError("Skriv inn sparemålet ditt.");
      return;
    }

    const savingsGoal = Number(savingsGoalForm);

    if (Number.isNaN(savingsGoal) || savingsGoal < 0) {
      setSavingsGoalError("Skriv inn et gyldig sparemål.");
      return;
    }

    const nextBudget = { ...storedBudget, savingsGoal };
    setStoredBudget(nextBudget);
    saveBudgetToStorage(nextBudget);
    setIsEditingSavingsGoal(false);
    setSavingsGoalError("");
  }

  function handleAddSavingsEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasNoAvailableToSave) {
      setSavingsError("Vurder å redusere utgifter før du sparer mer.");
      return;
    }

    const amount = Number(savingsForm.amount);

    if (!savingsForm.name.trim()) {
      setSavingsError("Skriv inn hvilken type sparing dette gjelder.");
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

  function handleEditSavingsEntry(entry: SavingsEntry) {
    setEditingSavingsId(entry.id);
    setEditSavingsForm({
      name: entry.name,
      amount: String(entry.amount),
    });
    setEditSavingsError("");
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

  function handleSaveEditedSavingsEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingSavingsId) {
      return;
    }

    if (!editSavingsForm.name.trim()) {
      setEditSavingsError("Skriv inn hvilken type sparing dette gjelder.");
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
          <p className="eyebrow">Sparing</p>
          <h1 className="page-title">Følg hva du faktisk sparer denne måneden</h1>
          <p>Se hva du har tilgjengelig å spare, og hva du faktisk har spart.</p>
        </div>

        <div className="app-status-card saving-status-top">
          <p className="eyebrow">Sparing denne måneden</p>
          <h2>{savingPageCopy.heroTitle}</h2>
          <p>{savingPageCopy.heroBody}</p>
          <p className="status-note">{savingPageCopy.heroNote}</p>
          <div className="action-row">
            <a href={savingPageCopy.actionHref} className="primary-link compact-link">
              {savingPageCopy.actionLabel}
            </a>
          </div>
          <p className="helper-text">{savingPageCopy.actionHelp}</p>
        </div>
      </section>

      <section className="app-grid-metrics budget-summary-grid">
        <article className="feature-card metric-card accent-metric-card">
          <p className="eyebrow">Tilgjengelig å spare</p>
          <h2 className={availableDisplay.toneClassName}>{availableDisplay.text}</h2>
          <p>Basert på inntekt {formatCurrency(storedBudget.income)}.</p>
        </article>
        <article className="feature-card metric-card accent-metric-card">
          <p className="eyebrow">Faktisk spart</p>
          <h2 className={actualSavedDisplay.toneClassName}>{actualSavedDisplay.text}</h2>
          <p>{savingPageCopy.savedHelp}</p>
        </article>
        <article className="feature-card metric-card">
          <p className="eyebrow">Sparemål</p>
          <h2>{savingsGoalDisplay.text}</h2>
          <p>Målet for denne måneden.</p>
          {isEditingSavingsGoal ? (
            <form className="inline-edit-card compact-inline-edit" onSubmit={handleSaveSavingsGoal}>
              <label>
                Sparemål
                <input
                  type="number"
                  value={savingsGoalForm}
                  aria-invalid={savingsGoalError ? "true" : "false"}
                  onChange={(event) => {
                    setSavingsGoalForm(event.target.value);
                    if (savingsGoalError) {
                      setSavingsGoalError("");
                    }
                  }}
                />
              </label>
              {savingsGoalError ? <p className="form-error">{savingsGoalError}</p> : null}
              <div className="inline-action-links">
                <button type="submit" className="text-action button-reset">Lagre</button>
                <button
                  type="button"
                  className="text-action button-reset"
                  onClick={() => {
                    setSavingsGoalForm(String(storedBudget.savingsGoal));
                    setSavingsGoalError("");
                    setIsEditingSavingsGoal(false);
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
                onClick={() => setIsEditingSavingsGoal(true)}
              >
                Endre sparemål
              </button>
            </div>
          )}
        </article>
      </section>

      <section className="section savings-goal-section">
        <div className="budget-breakdown-note savings-inline-status">
          <span>Status mot mål</span>
          <strong className={hasNoAvailableToSave ? "" : differenceDisplay.toneClassName}>
            {hasNoAvailableToSave
              ? "Du må være i balanse før du kan spare"
              : savingPageCopy.targetTitle}
          </strong>
          <p>
            {hasNoAvailableToSave
              ? "Juster budsjettet før du registrerer mer sparing."
              : savingPageCopy.targetBody}
          </p>
        </div>

        <div className="savings-grid">
          <div className="content-card app-panel expense-list-panel savings-list-panel">
            <p className="eyebrow">Sparelinjer</p>
            <h2>Slik er sparingen fordelt akkurat nå</h2>
            {savingsEntries.length === 0 ? (
              <div className="empty-state compact-empty-state">
                <h3>{savingPageCopy.emptyTitle}</h3>
                <p>{savingPageCopy.emptyBody}</p>
              </div>
            ) : (
              <div className="table-list expense-list savings-entry-list">
                {savingsEntries.map((entry) => {
                  const savingDisplay = getAmountDisplay(entry.amount, "saving");

                  return (
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
                          <strong className={savingDisplay.toneClassName}>{savingDisplay.text}</strong>
                          <div className="inline-action-links">
                            <button type="button" className="text-action button-reset" onClick={() => handleEditSavingsEntry(entry)}>
                              Rediger
                            </button>
                            <button type="button" className="text-action button-reset" onClick={() => handleDeleteSavingsEntry(entry.id)}>
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
                                setEditSavingsForm((current) => ({ ...current, name: event.target.value }));
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
                                setEditSavingsForm((current) => ({ ...current, amount: event.target.value }));
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
                  );
                })}
              </div>
            )}

            <div className="budget-breakdown-note savings-total-note">
              <span>Forskjell til sparemålet</span>
              <strong className={hasNoAvailableToSave ? "" : differenceDisplay.toneClassName}>
                {hasNoAvailableToSave
                  ? "Kom i balanse før du vurderer målet"
                  : differenceToGoal >= 0
                    ? `${formatCurrency(differenceToGoal)} foran`
                    : `${formatCurrency(Math.abs(differenceToGoal))} igjen`}
              </strong>
              <p>
                {hasNoAvailableToSave
                  ? "Bruk sparemålet når budsjettet er i balanse igjen."
                  : "Du ser raskt om du ligger foran eller bak."}
              </p>
            </div>
          </div>

          <div id="legg-til-sparing" className="content-card app-panel saving-form-panel">
            <p className="eyebrow">Legg til sparing</p>
            <h2>{savingPageCopy.formTitle}</h2>
            {hasNoAvailableToSave ? (
              <form className="simple-form saving-form-disabled" aria-disabled="true">
                <label>
                  Sparetype
                  <input type="text" placeholder="For eksempel BSU" disabled />
                </label>

                <label>
                  Beløp spart
                  <input type="number" placeholder="1000" disabled />
                </label>

                <p className="form-error">Du må være i balanse før du kan spare.</p>
              </form>
            ) : (
              <form className="simple-form" onSubmit={handleAddSavingsEntry}>
                <label>
                  Sparetype
                  <p className="field-help">Velg en vanlig type under, eller skriv inn din egen.</p>
                  <div className="category-options">
                    {savingsTypeOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={
                          savingsForm.name === option
                            ? "category-option category-option-selected"
                            : "category-option"
                        }
                        onClick={() => setSavingsForm((current) => ({ ...current, name: option }))}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="For eksempel feriesparing"
                    value={savingsForm.name}
                    aria-invalid={savingsError ? "true" : "false"}
                    onChange={(event) => {
                      setSavingsForm((current) => ({ ...current, name: event.target.value }));
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
                      setSavingsForm((current) => ({ ...current, amount: event.target.value }));
                      if (savingsError) {
                        setSavingsError("");
                      }
                    }}
                  />
                </label>

                {savingsError ? <p className="form-error">{savingsError}</p> : null}

                <div className="action-row">
                  <button
                    type="submit"
                    className="primary-link button-reset"
                  >
                    Legg til sparelinje
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="budget-action-box">
          <p className="eyebrow">Neste steg</p>
          <div className="action-row">
            {isInMinus ? (
              <a href="/budget" className="primary-link compact-link">
                Gå tilbake til budsjett
              </a>
            ) : (
              <a href="/dashboard" className="primary-link compact-link">
                Fortsett til oversikt
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
