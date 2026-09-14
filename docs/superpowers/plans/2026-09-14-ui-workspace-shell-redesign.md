# Workspace Shell UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Innoster Real Options demo into a unified light Workspace Shell (auth → about → home → projects → calculator chrome) while keeping innStrat brand tokens and all existing logic/flows; calculator gets color sync + tip cleanup only.

**Architecture:** Evolve shared presentation primitives in `src/components/demo/chrome.tsx` (add light `AuthShell`, tighten `AppShell`/`Panel`/`PurpleButton`), restyle pages to consume them, lightly align `calculator.css` tokens. Do not touch engines, stores, auth persistence, or project mapping logic. Do not edit landing `src/app/page.tsx` (peer removal).

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS 4, existing demo chrome components, Vitest for regression on `lib/projects`.

## Global Constraints

- Keep brand primary `#5262ed`, navy `#373b53` / `#0b0f19`, content-bg `#f8f8fb` (see spec §2).
- Do **not** change routes, query params (`draft`, `projectId`, `mode`), session/project localStorage behavior, or calculator locked case mode.
- Do **not** restructure calculator forms/tables/tabs/modals/save-export rules.
- Do **not** edit `src/app/page.tsx` (landing) unless peer removal already deleted it and compile breaks — prefer peer PR.
- Helper tips: muted text only; amber only for true warnings (e.g. unsaved draft).
- Remove all product-UI usages of `UrlCaption` and `ChartBackground`.
- No new features, fake dashboard stats, or design-system packages.
- Spec: `docs/superpowers/specs/2026-09-13-ui-workspace-shell-redesign.md`

## File map

| File | Responsibility |
| --- | --- |
| `src/components/demo/chrome.tsx` | Shared chrome: add `AuthShell`; refine `AppShell`, `Panel`, `PurpleButton`, inputs; keep `BrandMark`; leave `ChartBackground`/`UrlCaption`/`BrandBlock` exported but unused by product pages (or delete if no remaining imports after landing peer) |
| `src/app/globals.css` | Optional: tiny fade utility / token tweak only if needed |
| `src/app/signin/page.tsx` | Light AuthShell + form (logic unchanged) |
| `src/app/signup/page.tsx` | Light AuthShell + form; info message muted |
| `src/app/about/page.tsx` | Light AuthShell + content panel |
| `src/app/home/page.tsx` | Hub with choice tiles; no BrandBlock H1 |
| `src/app/projects/new/page.tsx` | Form panel; remove amber tips / BrandBlock |
| `src/app/projects/page.tsx` | List panel; remove amber tip / BrandBlock |
| `src/app/calculator/page.tsx` | Align header/container with AppShell visuals; draft tip may stay amber |
| `src/features/financial-modeling/calculator.css` | Token sync only |
| `src/lib/projects.test.ts` | Unchanged regression suite — run after UI tasks |

---

### Task 1: AuthShell + chrome polish

**Files:**
- Modify: `src/components/demo/chrome.tsx`
- Modify (optional): `src/app/globals.css`
- Test: `src/lib/projects.test.ts` (regression only — no logic change)

**Interfaces:**
- Consumes: existing `BrandMark`, `cn`, Next `Link`/`Image`
- Produces:
  - `export function AuthShell({ children, maxWidthClassName? }: { children: React.ReactNode; maxWidthClassName?: string }): JSX.Element`
  - Existing `AppShell`, `Panel`, `PurpleButton`, `Field`, `TextInput`, `SelectInput` remain with same prop shapes

- [ ] **Step 1: Run existing regression tests (baseline green)**

Run: `npm test`
Expected: PASS (all `projects.test.ts` cases)

- [ ] **Step 2: Add `AuthShell` and polish shared chrome**

In `src/components/demo/chrome.tsx`, add after `BrandMark` (or near `AppShell`):

```tsx
/** Light full-page shell for auth / about (replaces ChartBackground on product pages). */
export function AuthShell({
  children,
  maxWidthClassName = "max-w-lg",
}: {
  children: React.ReactNode;
  maxWidthClassName?: string;
}) {
  return (
    <div className="min-h-screen bg-content-bg">
      <div
        className={cn(
          "mx-auto flex min-h-screen flex-col justify-center px-4 py-10",
          maxWidthClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
```

Update `AppShell` main padding if needed to match calculator (keep sticky header + `max-w-[1400px]`).

Update `PurpleButton` `ghost` variant for **light** backgrounds (auth no longer dark):

```tsx
ghost:
  "border border-content-border bg-white text-navy hover:border-brand hover:text-brand",
```

Keep `primary` / `secondary` / `outline` brand colors unchanged (`bg-brand`, etc.).

Update `Panel` to include optional enter animation class if using tw-animate:

```tsx
"animate-in fade-in duration-200 rounded-2xl border border-content-border bg-white p-6 shadow-sm md:p-8"
```

If `animate-in` is unavailable in this Tailwind setup, skip animation — do not add a new animation library.

Leave `ChartBackground`, `UrlCaption`, `BrandBlock` in the file for now (landing may still import until peer removes it).

- [ ] **Step 3: Re-run regression tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/demo/chrome.tsx src/app/globals.css
git commit -m "$(cat <<'EOF'
Add light AuthShell and align demo chrome for workspace UI.

EOF
)"
```

---

### Task 2: Restyle Sign In, Sign Up, About

**Files:**
- Modify: `src/app/signin/page.tsx`
- Modify: `src/app/signup/page.tsx`
- Modify: `src/app/about/page.tsx`

**Interfaces:**
- Consumes: `AuthShell`, `BrandMark`, `Panel`, `Field`, `TextInput`, `PurpleButton` from `@/components/demo/chrome`
- Produces: same submit handlers / navigation as today (no logic edits)

- [ ] **Step 1: Rewrite Sign In layout (logic untouched)**

Replace `ChartBackground` / `UrlCaption` / `onDark` mark with:

```tsx
import {
  AuthShell,
  BrandMark,
  Field,
  Panel,
  PurpleButton,
  TextInput,
} from "@/components/demo/chrome";

// inside return:
return (
  <AuthShell>
    <div className="mb-6 flex items-center justify-between gap-3">
      <BrandMark onDark={false} />
      <PurpleButton href="/about" variant="outline">
        About
      </PurpleButton>
    </div>

    <Panel>
      <h2 className="text-2xl font-semibold tracking-tight text-navy">Sign In</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Financial Modelling – Real Options Valuation
      </p>
      <div className="mt-4 h-px w-full bg-content-border" />

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        {/* same Field/TextInput/error/Login/forgot handlers as before */}
      </form>

      <div className="mt-6 border-t border-content-border pt-4 text-sm text-navy">
        <span className="font-semibold">New User?</span>{" "}
        <Link href="/signup" className="text-brand underline">
          Create an account
        </Link>
      </div>
    </Panel>
  </AuthShell>
);
```

Keep `onSubmit`, `setSession`, `router.push("/home")`, validation strings identical.

- [ ] **Step 2: Rewrite Sign Up layout**

Use `AuthShell maxWidthClassName="max-w-3xl"`. Header: `BrandMark onDark={false}` + outline/link to `/signin`. Remove `UrlCaption`. Keep all fields and `onSubmit` behavior.

Style the verify-email / `message` line as muted info (not amber):

```tsx
<p className="max-w-md text-right text-sm text-muted-foreground">
  {message ||
    "System should send verify email link before account is finally created"}
</p>
```

- [ ] **Step 3: Rewrite About layout**

```tsx
return (
  <AuthShell maxWidthClassName="max-w-4xl">
    <div className="mb-6 flex items-center justify-between gap-3">
      <BrandMark onDark={false} />
      <div className="flex gap-2">
        <PurpleButton href="/signin" variant="outline">
          Sign In
        </PurpleButton>
        <PurpleButton href="/signup">Get Started</PurpleButton>
      </div>
    </div>
    <Panel>
      {/* keep BENEFITS list + paragraph copy; CTA href="/signup" */}
    </Panel>
  </AuthShell>
);
```

Remove header self-link “About” + `UrlCaption` + `ChartBackground`.

- [ ] **Step 4: Smoke check**

Run: `npm test`
Expected: PASS

Manually (or `npm run dev`): open `/signin`, `/signup`, `/about` — light background, logo readable, forms submit as before.

- [ ] **Step 5: Commit**

```bash
git add src/app/signin/page.tsx src/app/signup/page.tsx src/app/about/page.tsx
git commit -m "$(cat <<'EOF'
Restyle auth and about pages onto light AuthShell.

EOF
)"
```

---

### Task 3: Restyle Home + Projects hub pages

**Files:**
- Modify: `src/app/home/page.tsx`
- Modify: `src/app/projects/new/page.tsx`
- Modify: `src/app/projects/page.tsx`

**Interfaces:**
- Consumes: `AppShell`, `Panel`, `PurpleButton`, `TextInput`, `SelectInput`
- Produces: unchanged navigation targets and draft/open handlers

- [ ] **Step 1: Home hub tiles**

Remove `BrandBlock`. Keep `AppShell` title “Real Options Valuation” + Sign out.

```tsx
<div className="mb-6">
  <h1 className="text-2xl font-semibold tracking-tight text-navy md:text-3xl">
    Choose how to continue
  </h1>
  <p className="mt-1 text-sm text-muted-foreground">
    Create a valuation case or open one you already saved.
  </p>
</div>

<div className="grid gap-4 sm:grid-cols-2">
  <Link
    href="/projects/new"
    className="rounded-2xl border border-content-border bg-white p-6 shadow-sm transition hover:border-brand hover:shadow-md"
  >
    <p className="text-lg font-semibold text-navy">New Project</p>
    <p className="mt-1 text-sm text-muted-foreground">
      Start a new NPV or Real Options case.
    </p>
  </Link>
  <Link
    href="/projects"
    className="rounded-2xl border border-content-border bg-white p-6 shadow-sm transition hover:border-brand hover:shadow-md"
  >
    <p className="text-lg font-semibold text-navy">Open Existing</p>
    <p className="mt-1 text-sm text-muted-foreground">
      Review or edit a saved valuation case.
    </p>
  </Link>
</div>
```

Import `Link` from `next/link`. Do not add fake KPIs.

- [ ] **Step 2: New Project page**

Remove `BrandBlock`. Keep form fields, options, `onNext` → `setProjectDraft` + `router.push(\`/calculator?draft=1&mode=${caseMode}\`)`.

Remove amber helpers:

- Delete `<p className="mt-1 text-xs text-amber-700">Single selection</p>`
- Delete the amber “From here the program will go…” paragraph (labels + Next are enough)

Keep Back / Next buttons.

- [ ] **Step 3: Projects list page**

Remove `BrandBlock` and the amber paragraph (“From here any selected file…”).

Keep select-then-Open, empty state (tone may stay informative), `onOpen` URL building unchanged.

Optional polish: selected row classes stay brand-tint (`bg-brand/10 ring-1 ring-brand/40`).

- [ ] **Step 4: Verify project mapping still green**

Run: `npm test`
Expected: PASS (`mapValuationCaseToMode`, `buildProjectLabel`)

- [ ] **Step 5: Commit**

```bash
git add src/app/home/page.tsx src/app/projects/new/page.tsx src/app/projects/page.tsx
git commit -m "$(cat <<'EOF'
Restyle home and projects hub with workspace choice tiles.

EOF
)"
```

---

### Task 4: Calculator page chrome + CSS token sync

**Files:**
- Modify: `src/app/calculator/page.tsx`
- Modify: `src/features/financial-modeling/calculator.css`
- Do **not** modify engine/store files

**Interfaces:**
- Consumes: existing `FinancialCalculatorModule` props unchanged
- Produces: same save/discard/home navigation behavior

- [ ] **Step 1: Align calculator page header with AppShell look**

In `CalculatorInner` return, keep structure but ensure:

- Outer: `min-h-screen bg-content-bg`
- Header: sticky, `border-b border-content-border bg-white`, same horizontal padding as `AppShell` (`px-4 sm:px-6`, max width `1400px`)
- `BrandMark onDark={false}`
- Draft status may remain `text-amber-700` (true warning)
- Save success stays `text-emerald-700`
- Content wrapper: `rounded-2xl border border-content-border bg-white shadow-sm` (match `Panel`)

Do not change `handleSave`, query param reading, or module props.

- [ ] **Step 2: Light `calculator.css` sync**

Only adjust colors that drift from shell tokens. Prefer CSS variables already defined:

- Active tab / primary accents already use `var(--primary)` — verify `--primary` in `globals.css` remains `#5262ed`
- If any hardcoded purple/gray differs from tokens, replace with `var(--border)`, `var(--card)`, `var(--primary)`, `var(--muted-foreground)`
- Do **not** change layout rules for grids, tables, modal sizes, print `@page`

No need to strip input tooltips (`CalculatorInputLabel`) — those are operational help, not demo UrlCaption noise.

- [ ] **Step 3: Build + test**

Run:

```bash
npm test
npm run build
```

Expected: tests PASS; build succeeds (ignore landing file unless peer already removed it).

- [ ] **Step 4: Manual smoke checklist**

1. Sign in → Home tiles → New Project → Next → calculator loads with locked tab  
2. Save → appears under Open Existing → Open works  
3. About / Sign up still navigable from auth  
4. Calculator tabs/forms still interactive; Save still works  

- [ ] **Step 5: Commit**

```bash
git add src/app/calculator/page.tsx src/features/financial-modeling/calculator.css
git commit -m "$(cat <<'EOF'
Align calculator chrome and CSS tokens with workspace shell.

EOF
)"
```

---

### Task 5: Final sweep — unused imports & verification

**Files:**
- Possibly touch any page still importing `ChartBackground` / `UrlCaption` / `BrandBlock` **except** `src/app/page.tsx`
- Modify: `src/components/demo/chrome.tsx` only if dead exports should stay for landing peer

- [ ] **Step 1: Grep for leftover product usages**

Run:

```bash
rg "ChartBackground|UrlCaption|BrandBlock|amber-700" src/app src/components --glob '!**/page.tsx'
```

Also check:

```bash
rg "ChartBackground|UrlCaption|BrandBlock" src/app
```

Expected for this redesign:

- `src/app/page.tsx` may still use ChartBackground until peer removes landing  
- No ChartBackground/UrlCaption on signin/signup/about/home/projects  
- `amber-700` only on calculator draft warning (and signup must not use amber)

- [ ] **Step 2: Fix any leftovers found in product pages**

Apply the same muted/remove rules from the spec §5.

- [ ] **Step 3: Final verify**

```bash
npm test
npm run build
```

Expected: PASS / success

- [ ] **Step 4: Commit if there were sweep fixes**

```bash
git add -u src/
git commit -m "$(cat <<'EOF'
Finish workspace UI sweep: remove leftover demo chrome usages.

EOF
)"
```

If working tree clean, skip empty commit.

---

## Spec coverage (self-review)

| Spec item | Task |
| --- | --- |
| Light workspace / retire ChartBackground on auth/about | 1–2 |
| Remove UrlCaption | 2, 5 |
| AuthShell / AppShell / Panel / buttons | 1 |
| Sign In / Sign Up / About screens | 2 |
| Home choice tiles, no BrandBlock H1 | 3 |
| New Project / Projects tip cleanup | 3 |
| Calculator chrome + CSS sync only | 4 |
| Landing out of scope | Global + Task 5 |
| Logic/flow unchanged | All tasks (handlers preserved) |
| Brand tokens kept | Global + Task 1/4 |

## Placeholder / consistency check

- No TBD steps; concrete component APIs (`AuthShell`) defined in Task 1.
- `PurpleButton` ghost restyled for light surfaces — auth buttons use `outline`/`ghost` accordingly in Task 2.
- Calculator amber draft tip intentionally retained as warning.
