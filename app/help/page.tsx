import { ResetBudgetButton } from "@/components/reset-budget-button";

const helpPoints = [
  "Du starter i budsjettet med å legge inn inntekt, faste utgifter og sparemål.",
  "Deretter ser du budsjettet ditt og kan registrere variable utgifter underveis.",
  "Månedsoversikten viser hvordan tallene endrer seg når du oppdaterer budsjettet.",
];

export default function HelpPage() {
  return (
    <main className="page-shell app-page-shell">
      <section className="app-hero">
        <div className="app-hero-copy">
          <p className="eyebrow">Hjelp</p>
          <h1 className="page-title">Slik fungerer prototypen</h1>
          <p>
            Denne prototypen viser hvordan en enkel tjeneste for privatøkonomi kan
            fungere i nettleseren. Du kan teste flyten fra oppstart til budsjett og
            månedsoversikt uten å opprette ekte konto eller koble til bank.
          </p>
        </div>

        <div className="app-status-card">
          <p className="eyebrow">Lokal lagring</p>
          <h2>Det du legger inn lagres bare i denne nettleseren</h2>
          <p>
            Tallene du skriver inn lagres lokalt i nettleseren din, slik at du kan
            prøve prototypen med egne beløp uten backend eller innlogging.
          </p>
        </div>
      </section>

      <section className="app-main-grid">
        <div className="content-card app-panel">
          <p className="eyebrow">Kort forklart</p>
          <h2>Hva du kan teste</h2>
          <div className="stack-list">
            {helpPoints.map((point) => (
              <div key={point} className="soft-note">
                {point}
              </div>
            ))}
          </div>
        </div>

        <aside className="app-side-stack">
          <div className="content-card app-panel">
            <p className="eyebrow">Start på nytt</p>
            <h2>Nullstill testdata</h2>
            <p>
              Hvis du vil teste prototypen på nytt med andre tall, kan du slette de
              lagrede opplysningene og starte på nytt i budsjettet.
            </p>
            <div className="action-row">
              <ResetBudgetButton className="primary-link button-reset compact-link" />
            </div>
          </div>

          <div className="content-card accent-card app-panel">
            <p className="eyebrow">Tips til testing</p>
            <h2>Hold det enkelt</h2>
            <p>
              Be testbrukeren tenke høyt mens de går gjennom oppstart, budsjett og
              oversikt. Da blir det lettere å se hva som er tydelig, og hva som bør
              forbedres videre.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
