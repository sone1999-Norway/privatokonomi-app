"use client";

import { useEffect, useMemo, useState } from "react";
import { ResetBudgetButton } from "@/components/reset-budget-button";
import { recentEntries, variableExpenseItems } from "@/lib/demo-data";
import {
  calculateLeftThisMonth,
  calculateTotalExpenses,
  calculateVariableExpenses,
  defaultBudgetFormData,
  getAmountDisplay,
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
  const incomeDisplay = getAmountDisplay(storedBudget.income, "income");
  const totalExpensesDisplay = getAmountDisplay(totalExpenses, "expense");
  const leftThisMonthDisplay = getAmountDisplay(leftThisMonth, "balance");
  const metrics = [
    { label: "Inntekt", ...incomeDisplay },
    { label: "Totale utgifter", ...totalExpensesDisplay },
    { label: "Igjen denne måneden", ...leftThisMonthDisplay },
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
        amount: -item.amount,
      })),
  ];

  return (
    <main className="page-shell app-page-shell">
      <section className="app-hero">
        <div className="app-hero-copy">
          <p className="eyebrow">Oversikt</p>
          <h1 className="page-title">Månedsoversikt</h1>
          <p>Se hva som har kommet inn, hva som er brukt og hva du har igjen.</p>
        </div>

        <div className="app-status-card">
          <p className="eyebrow">Månedsstatus</p>
          <h2>
            {leftThisMonth > 0
              ? "Du ligger godt an denne måneden"
              : "Denne måneden krever litt mer kontroll"}
          </h2>
          <p>
            Du ser raskt om måneden fortsatt er under kontroll.
          </p>
        </div>
      </section>

      <section className="app-grid-metrics overview-metrics-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="feature-card metric-card">
            <p className="eyebrow">{metric.label}</p>
            <h2 className={metric.toneClassName}>{metric.text}</h2>
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
                <strong
                  className={getAmountDisplay(
                    transaction.amount,
                    transaction.amount >= 0 ? "income" : "expense",
                  ).toneClassName}
                >
                  {getAmountDisplay(
                    transaction.amount,
                    transaction.amount >= 0 ? "income" : "expense",
                  ).text}
                </strong>
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
          <div className="content-card app-panel">
            <p className="eyebrow">Neste steg</p>
            <h2>Legg til nye utgifter fortløpende</h2>
            <div className="action-row">
              <a href="/budget" className="primary-link compact-link">
                Gå til budsjett
              </a>
              <a href="/saving" className="secondary-link compact-link">
                Se sparing
              </a>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
