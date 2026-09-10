# Innoster Real Options FE Demo — Implementation Plan

> **For agentic workers:** Execute task-by-task; verify with build/test at end.

**Goal:** Frontend-only demo of PPT slides 33–42 with mock auth and copied financial-modeling calculator.

**Architecture:** Next.js App Router shell; `localStorage` auth/projects; shared calculator route for slides 40 & 42.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, Zustand, TypeScript (match Innstrat2.0 frontend).

## Global Constraints

- Text content matches PPT 33–42
- Calculator copied from `financial-modeling`, not rewritten
- Auth mock only — no real API
- agent-os skipped

## Tasks

- [ ] 1. Scaffold Next.js + deps in `/Users/mac/demo-app`
- [ ] 2. Copy `financial-modeling` + fix external imports
- [ ] 3. Mock auth + project store (localStorage)
- [ ] 4. Pages: `/`, `/about`, `/signup`, `/signin`, `/home`, `/projects/new`, `/projects`, `/calculator`
- [ ] 5. Wire flow + case→tab mapping
- [ ] 6. `yarn build` / lint / tests; fix until green
