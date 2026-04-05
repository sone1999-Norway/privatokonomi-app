const trustPoints = [
  "Enkel å forstå",
  "Uten kompliserte begreper",
];

const steps = [
  {
    title: "Fyll inn tallene dine",
    description: "Start med inntekt og faste utgifter.",
  },
  {
    title: "Følg budsjettet",
    description: "Legg til utgifter og se hva du har igjen.",
  },
  {
    title: "Registrer sparing",
    description: "Se hva som faktisk blir satt til side.",
  },
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Privatøkonomi gjort enklere</p>
          <h1>Få kontroll på pengene dine – uten kompliserte verktøy</h1>

          <div className="trust-list" aria-label="Hvorfor tjenesten er enkel å stole på">
            {trustPoints.map((point) => (
              <span key={point} className="trust-pill">
                {point}
              </span>
            ))}
          </div>

          <div className="hero-actions">
            <a href="/budget" className="primary-link hero-primary-link">
              Gå til budsjett
            </a>
          </div>
        </div>
      </section>

      <section className="section split-section">
        <div className="content-card">
          <p className="eyebrow">Slik fungerer det</p>
          <h2>Tre enkle steg</h2>
          <div className="home-steps-list">
            {steps.map((step, index) => (
              <article key={step.title} className="step-card home-step-card">
                <div className="step-number home-step-number">0{index + 1}</div>
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
          <h2>Én enkel pris</h2>
          <p className="price">99 kr per måned</p>
          <ul className="price-list">
            <li>Månedsoversikt over inntekt og utgifter</li>
            <li>Budsjett og sparing på ett sted</li>
            <li>Norsk språk og beløp i kroner</li>
          </ul>
          <div className="inline-links">
            <a href="/budget" className="primary-link">
              Gå til budsjett
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
