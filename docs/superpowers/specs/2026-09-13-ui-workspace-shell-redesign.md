# Design: Workspace Shell UI Redesign

**Date:** 2026-09-13  
**Status:** Ready for user review  
**Scope decision:** Full-app visual redesign (Approach 1 — Workspace Shell), keep innStrat brand, calculator light-touch only, landing page out of scope (peer removal).

---

## 1. Goals & non-goals

### Goals

- Make the demo feel like a coherent **product workspace**, not a marketing pitch + bolted-on forms.
- Improve hierarchy, spacing, clarity, and consistency across auth → home → projects → calculator chrome.
- Keep **all existing logic and user flows** (routes, auth session, project draft/save, calculator modes, engines, tabs, save/export behavior).
- Keep brand identity: **innStrat logo** + primary **`#5262ed`**, navy text tones.

### Non-goals

- Do **not** redesign or rewrite calculator computation UI structure (forms, DCF tables, binomial, accordion sections, tab locking). Only token/color sync and removal of redundant copy.
- Do **not** implement/remove the landing page in this workstream — another owner removes it from source. Spec assumes entry is auth/app pages once landing is gone.
- Do **not** change auth rules, project persistence APIs, or calculator engines/stores.
- Do **not** introduce a new design system package or dark-mode product theme.
- Do **not** add dashboard fake stats, extra marketing sections, or new features.

---

## 2. Visual system

### Brand tokens (retain)

| Token | Value | Role |
| --- | --- | --- |
| `--brand` / primary | `#5262ed` | CTA, focus, active states |
| `--brand-hover` | `#9ca6ff` | Hover on primary |
| `--brand-deep` | `#3f4dd4` | Pressed / emphasis |
| `--navy` | `#373b53` | Primary text / headings |
| `--navy-deep` | `#0b0f19` | Strong contrast accents |
| `--content-bg` | `#f8f8fb` | App canvas |
| `--content-border` | `#ebecf5` | Dividers / soft borders |

### Surfaces & chrome

- **Default product chrome:** light workspace (`content-bg` + white surfaces).
- Retire **`ChartBackground` as the primary shell** for Sign In, Sign Up, and About. Replace with the same light workspace language as Home/Projects (`content-bg` canvas + white panel). No chart SVG backdrop.
- Panels: white surface, soft border, modest radius (`rounded-2xl`), light shadow — used only as **interaction/content containers** (forms, project list), not decorative card spam.

### Typography

- Keep **Geist Sans / Mono** already in `layout.tsx`.
- Hierarchy:
  - Page title: clear, navy, tight tracking
  - Section title: semibold navy
  - Body: muted-foreground for supporting copy
  - Helper tips: small muted text — **not amber/warning** unless the message is truly a warning/error
- Remove demo chrome copy that weakens polish: **`UrlCaption`** paths (`www.innstrat.com/innoster/realoptions...`) on auth/about.

### Components to evolve (presentation only)

Centralize in `src/components/demo/chrome.tsx` (+ `globals.css` tokens if needed):

- `AppShell` — sticky header (logo | context title | actions), consistent main padding/max-width
- `Panel`, `Field`, `TextInput`, `SelectInput`, `PurpleButton` — align radii, focus rings, hover to the same shell
- Deprecate visual reliance on `ChartBackground` / `UrlCaption` for product pages (may keep exports temporarily unused or delete usages)

### Motion

- Short fade-in for panel content (~150–200ms)
- Button hover/focus transitions already present — keep subtle
- No decorative looping animations

---

## 3. Information architecture & flows (unchanged)

```
[Landing — peer removes] → Sign Up / Sign In → Home
  → New Project → Calculator (draft) → Save → Open Existing
  → Open Existing → Calculator (saved)
About remains reachable from auth chrome (link), not a marketing funnel dependency.
```

**Invariant:** same routes, same query params (`draft`, `projectId`, `mode`), same session/project local storage behavior, same calculator locked case mode behavior.

When landing is removed by the peer, `/` should resolve to whatever that change specifies (e.g. redirect to `/signin` or `/home`). This redesign does not own that routing change.

---

## 4. Screen designs

### 4.1 Sign In / Sign Up

- Light full-page workspace; centered form panel (`max-w-lg` / signup slightly wider if needed).
- Header row: `BrandMark` + link to About (and cross-link Sign In ↔ Sign Up).
- Title + one short subtitle (product name), then fields — same fields and validation behavior as today.
- Primary full-width Login / Create account CTA.
- Errors stay red; success/info messages use muted or brand — not amber-as-default.
- Remove UrlCaption and ChartBackground backdrop.

### 4.2 About

- Same light shell as auth.
- Content in one readable panel: existing benefit copy retained (edit only for typography/spacing).
- CTA → `/signup` unchanged.
- Remove decorative dark chart shell and redundant About self-link confusion in header (header: logo + Sign In / Get started as appropriate).

### 4.3 Home

- `AppShell` with context title “Real Options Valuation” + Sign out.
- Replace sparse “two giant pills only” with a clearer **hub**:
  - One compact page heading under the shell (e.g. “Choose how to continue”) — **do not** repeat full BrandBlock marketing H1 under the header logo.
  - Two primary actions as **large choice tiles** (New Project / Open Existing): short one-line description under each label; same destinations (`/projects/new`, `/projects`).
- No fake KPIs or project stats (demo may have zero projects).

### 4.4 New Project

- `AppShell` + form panel.
- Keep fields: Project Title, Project Valuation, Valuation Case; same options and `onNext` draft → calculator flow.
- Replace amber tips (“Single selection”, “From here the program will go…”) with muted one-liners only where the label doesn’t already explain; otherwise remove.
- Back / Next button row unchanged in meaning.

### 4.5 Open Existing (Projects)

- `AppShell` + list panel.
- Keep select-then-Open behavior and empty state messaging (tone cleaned).
- Selected row: brand-tint highlight (existing pattern refined).
- Remove the amber instructional paragraph (“From here any selected file…”); empty state + button labels are enough. Open/Back unchanged.

### 4.6 Calculator page chrome + calculator body

**Page chrome (`/calculator`):**

- Align header with `AppShell` visual language (logo, title, draft/save status, Discard draft, Back to Home).
- Outer white container border/shadow match Panel styling.

**Calculator body (`financial-modeling`):**

- **Keep structure:** tabs, accordion sections, forms, tables, modals, save button behavior.
- **Allowed changes only:**
  - Sync CSS variables / `calculator.css` colors to shell tokens (borders, focus, active tab, KPI highlight) so it doesn’t look like a foreign widget.
  - Remove or demote **redundant informational UI copy** that doesn’t affect operation (demo-ish tips, duplicate subtitles if any surface in host chrome).
- **Do not** restructure form grids, change tab locking, or alter save/export visibility rules.

---

## 5. Content / copy cleanup rules

| Pattern | Action |
| --- | --- |
| `UrlCaption` demo URLs | Remove from product UI |
| Amber helper for normal guidance | Restyle to muted or delete if label already explains |
| “System should send verify email…” on landing | Landing out of scope; on signup keep message but style as info, not broken marketing footer |
| Duplicate BrandBlock mega-title under header that already shows brand | Prefer compact page title to reduce repetition |

---

## 6. Technical approach

1. Update shared chrome + tokens in `chrome.tsx` / `globals.css`.
2. Restyle pages: `signin`, `signup`, `about`, `home`, `projects`, `projects/new`, `calculator` page header wrapper.
3. Light pass on `calculator.css` (+ only if needed, minor class tweaks in calculator view host) for color sync and tip cleanup.
4. Leave engines, stores, `lib/projects`, `lib/auth` logic untouched.
5. Do not edit landing `src/app/page.tsx` as part of this redesign unless required for compile after peer deletion — prefer peer’s removal PR.

### Risk controls

- Visual-only diffs in page components; behavior covered by existing vitest where applicable (`projects` tests) — run `npm test` / smoke key flows after implementation.
- No changes to persisted project shape or calculator snapshot format.

---

## 7. Success criteria

- Client perceives a **unified, professional workspace** from auth through projects.
- Brand still reads as innStrat (logo + `#5262ed`).
- Calculator remains familiar; only feels color-aligned and less “noisy” from tips.
- All previous flows still work without re-training users on new steps.
- Landing absence does not break this redesign’s screens.

---

## 8. Decisions log

| Decision | Choice |
| --- | --- |
| Scope | Entire app UI except landing (peer) and deep calculator restructure |
| Brand | Keep innStrat palette (option A) |
| Calculator | Light color sync + remove redundant info only |
| Approach | Workspace Shell (option 1) |
| Landing | Out of scope — peer removes from source |
