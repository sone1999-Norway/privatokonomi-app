# PrivatOkonomi

En enkel startversjon av en abonnementsbasert webapp for privatokonomi i Norge, bygget med `Next.js` og `TypeScript`.

## Hva som er satt opp

- `Next.js` med `App Router`
- `TypeScript`
- enkel landingsside i `app/page.tsx`
- global styling i `app/globals.css`

## Kom i gang

Du trenger `Node.js` installert lokalt først.

```bash
npm install
npm run dev
```

Deretter åpner du `http://localhost:3000`.

## Viktige filer

- `app/layout.tsx`: global layout
- `app/page.tsx`: forsiden
- `app/globals.css`: styling
- `package.json`: scripts og dependencies

## Neste steg

1. Legg til `login`-side
2. Lag `dashboard`-side
3. Koble til database og auth
4. Legg til abonnement med Stripe
