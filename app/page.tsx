const features = [
  {
    title: "Full oversikt hver måned",
    description: "Se hva som kommer inn, hva som går ut og hvor mye du faktisk har igjen å bruke.",
  },
  {
    title: "Enkelt å komme i gang",
    description: "Registrer inntekt og utgifter manuelt på få minutter, uten avansert oppsett.",
  },
  {
    title: "Laget for norske husholdninger",
    description: "Norsk språk, beløp i kroner og fokus på vanlige utgifter i norsk privatøkonomi.",
  },
];

const trustPoints = [
  "Enkel å forstå, også hvis du ikke liker budsjetter og regneark",
  "Norsk språk og beløp i kroner",
  "Oversikt uten kompliserte økonomibegreper",
];

const safetyPoints = [
  {
    title: "Laget for vanlige husholdninger",
    text: "Tjenesten er laget for privatkunder som vil ha bedre oversikt i hverdagen.",
  },
  {
    title: "Rolig og enkelt oppsett",
    text: "Du begynner med de viktigste tallene og kan bygge videre i ditt eget tempo.",
  },
  {
    title: "Tydelig månedsbilde",
    text: "Du ser raskt hva som kommer inn, hva som går ut og hva du har igjen å bruke.",
  },
];

const steps = [
  {
    title: "Opprett konto",
    description: "Du kommer raskt i gang og får en enkel introduksjon til tjenesten.",
  },
  {
    title: "Fyll inn tallene dine",
    description: "Legg inn inntekt, faste utgifter og sparemål i et enkelt oppsett.",
  },
  {
    title: "Følg måneden",
    description: "Se budsjettet ditt og få en enkel månedsoversikt som oppdateres underveis.",
  },
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Privatøkonomi gjort enklere</p>
          <h1>Få en enkel oversikt over hva du har å rutte med hver måned.</h1>
          <p className="lead">
            Samle inntekt, faste kostnader og vanlige utgifter på ett sted, så ser
            du raskt hva som er brukt og hva du fortsatt har igjen.
          </p>

          <div className="trust-list" aria-label="Hvorfor tjenesten er enkel å stole på">
            {trustPoints.map((point) => (
              <span key={point} className="trust-pill">
                {point}
              </span>
            ))}
          </div>

          <div className="hero-actions">
            <a href="/onboarding" className="primary-link hero-primary-link">
              Start med oppsettet
            </a>
            <a href="/budget" className="secondary-link">
              Se hvordan budsjettet ser ut
            </a>
            <a href="/dashboard" className="secondary-link">
              Se månedsoversikten
            </a>
          </div>
        </div>

        <div className="summary-card">
          <p className="summary-label">Eksempel på månedsoversikt</p>
          <div className="summary-row">
            <span>Inntekt</span>
            <strong>35 000 kr</strong>
          </div>
          <div className="summary-row">
            <span>Utgifter</span>
            <strong>22 198 kr</strong>
          </div>
          <div className="summary-row">
            <span>Sparemål</span>
            <strong>3 000 kr</strong>
          </div>
          <div className="summary-row total">
            <span>Igjen denne måneden</span>
            <strong>9 802 kr</strong>
          </div>
          <p className="summary-note">
            Du ser raskt hva som er satt av, hva som er brukt og hva du fortsatt har igjen denne måneden.
          </p>
        </div>
      </section>

      <section className="trust-band" aria-label="Trygghetspunkter">
        <div className="trust-band-heading">
          <p className="eyebrow">Hvorfor dette føles enkelt</p>
          <h2>En rolig og forståelig start på bedre oversikt</h2>
        </div>
        {safetyPoints.map((point) => (
          <article key={point.title} className="trust-card">
            <h3>{point.title}</h3>
            <p>{point.text}</p>
          </article>
        ))}
      </section>

      <section id="mvp" className="section">
        <div className="section-heading">
          <p className="eyebrow">Hva du får</p>
          <h2>En enkel tjeneste for bedre kontroll i hverdagen</h2>
          <p>
            Her får du en enkel og forståelig oversikt over økonomien din, uten unødvendige
            detaljer. Målet er å hjelpe deg med å planlegge måneden og unngå overraskelser.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-section">
        <div className="content-card">
          <p className="eyebrow">Slik fungerer det</p>
          <h2>Tre enkle steg til bedre oversikt</h2>
          <div className="stack-list">
            {steps.map((step, index) => (
              <article key={step.title} className="step-card">
                <div className="step-number">0{index + 1}</div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div id="pricing" className="content-card accent-card">
          <p className="eyebrow">Pris</p>
          <h2>Én enkel pris, uten unødvendige valg</h2>
          <p className="price">99 kr per måned</p>
          <p>
            Du får tilgang til hele tjenesten for én fast månedspris. Ingen kompliserte
            prisnivåer, bare en enkel løsning for deg som vil ha bedre oversikt.
          </p>
          <ul className="price-list">
            <li>Månedsoversikt over inntekt og utgifter</li>
            <li>Enkel budsjettering med norske kroner</li>
            <li>Oppsett som er lett å forstå og bruke</li>
          </ul>
          <div className="inline-links">
            <a href="/budget" className="secondary-link">
              Se hvordan budsjettet ser ut
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
