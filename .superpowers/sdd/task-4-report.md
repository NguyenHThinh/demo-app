# Task 4 Report: Calculator page chrome + CSS token sync

## Scope

- Updated `src/app/calculator/page.tsx`
- Updated `src/features/financial-modeling/calculator.css`
- Did not modify calculator engines, stores, form structure, tables, tabs, modals, or save/export rules

## What changed

### Page chrome

- Kept the existing AppShell-aligned calculator header structure already present in `CalculatorInner`
- Tightened header spacing slightly from `gap-3` to `gap-4` for closer parity with shared shell chrome
- Added the same subtle `animate-in fade-in duration-200` treatment to the calculator host container so the white content panel matches shared `Panel` feel more closely

### CSS token sync

- Explicitly set KPI cards to `var(--card)` so white summary surfaces match shell panel tokens
- Set KPI labels to `var(--muted-foreground)` for shell-consistent secondary text
- Set the DCF table wrapper background to `var(--card)` for consistent panel surface color
- Switched the industry dropdown surface from `var(--card)` to `var(--popover)` to align with token intent for overlay content

## What was intentionally left unchanged

- `handleSave`, query-param behavior, `FinancialCalculatorModule` props, and persistence flow
- Draft warning color (`text-amber-700`)
- All operational calculator help/tooltips
- Grid/table sizing, modal sizing, print rules, and calculation UI structure
- Existing hardcoded positive/negative result colors, since this task called for a light token sync rather than a broader semantic-status color pass

## Verification

### Automated

- `npm test` — PASS
  - `src/lib/projects.test.ts`: 4 tests passed
- `npm run build` — PASS
  - Next.js production build completed successfully
  - Build output included a pre-existing ESLint notice: Next.js plugin not detected in ESLint config
  - Build output also included an npm warning about unknown env config `devdir`

### Lint review

- Reviewed IDE diagnostics on edited files
- Only saw Tailwind suggestions about `max-w-[1400px]` shorthand in `src/app/calculator/page.tsx`
- Did not change those because the same class form is already used in shared shell code and is not a correctness issue

### Manual smoke

- Not run interactively in-browser during this task
- Risk is low because the changes were presentation-only and did not alter calculator state, routing, or save logic

## Self-review

- Confirmed the diff stays within the two files named in the task brief
- Confirmed no engine/store files changed
- Confirmed no layout or behavioral restructuring of calculator forms/tables/tabs/modals
- Confirmed chrome still uses `BrandMark onDark={false}`, sticky header, `bg-content-bg`, and white bordered panel shell

## Concerns / residual risk

- No browser smoke run was performed, so spacing/surface polish is verified by code and build only
- `page.tsx` already matched most of the brief before this task; the final code change there is intentionally very small
