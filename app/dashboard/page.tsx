"use client";

import { useEffect, useMemo, useState } from "react";
import { ResetBudgetButton } from "@/components/reset-budget-button";
import { recentEntries, variableExpenseItems } from "@/lib/demo-data";
import {
  calculateLeftThisMonth,
  calculateTotalExpenses,
  calculateVariableExpenses,
  defaultBudgetFormData,
  formatCurrency,
  getSavingsStatusMessage,
  readBudgetFromStorage,
  readVariableExpensesFromStorage,
  type VariableExpense,
} from "@/lib/local-budget";

export default function DashboardPage() {
  const [storedBudget, setStoredBudget] = useState(defaultBudgetFormData);
  const [variableEntries, setVariableEntries] = useState<VariableExpense[]>([]);

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
  const totalExpenses = useMemo(
    () => calculateTotalExpenses(storedBudget.fixedExpenses, variableExpenses),
    [storedBudget.fixedExpenses, variableExpenses],
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
  const savingsMessage = getSavingsStatusMessage(storedBudget.savingsGoal, leftThisMonth);

  const metrics = [
    { label: "Inntekt", value: formatCurrency(storedBudget.income) },
    { label: "Totale utgifter", value: formatCurrency(totalExpenses) },
    { label: "Igjen denne måneden", value: formatCurrency(leftThisMonth) },
    { label: "Sparemål (mål)", value: formatCurrency(storedBudget.savingsGoal) },
    { label: "Mulig å spare", value: formatCurrency(leftThisMonth) },
  ];

  const monthStatus = [
    leftThisMonth > 0
      ? `Du har fortsatt ${formatCurrency(leftThisMonth)} igjen denne måneden.`
      : "Denne måneden ser strammere ut enn planlagt.",
    "De største faste utgiftene er allerede tatt høyde for.",
    savingsMessage,
  ];
  const latestEntries = [
    recentEntries[0],
    recentEntries[1],
    recentEntries[2],
    ...variableEntries
      .slice(0, 3)
      .map((item) => ({
        name: item.note || item.category,
        category: item.category,
        amount: `-${formatCurrency(item.amount)}`,
      })),
  ];

  return (
    <main className="page-shell app-page-shell">
      <section className="app-hero">
        <div className="app-hero-copy">
          <p className="eyebrow">Oversikt</p>
          <h1 className="page-title">Månedsoversikt</h1>
          <p>
            Her ser du det viktigste samlet på ett sted: hva som har kommet inn,
            hva som er brukt, hva som er igjen denne måneden og hva som kan være mulig å spare.
          </p>
        </div>

        <div className="app-status-card">
          <p className="eyebrow">Månedsstatus</p>
          <h2>
            {leftThisMonth > 0
              ? "Du ligger godt an denne måneden"
              : "Denne måneden krever litt mer kontroll"}
          </h2>
          <p>
            Du har oversikt over både faste og variable utgifter, og ser tydelig
            hva du fortsatt har igjen å disponere uten at sparemålet trekkes automatisk fra.
          </p>
        </div>
      </section>

      <section className="app-grid-metrics overview-metrics-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="feature-card metric-card">
            <p className="eyebrow">{metric.label}</p>
            <h2>{metric.value}</h2>
          </article>
        ))}
      </section>

      <section className="app-main-grid">
        <div className="content-card app-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Siste bevegelser</p>
              <h2>Siste registreringer</h2>
            </div>
            <a href="/budget" className="secondary-link compact-link">
              Se budsjettet ditt
            </a>
          </div>

          <div className="table-list">
            {latestEntries.map((transaction) => (
              <div key={`${transaction.name}-${transaction.amount}`} className="table-row">
                <div>
                  <strong>{transaction.name}</strong>
                  <p>{transaction.category}</p>
                </div>
                <strong>{transaction.amount}</strong>
              </div>
            ))}
          </div>
          {variableEntries.length === 0 ? (
            <div className="empty-state compact-empty-state">
              <h3>Ingen variable utgifter registrert ennå</h3>
              <p>Legg til en utgift på budsjettsiden for å se hvordan måneden endrer seg.</p>
            </div>
          ) : null}
        </div>

        <aside className="app-side-stack">
          <div className="content-card accent-card app-panel">
            <p className="eyebrow">Denne måneden</p>
            <h2>En enkel oppsummering</h2>
            <div className="stack-list">
              {monthStatus.map((item) => (
                <div key={item} className="soft-note">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="content-card app-panel">
            <p className="eyebrow">Tallene dine</p>
            <h2>Slik ser måneden ut akkurat nå</h2>
            <div className="budget-breakdown">
              <div className="budget-breakdown-row">
                <span>Inntekt</span>
                <strong>{formatCurrency(storedBudget.income)}</strong>
              </div>
              <div className="budget-breakdown-row">
                <span>Totale utgifter</span>
                <strong>-{formatCurrency(totalExpenses)}</strong>
              </div>
              <div className="budget-breakdown-row">
                <span>Sparemål</span>
                <strong>{formatCurrency(storedBudget.savingsGoal)}</strong>
              </div>
              <div className="budget-breakdown-row budget-breakdown-total">
                <span>Igjen denne måneden</span>
                <strong>{formatCurrency(leftThisMonth)}</strong>
              </div>
              <div className="budget-breakdown-row budget-breakdown-total">
                <span>Mulig å spare</span>
                <strong>{formatCurrency(leftThisMonth)}</strong>
              </div>
            </div>
          </div>

          <div className="content-card app-panel">
            <p className="eyebrow">Neste steg</p>
            <h2>Hold oversikten oppdatert</h2>
            <p>
              Registrer nye utgifter underveis, så blir månedsbildet mer presist og
              lettere å følge uke for uke.
            </p>
            <div className="action-row">
              <a href="/budget" className="secondary-link compact-link">
                Gå tilbake til budsjett
              </a>
              <ResetBudgetButton className="secondary-link button-reset compact-link" />
            </div>
            <p className="helper-text">
              Velg dette hvis du vil slette de lagrede tallene og starte oppsettet på nytt.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
