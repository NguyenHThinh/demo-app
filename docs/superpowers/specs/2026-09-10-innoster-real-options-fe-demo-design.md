# Innoster Real Options — FE Demo Design

**Date:** 2026-09-10  
**Status:** Approved in chat (flow B, About A, stack A, Open Existing B); agent-os skipped  
**Source:** PPT `Programme.Management.Module.-.New (1).pptx` slides 33–42  
**Calculator source:** `/Users/mac/jobs/Innstrat2.0/frontend/src/features/financial-modeling`

## Goal

Build a frontend-only demo of Innoster Real Options that mirrors PPT pages 33–42 (text + page coverage), with mock auth and the existing financial calculator module copied in whole.

## Non-goals

- Real backend / email verification / production auth
- agent-os workflow (project has no `.agent/`; scope already decided)
- Rewriting the calculator UI from scratch

## Page map (PPT → routes)

| PPT | Content | Route |
|-----|---------|-------|
| 33 | Landing hero | `/` |
| 34 + 35 | Why Real Options + benefits (single page) | `/about` |
| 36 | Sign Up | `/signup` |
| 37 | Sign In | `/signin` |
| 38 | New Project / Open Existing | `/home` |
| 39 | New Project form | `/projects/new` |
| 40 & 42 | Calculator (shared) | `/calculator` |
| 41 | Valuation Cases list | `/projects` |

Slides 40 and 42 are one calculator screen entered from New Project or Open Existing.

## Navigation flow

```
/  ──Get Started──► /signup ──Create (mock verify msg)──► /signin
│                      ▲                                    │
│                      └── Create an account ───────────────┤
├──About──► /about ──Get Started──► /signup                 │
│                                                           ▼
└─────────────────────────────────────────────────────► /home
                                                          │
                          ┌── New Project ──► /projects/new ──Next──► /calculator
                          └── Open Existing ──► /projects ──Open──► /calculator
```

Protected: `/home`, `/projects`, `/projects/new`, `/calculator` require mock session.

## Auth (mock)

- Persist session in `localStorage` (e.g. `innoster-demo-session`).
- Sign Up: collect fields as PPT; on Create show message that a verify email link would be sent, then allow continue to Sign In (or auto-session for demo speed — prefer message then navigate to Sign In).
- Sign In: prefill `ola.adio@innstrat.com`; any non-empty password accepted for demo.
- Forgotten username/password: toast/alert “demo only”.
- No real API.

## Projects (localStorage)

- Key e.g. `innoster-demo-projects`.
- Seed list (exact PPT wording):
  - AI in wearables – Option to Delay
  - AI in wearables – Option to Expand
  - EV charging stations – Option to Abandon
  - Robotaxis – Option to Delay
  - Robotaxis – Option to Expand
  - Robotaxis – Option to Abandon
  - Peer-to-Peer Energy Trading – Option to Delay-Expand
  - Product improvement – Classic NPV
- New Project (slide 39):
  - Project Title (text)
  - Project Valuation: `NPV Only` | `Real Options Valuation`
  - Valuation Case: single select `Classic NPV` | `Delay` | `Expand` | `Abandon`
  - Next → save to list + open `/calculator` with mapped `lockedCaseMode` / initial tab
  - Back → `/home`
- Open Existing: select one case → Open → `/calculator` with mode mapped from case name/type.

### Mode mapping

| Case signal | Calculator |
|-------------|------------|
| Classic NPV / NPV Only | `npv` / NPV tab |
| Delay | Delay option tab |
| Expand | Expand option tab |
| Abandon | Abandon option tab |
| Delay-Expand | Expand (or Delay) — pick Expand as primary lock; document in UI if needed |

Use `FinancialCalculatorModule` props: `lockedCaseMode`, `initialTab`, hide real Save/Export API callbacks or no-op for demo.

## Calculator integration

- Copy `src/features/financial-modeling` (and minimal shared UI/utils it imports) from Innstrat2.0 frontend into this repo.
- Resolve imports (aliases, shared components, CSS) so the module builds standalone in the demo app.
- Do not invent a second calculator; FE-only engines already in the module are fine.

## Stack

- Next.js (App Router) + React + Tailwind + Zustand (match Innstrat frontend)
- TypeScript
- Client-side routing + `localStorage` only

## UI / content fidelity

- Branding text exact from PPT: “Innoster Real Options”, “Financial Modelling – Real Options Valuation”, “Powered by InnStrat”.
- Landing copy (33), About body (34), benefits bullets (35), form labels (36–39, 41) match PPT.
- Visual: purple primary (~`#6A2E9F`), light blue financial chart background (reuse/export assets from PPT/screenshots where available).
- URL chrome in PPT (`www.innstrat.com/...`) can be shown as decorative caption for demo fidelity.

## Verification

- All 8 routes reachable; content matches PPT for each mapped slide.
- Mock sign-up → sign-in → home works without network.
- New Project persists and appears in `/projects`.
- Opening a seeded Delay/Expand/Abandon/NPV case opens calculator on the expected tab/mode.
- `yarn dev` (or npm) runs; calculator interactive locally.

## Out of scope for v1

- Pixel-perfect PPT recreation of every decorative shape
- Real email sending
- Multi-user / server persistence
