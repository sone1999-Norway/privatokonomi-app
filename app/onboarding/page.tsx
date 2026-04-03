"use client";

import { useEffect, useState } from "react";
import {
  defaultBudgetFormData,
  formatCurrency,
  readBudgetFromStorage,
  saveBudgetToStorage,
} from "@/lib/local-budget";

const onboardingSteps = [
  {
    title: "Månedlig inntekt",
    description: "Legg inn hva du vanligvis får utbetalt hver måned etter skatt.",
    label: "Hva får du vanligvis utbetalt i måneden?",
    placeholder: "35 000",
    helper: "Du kan justere dette senere hvis inntekten varierer.",
  },
  {
    title: "Faste utgifter",
    description: "Start med de faste kostnadene du vet kommer hver måned.",
    label: "Hva går vanligvis til faste utgifter i måneden?",
    placeholder: "16 500",
    helper: "Tenk på husleie, strøm, mobil, lån og abonnementer.",
  },
  {
    title: "Sparemål",
    description: "Velg et enkelt mål for hvor mye du ønsker å sette av hver måned.",
    label: "Hvor mye vil du gjerne sette av til sparing?",
    placeholder: "3 000",
    helper: "Du trenger ikke treffe helt riktig med én gang.",
  },
];

const reassurancePoints = [
  "Du trenger bare å fylle inn tre tall for å komme i gang.",
  "Alt kan justeres senere når du vil gjøre oversikten mer presis.",
  "Målet er å gi deg en enkel start, ikke et komplisert oppsett.",
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const [formValues, setFormValues] = useState({
    income: String(defaultBudgetFormData.income),
    fixedExpenses: String(defaultBudgetFormData.fixedExpenses),
    savingsGoal: String(defaultBudgetFormData.savingsGoal),
  });

  const step = onboardingSteps[currentStep];
  const progressWidth = `${((currentStep + 1) / onboardingSteps.length) * 100}%`;
  const stepField = currentStep === 0 ? "income" : currentStep === 1 ? "fixedExpenses" : "savingsGoal";

  useEffect(() => {
    const savedData = readBudgetFromStorage();

    if (!savedData) {
      return;
    }

    setFormValues({
      income: String(savedData.income),
      fixedExpenses: String(savedData.fixedExpenses),
      savingsGoal: String(savedData.savingsGoal),
    });
  }, []);

  function persistValues(nextValues: typeof formValues) {
    const income = Number(nextValues.income) || 0;
    const fixedExpenses = Number(nextValues.fixedExpenses) || 0;
    const savingsGoal = Number(nextValues.savingsGoal) || 0;

    saveBudgetToStorage({
      income,
      fixedExpenses,
      savingsGoal,
    });
  }

  function validateCurrentStep() {
    const rawValue = formValues[stepField].trim();
    const value = Number(rawValue);

    if (!rawValue) {
      setStepError("Fyll inn et beløp før du går videre.");
      return false;
    }

    if (Number.isNaN(value) || value < 0) {
      setStepError("Skriv inn et gyldig beløp i kroner.");
      return false;
    }

    if (currentStep === 0 && value === 0) {
      setStepError("Månedlig inntekt må være høyere enn 0 kr.");
      return false;
    }

    setStepError("");
    return true;
  }

  return (
    <main className="page-shell onboarding-shell">
      <section className="onboarding-hero">
        <div className="onboarding-hero-copy">
          <p className="eyebrow">Start her</p>
          <h1 className="page-title">Kom i gang på noen få minutter</h1>
          <p>
            Vi begynner med det viktigste, slik at du raskt får en oversikt over
            økonomien din uten å fylle inn mer enn nødvendig.
          </p>
        </div>

        <div className="onboarding-status-card">
          <p className="eyebrow">Fremdrift</p>
          <h2>
            Steg {currentStep + 1} av {onboardingSteps.length}
          </h2>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-bar" style={{ width: progressWidth }} />
          </div>
          <p>{step.title}</p>
        </div>
      </section>

      <section className="onboarding-main-grid">
        <aside className="content-card onboarding-sidebar">
          <p className="eyebrow">Stegene</p>
          <h2>Første oppsett</h2>
          <div className="stack-list">
            {onboardingSteps.map((item, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <button
                  key={item.title}
                  type="button"
                  className={
                    isActive
                      ? "step-card onboarding-step-active"
                      : isCompleted
                        ? "step-card onboarding-step-completed"
                        : "step-card onboarding-step-button"
                  }
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="step-number">{String(index + 1).padStart(2, "0")}</div>
                  <div className="step-copy">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="content-card onboarding-panel">
          <p className="eyebrow">Steg {currentStep + 1}</p>
          <h2>{step.title}</h2>
          <p className="page-text">{step.description}</p>

          <form className="simple-form onboarding-form">
            <label>
              {step.label}
              <input
                type="number"
                placeholder={step.placeholder}
                value={formValues[stepField]}
                aria-invalid={stepError ? "true" : "false"}
                onChange={(event) => {
                  const nextValues = {
                    ...formValues,
                    [stepField]: event.target.value,
                  };

                  setFormValues(nextValues);
                  if (stepError) {
                    setStepError("");
                  }
                  persistValues(nextValues);
                }}
              />
            </label>

            <p className="helper-text">{step.helper}</p>
            {stepError ? <p className="form-error">{stepError}</p> : null}

            <div className="onboarding-actions">
              <button
                type="button"
                className="secondary-link button-reset"
                onClick={() => setCurrentStep((value) => Math.max(value - 1, 0))}
                disabled={currentStep === 0}
              >
                Tilbake
              </button>

              {currentStep < onboardingSteps.length - 1 ? (
                <button
                  type="button"
                  className="primary-link button-reset"
                  onClick={() => {
                    if (!validateCurrentStep()) {
                      return;
                    }
                    persistValues(formValues);
                    setCurrentStep((value) => Math.min(value + 1, onboardingSteps.length - 1));
                  }}
                >
                  Neste steg
                </button>
              ) : (
                <a
                  href="/budget"
                  className="primary-link"
                  onClick={(event) => {
                    if (!validateCurrentStep()) {
                      event.preventDefault();
                      return;
                    }
                    persistValues(formValues);
                  }}
                >
                  Gå videre til budsjett
                </a>
              )}
            </div>
          </form>
        </section>
      </section>

      <section className="trust-band onboarding-trust-band" aria-label="Trygg oppstart">
        {reassurancePoints.map((point) => (
          <article key={point} className="trust-card">
            <p className="trust-card-label">God start</p>
            <p>{point}</p>
          </article>
        ))}
      </section>

      <section className="section">
        <div className="content-card onboarding-next-card">
          <p className="eyebrow">Neste steg</p>
          <h2>Etter oppstarten går du videre til budsjettet ditt</h2>
          <p>
            Når du har lagt inn inntekt, faste utgifter og sparemål, får du en enkel oversikt
            over hva som er satt opp og hva du har igjen denne måneden.
          </p>
          <div className="onboarding-preview">
            <div className="budget-breakdown-row">
              <span>Månedlig inntekt</span>
              <strong>{formatCurrency(Number(formValues.income) || defaultBudgetFormData.income)}</strong>
            </div>
            <div className="budget-breakdown-row">
              <span>Faste utgifter</span>
              <strong>{formatCurrency(Number(formValues.fixedExpenses) || defaultBudgetFormData.fixedExpenses)}</strong>
            </div>
            <div className="budget-breakdown-row">
              <span>Sparemål</span>
              <strong>{formatCurrency(Number(formValues.savingsGoal) || defaultBudgetFormData.savingsGoal)}</strong>
            </div>
          </div>
          <a href="/budget" className="secondary-link">
            Fortsett til budsjett
          </a>
        </div>
      </section>
    </main>
  );
}
