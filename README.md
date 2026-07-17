# dy-dashboard

**🔗 Live demo: [dy-dashboard-five.vercel.app](https://dy-dashboard-five.vercel.app/)**

End-to-end project: **Vite + React + TypeScript + full CI/CD**, built to understand the whole pipeline _by doing_, not just the app itself.

**The app**: a mini **personalization dashboard** — a "campaigns" list (sortable table + search) and a per-campaign detail page. Simple on purpose; the real exercise is the infrastructure around it: tooling, tests, CI, and deployment.

**The stack**: Vite · React · TypeScript · React Router · Zustand · TanStack Query · CSS Modules · Vitest + RTL · Playwright · Storybook · GitHub Actions · Vercel

## Running the project

```bash
pnpm install
pnpm dev            # dev server
pnpm storybook      # component explorer (localhost:6006)
pnpm lint           # oxlint
pnpm format         # prettier --write
pnpm typecheck      # tsc -b
pnpm test           # vitest
pnpm test:coverage  # vitest with coverage (70% threshold)
pnpm e2e            # playwright (unit flow + visual regression)
pnpm build          # tsc -b && vite build
pnpm size           # bundle-size budget check
```

A **pre-commit** hook (Husky + lint-staged) lints/formats changed files and runs `typecheck` on the whole project on every commit. `main` is branch-protected — every change goes through a PR, and CI (lint, typecheck, build, unit tests, E2E) must be green before merging.

## What's in here

- **Design system**: `src/components/ui/` — generic, reusable, accessible (`aria-sort`, keyboard navigation, labeled inputs), documented in Storybook.
- **Feature code**: `src/features/campaigns/` — the business logic that consumes the design system.
- **State split**: Zustand for client/UI state (search, sort), React Query for server state (campaigns data) — never mixed.
- **Route-based code splitting**: each page is its own JS chunk, verified in the build output.
- **CI**: 3 parallel GitHub Actions jobs (lint/typecheck/build, unit tests, E2E) gate every merge to `main`.
- **CD**: Vercel auto-deploys `main` to prod and gives every PR its own disposable preview URL.

## Bugs found and fixed along the way

Every phase below was actually run and verified — in the browser, in CI, on the real deployment — not just written and assumed to work. That surfaced real bugs, not hypothetical ones:

- React Query rejecting a `queryFn` that resolved to `undefined` on a "campaign not found" path
- A silent React Testing Library cleanup gap causing tests to fail from DOM leakage between them
- A CI failure from pnpm requiring a newer Node version than the plan specified
- Vitest accidentally executing a Playwright E2E spec as a unit test
- A 404 on deep links in production because Vercel didn't know to fall back to `index.html` for a client-side-routed SPA
- Insufficient branch coverage caught by an enforced threshold, not just a vague "tests exist"
- A blocked `pnpm install` in CI from a supply-chain-safety default that worked locally by accident
- A visual-regression test that screenshotted a loading state instead of the loaded page
- Platform-specific screenshot baselines (macOS vs. Linux) needing to be pulled from CI itself

**→ Full write-up of every phase, every command, and every bug above with its fix: [docs/PHASES.md](docs/PHASES.md)**

## What you'll be able to say in interviews after this

> "I recently built a React/TS dashboard from scratch: routing with route-based code splitting, client state in Zustand (selectors to avoid re-renders) and server state in React Query, a design-system structure with CSS Modules, Vitest + Playwright tests, GitHub Actions CI (lint/typecheck/test/build with dependency caching), branch protection, and continuous deployment with per-PR previews and rollback. I added a bundle-size gate to block perf regressions."

That sentence, backed by a real repo, is worth ten theoretical answers. And you can share the GitHub link.
