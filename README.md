# Innoster Real Options — FE Demo

Frontend-only demo covering PPT slides 33–42 (Innoster Real Options), with mock auth and the financial calculator copied from Innstrat `financial-modeling`.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm test` — unit tests (case-mode mapping)
- `npm run lint` — eslint

## Demo flow

1. `/` Landing → Get Started
2. `/about` Why + benefits
3. `/signup` → mock verify note → `/signin`
4. Login (any password; email prefilled) → `/home`
5. New Project → `/calculator` or Open Existing → pick case → `/calculator`

Session and project list live in `localStorage`.
