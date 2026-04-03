export default function SignupPage() {
  return (
    <main className="page-shell">
      <section className="content-card narrow-card">
        <p className="eyebrow">Registrering</p>
        <h1 className="page-title">Opprett konto</h1>
        <p className="page-text">
          Kom i gang med en enkel oversikt over inntekter, utgifter og hva du har
          igjen å bruke. Det tar bare noen få minutter å sette opp kontoen.
        </p>

        <form className="simple-form">
          <label>
            E-post
            <input type="email" placeholder="navn@epost.no" />
          </label>

          <label>
            Passord
            <input type="password" placeholder="Velg et passord" />
          </label>

          <button type="submit" className="primary-link button-reset">
            Opprett konto
          </button>
        </form>

        <p className="page-text muted-text">
          Når kontoen er opprettet, kan du legge inn de viktigste tallene dine og få
          en enkel månedsoversikt med én gang.
        </p>
      </section>
    </main>
  );
}
