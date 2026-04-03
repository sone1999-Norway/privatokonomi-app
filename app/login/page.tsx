export default function LoginPage() {
  return (
    <main className="page-shell">
      <section className="content-card narrow-card">
        <p className="eyebrow">Innlogging</p>
        <h1 className="page-title">Logg inn</h1>
        <p className="page-text">
          Logg inn for å se budsjettet ditt, følge utgiftene dine og få oversikt over
          hvor mye du har igjen denne måneden.
        </p>

        <form className="simple-form">
          <label>
            E-post
            <input type="email" placeholder="navn@epost.no" />
          </label>

          <label>
            Passord
            <input type="password" placeholder="********" />
          </label>

          <button type="submit" className="primary-link button-reset">
            Logg inn
          </button>
        </form>

        <p className="page-text muted-text">
          Har du ikke konto ennå? Da kan du opprette en konto og komme raskt i gang.
        </p>
      </section>
    </main>
  );
}
