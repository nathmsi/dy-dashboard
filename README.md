# dy-dashboard

End-to-end project: **Vite + React + TypeScript + full CI/CD**.

**Goal**: build a real app, push it to GitHub, and set up a complete CI/CD pipeline — to understand _by doing_ everything covered in the refresh. The app is intentionally simple; the real exercise is the infrastructure around it.

**The app**: a mini **personalization dashboard** — a few pages with simple routing: a "campaigns" list (sortable table + search) and a per-campaign detail page. Rich enough to exercise components, state management, accessibility and performance; simple enough to fit in one or two sessions.

**The stack**:

- **Vite + React + TypeScript** — build & language
- **React Router** — routing (multiple pages)
- **Zustand** — global client state (search, sort, selection) — _their choice at DY_
- **TanStack Query (React Query)** — server state (the "API" data)
- **CSS Modules** — scoped styling (design tokens as CSS variables)
- **Vitest + RTL + Playwright** — tests
- **GitHub Actions + Vercel** — CI/CD

## Running the project

```bash
pnpm install
pnpm dev          # dev server
pnpm lint         # oxlint
pnpm format       # prettier --write
pnpm format:check # prettier --check
pnpm typecheck    # tsc -b
pnpm build        # tsc -b && vite build
```

A **pre-commit** hook (Husky + lint-staged) lints/formats changed files and runs `typecheck` on the whole project on every commit.

---

## Full plan, phase by phase

### Phase 0 — Prerequisites (5 min)

- **Node** ≥ 22.13 (`node -v`). Install via nvm if needed. (Bumped from the originally planned Node 20 — pnpm 11 requires Node ≥ 22.13; discovered when CI failed on Node 20 in Phase 6.)
- **pnpm**: `npm install -g pnpm`.
- **git** configured + a **GitHub** account.
- An editor (VS Code) with ESLint + Prettier extensions.

- [x] Node installed
- [x] pnpm installed

---

### Phase 1 — Project scaffold (10 min)

```bash
pnpm create vite dy-dashboard --template react-ts
cd dy-dashboard
pnpm install
pnpm dev
```

**What happens**: Vite generates a React + TypeScript skeleton. `pnpm dev` starts the dev server (esbuild + native ESM → instant startup, HMR enabled).

**Look at and understand**:

- `vite.config.ts` — the bundler config.
- `tsconfig.json` — the TypeScript config.
- `package.json` — the scripts (`dev`, `build`, `preview`).
- `index.html` — the entry point (Vite is "HTML-first").

- [x] Scaffold done
- [x] First commit
- [x] Explored config files

---

### Phase 2 — Quality tooling (20 min)

Goal: put the guardrails in place _before_ writing any code.

**Lint + format**:

- **oxlint** = quality (bugs, bad practices) — kept as-is (already scaffolded by Vite, written in Rust so it's fast) instead of ESLint.
- **Prettier** = formatting (style).

**Pre-commit hooks (Husky + lint-staged)**:

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

→ lint-staged runs oxlint + prettier **only on changed files** on every commit. `typecheck` (`tsc -b`) also runs on the whole project on every commit — bad code (style, lint, or type errors) never makes it into the repo.

**Scripts added to `package.json`**:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "oxlint",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "typecheck": "tsc -b",
  "preview": "vite preview",
  "prepare": "husky"
}
```

Note: `typecheck` = `tsc -b` (project references — plain `tsc --noEmit` wasn't enough here because the root `tsconfig.json` has `"files": []` and delegates to `tsconfig.app.json` / `tsconfig.node.json` via `references`).

- [x] Prettier
- [x] Husky + lint-staged
- [x] package.json scripts
- [x] typecheck enforced in pre-commit (verified: a commit with a type error is rejected)

---

### Phase 3 — Building the app (the bulk of the work)

**Folder structure** (think "design system"):

```
src/
  components/ui/       ← reusable library: Button, Badge, Table, SearchInput (+ .module.css)
  features/campaigns/  ← the business feature: CampaignTable, CampaignDetail
  pages/               ← one page per route: DashboardPage, CampaignDetailPage
  stores/              ← Zustand stores (e.g. useCampaignStore)
  lib/                 ← utils, types, mock api, queryClient
  routes.tsx           ← route definitions (React Router)
  App.tsx
```

**Styling — CSS Modules**: each component has its own `X.module.css`. Classes are **scoped** automatically (no collisions between components). Put your **design tokens** (colors, spacing) in global CSS variables (`:root { --color-primary: … }`) that the modules consume → that's the ABC of a design system.

**The senior point**: the `components/ui/` folder is your "mini component library". You design it to be **consumed** — clear props, built-in accessibility. That's exactly the "my user is the developer" story.

**What the app does**:

- Route `/` → **DashboardPage**: sortable, searchable campaigns table.
- Route `/campaigns/:id` → **CampaignDetailPage**: campaign detail.
- Shared state (search, sort, selection) lives in a Zustand store; data comes from a mock "API" via React Query.

**Accessibility to build in from the start** (comes up constantly in the role):

- Table with `<th scope="col">`, sort announced via `aria-sort`.
- Search with an associated `<label>`.
- Keyboard navigation: focusable rows, `Enter` to open the detail, focus managed in the panel.

- [x] Folder structure
- [x] CSS design tokens
- [x] Base UI components (Button, Badge, Table, SearchInput)
- [x] DashboardPage (sortable table + search)
- [x] CampaignDetailPage
- [x] Accessibility (aria-sort, label, keyboard) — verified manually: search filters live, column sort toggles asc/desc with `aria-sort`, rows are keyboard-focusable and `Enter` opens the detail page, tested in both light and dark color schemes

---

### Phase 3.5 — Routing + State management (the part that speaks to the role)

#### Routing (React Router)

```bash
pnpm add react-router-dom
```

Define 2 routes: `/` (dashboard) and `/campaigns/:id` (detail).

**Perf point to know**: **route-based code splitting** — load each page's code with `React.lazy()` + `Suspense`, so you don't ship everything in a single bundle.

```tsx
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
```

→ worth citing in interviews: "I split by route to reduce the initial bundle."

#### Client state — Zustand (their choice)

```bash
pnpm add zustand
```

One store = one hook. Put shared state + setters in it:

```ts
// stores/useCampaignStore.ts
import { create } from 'zustand'

interface CampaignState {
  search: string
  sortBy: 'name' | 'conversion' | 'status'
  setSearch: (v: string) => void
  setSortBy: (v: CampaignState['sortBy']) => void
}

export const useCampaignStore = create<CampaignState>((set) => ({
  search: '',
  sortBy: 'name',
  setSearch: (search) => set({ search }),
  setSortBy: (sortBy) => set({ sortBy }),
}))
```

In a component, read **via a selector** (the key point):

```ts
const search = useCampaignStore((s) => s.search) // re-renders ONLY when search changes
const setSearch = useCampaignStore((s) => s.setSearch)
```

→ the selector `(s) => s.search` avoids unnecessary re-renders. **This is THE Zustand perf talking point.**

#### Server state — React Query (TanStack Query)

```bash
pnpm add @tanstack/react-query
```

The distinction to raise in interviews: **client state ≠ server state.**

- **Zustand** = UI state (search, sort, selection, theme). It's yours.
- **React Query** = data coming from an API. It handles caching, loading, errors, refetching, and deduplication for you.

Setup:

```tsx
// main.tsx
const queryClient = new QueryClient()
;<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

Usage:

```ts
const { data, isLoading, error } = useQuery({
  queryKey: ['campaigns'],
  queryFn: fetchCampaigns, // your mock function (Promise + setTimeout)
})
```

→ worth saying: "I never put server data in Zustand; server state has its own tool." That sentence alone puts you above a lot of candidates.

#### Hooks, used properly (classic senior trap)

- **`useState`**: purely local, non-shared state (an isolated input, a modal toggle).
- **`useEffect`**: synchronize with the outside world (a subscription, the document title). ⚠️ not for deriving data — a common trap.
- **`useMemo`**: memoize an **expensive computation** (e.g. sorting/filtering a large list). Not to sprinkle everywhere "just in case."
- **`useCallback`**: stabilize a **function** passed to a memoized child component, to avoid re-rendering it.
- **Custom hook**: extract reusable logic (`useCampaigns()` wrapping `useQuery`). Shows you structure your code.

Golden rule to state: _"I don't optimize prematurely; `useMemo`/`useCallback` only when there's a real cost or a real memoization break, not out of reflex."_ Interviewers love that nuance.

- [x] React Router + route-based code splitting — verified: `DashboardPage` and `CampaignDetailPage` build into separate JS/CSS chunks, real URL navigation (`/campaigns/:id`), browser back button and hard reload both work correctly
- [x] Zustand store with selectors (`useCampaignStore`: search, sortBy, sortDirection)
- [x] React Query + queryClient (`useCampaigns`, `useCampaign`)
- [x] Custom hook useCampaigns()

**Bug caught while testing manually**: navigating to a non-existent campaign ID crashed with `Query data cannot be undefined` — React Query forbids a `queryFn` resolving to `undefined`. Fixed by having `fetchCampaignById` resolve to `null` instead. A good reminder to actually exercise the "not found" path in the browser, not just the happy path.

---

### Phase 4 — Tests (30 min)

**Unit / component tests**:

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- **Vitest**: Vite's native test runner.
- **React Testing Library**: tests behavior as seen by the user (click, find text), not implementation details.
- Write 2-3 tests: `Button` reacts to clicks, the table sorts, search filters.

**E2E (strong bonus)**:

```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

- **Playwright**: simulates a real browser. Write 1 scenario: "search for a campaign → click it → the detail shows up."

Being able to explain the **testing pyramid** (lots of unit tests, few E2E tests) is an easy interview point.

- [x] Vitest + RTL setup
- [x] Unit tests (Button, sort, search) — 7 tests across `Button`, `CampaignTable`, `DashboardPage`
- [x] Playwright setup
- [x] E2E scenario — search → open detail → back, verified against a real running dev server

**Gotcha hit while wiring Vitest + RTL**: without `test.globals: true`, `@testing-library/react`'s automatic cleanup silently does nothing (it detects a global `afterEach` that doesn't exist), so renders from one test leak into the next — tests fail with "found multiple elements" errors that look like app bugs but aren't. Fixed by explicitly calling `cleanup()` in an `afterEach` inside `src/test/setup.ts`, which also fixed a Button test that looked like a real failure but was actually DOM pollution from the previous test.

Also worth noting: the Zustand store is a module-level singleton, so `DashboardPage.test.tsx` resets it in a `beforeEach` — otherwise `search` state set in one test would leak into the next.

---

### Phase 5 — GitHub (10 min)

```bash
# create an empty repo on github.com (without a README), then:
git remote add origin git@github.com:YOUR_USER/dy-dashboard.git
git branch -M main
git push -u origin main
```

**Good practice to show**: don't push directly to `main`. Work with **branches + Pull Requests**. Enable **branch protection** on `main` (Settings → Branches) → blocks merging until CI is green. That's a senior reflex.

- [x] GitHub repo created — [github.com/nathmsi/dy-dashboard](https://github.com/nathmsi/dy-dashboard) (public)
- [x] Remote configured + initial push
- [x] Branch protection enabled — required PR before merge, `enforce_admins: true` (applies even to the repo owner), force-push and branch deletion blocked. Verified: a direct `git push origin main` was rejected. Required status checks (green CI) will be added once the workflow exists in Phase 6.

---

### Phase 6 — CI with GitHub Actions (the core)

Create `.github/workflows/ci.yml`. We went straight for the "improvement to know about" from the original plan — **3 parallel jobs** instead of one sequential job — since it's barely more code and demonstrates the point directly instead of just citing it:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint-typecheck-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm build

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      # ...same setup...
      - run: pnpm test

  e2e:
    runs-on: ubuntu-latest
    steps:
      # ...same setup...
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm e2e
```

**Understand each piece**:

- `on:` — when it triggers (every PR + push to main).
- `cache: 'pnpm'` — reuses deps between runs = the biggest time saver.
- `--frozen-lockfile` — fails if the lockfile is out of date (reproducible builds).
- 3 independent jobs run **in parallel** on separate runners — `lint-typecheck-build`, `unit-tests`, `e2e` — instead of one long sequential pipeline.
- `pnpm/action-setup@v4` with no `version:` — reads the `packageManager` field in `package.json` instead of a hardcoded version, so the CI pnpm version and the local one can never drift apart.

- [x] ci.yml workflow created (3 parallel jobs)
- [x] PR opened, CI green — [PR #2](https://github.com/nathmsi/dy-dashboard/pull/2)

**Two real bugs caught by CI that local testing missed**:

1. **Node version mismatch**: pnpm 11 (pinned via `packageManager`) requires Node ≥ 22.13. The workflow was first written with `node-version: 20` (following the original plan literally) and failed immediately with `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite`. It "worked" locally only because the dev machine happens to run Node 24. Fixed by bumping CI (and the documented prerequisite) to Node 22.
2. **Vitest picked up the Playwright spec**: `unit-tests` failed with `Playwright Test did not expect test() to be called here` — Vitest's default file glob matches both `*.test.*` and `*.spec.*`, so it tried to execute `e2e/campaign-flow.spec.ts` as a unit test. This slipped past local testing because `pnpm test` was last run _before_ the E2E spec file existed, and `pnpm e2e`/`pnpm test` were never run together afterward. Fixed by excluding `e2e/**` in `vite.config.ts`'s `test.exclude`. Lesson: CI catches gaps in your own verification habits, not just gaps in the code.

Branch protection now also **requires all 3 jobs to pass** (`required_status_checks`, `strict: true`) before a PR can merge into `main`.

---

### Phase 7 — CD: deployment + previews (20 min)

The simplest and most impressive option: **Vercel** or **Netlify**.

- Connect the GitHub repo to Vercel.
- **Automatic**: every push to `main` → **deploys to prod**. Every PR → **preview deployment** with a disposable URL. → you get _per-PR preview deploys_ for free, with zero config.

**If you want to do it "by hand"** (more educational, do this second): a GitHub Actions workflow that builds and deploys to **GitHub Pages** or a bucket. There you manage it yourself: build → upload assets → activate. That's real CD.

**Concepts this setup illustrates**: CDN, content hashing (Vite hashes file names → cache busting), atomic deployments, and — worth citing — **rollback** (Vercel keeps every deployment, you can revert in 1 click).

- [x] Vercel connected
- [x] First prod deployment — [dy-dashboard-five.vercel.app](https://dy-dashboard-five.vercel.app/)
- [ ] Preview deploy verified on a PR

**Bug caught by testing the deployed URL directly, not just the homepage**: navigating straight to `/campaigns/:id` on the live Vercel URL returned a `404: NOT_FOUND`. Vercel serves the `dist/` build as static files and has no built-in knowledge that this is a client-side-routed SPA — it doesn't know to fall back to `index.html` for unknown paths. The dev server (`vite dev`) and `vite preview` both handle this automatically, which is exactly why it went unnoticed until the real deployment. Fixed with a `vercel.json` rewrite:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

### Phase 8 — Bonuses that make you look "senior" (optional)

Add these if you have time, each is a talking point:

- [x] **Bundle size gate**: `size-limit` (using `@size-limit/file`, not `@size-limit/preset-app` — that plugin assumes a Webpack entrypoint; `@size-limit/file` just measures our already-built Vite `dist/` output, which fits a Vite project). Budgets: main bundle 110 KB, each route chunk 5-10 KB, checked with `pnpm size` and enforced in CI. → "I automatically prevent perf regressions."
- [x] **Storybook**: real stories for `Button`, `Badge`, `SearchInput`, and `CampaignTable` under `src/**/*.stories.tsx`, isolated from the app and using our actual design tokens (`.storybook/preview.tsx` imports `src/index.css`). Run with `pnpm storybook`. `pnpm build-storybook` runs in CI to catch breakage.
- [ ] **Lighthouse CI**: automated perf/accessibility audit on every PR. (not implemented)
- [x] **Visual regression**: Playwright screenshots (`e2e/visual.spec.ts`, `toHaveScreenshot()`) instead of Chromatic — reuses the E2E setup we already had instead of adding a paid third-party service.
- [x] **Coverage**: Vitest v8 coverage with a **70%** threshold (lines/functions/branches/statements) enforced in `vite.config.ts` — `pnpm test:coverage` fails locally and in CI if coverage drops below that. Uploaded to Codecov in CI (`codecov/codecov-action`, `fail_ci_if_error: false` so a Codecov outage never blocks merging). **Manual step still needed**: sign in at [codecov.io](https://codecov.io) with GitHub and enable the `dy-dashboard` repo — until then, the upload step logs `Token required - not valid tokenless upload` (soft failure, doesn't block CI) because Codecov's tokenless upload for public repos only works once the repo is registered there.

**Bugs caught while building these**:

1. **pnpm blocks build scripts by default**: `pnpm install --frozen-lockfile` failed in CI with `[ERR_PNPM_IGNORED_BUILDS]` — pnpm 11 refuses to run a dependency's install/build script (here, esbuild's) unless explicitly allowlisted, as a supply-chain-attack guard. Worked locally because the local pnpm store already had it approved from an earlier interactive session. Fixed with `pnpm-workspace.yaml`:
   ```yaml
   allowBuilds:
     esbuild: true
   ```
2. **Visual regression snapshot took the loading state, not the loaded page**: the first CI run wrote a screenshot showing "Loading campaigns…" instead of the table, because the test only waited for the page `<h1>` (which renders instantly) before snapshotting, not for the mock API's simulated 400ms delay to resolve. Fixed by waiting for actual row content (`getByText('Homepage Hero Banner')`) before taking the screenshot.
3. **Snapshot filenames are platform-suffixed** (`*-darwin.png` locally vs `*-linux.png` in CI) — expected Playwright behavior, not a bug, but it means a baseline generated on a Mac is useless for Linux CI. Without Docker available locally to generate a matching baseline, the practical fix was: let CI fail once (it writes the "actual" screenshot as an artifact), download that artifact, and commit it as the real Linux baseline.

---

## Priority order if you're short on time

1. Phases 1-2-3: an app that runs, cleanly structured. ✅ mandatory
2. Phase 5-6: on GitHub + green CI. ✅ the core of the exercise
3. Phase 7: deployed (Vercel = 10 min). ✅ loop closed
4. Phase 4 (tests): at least 2-3 unit tests. ⭐ important
5. Phase 8: one or two bonuses. 🎁 differentiator

---

## What you'll be able to say in interviews after this

> "I recently built a React/TS dashboard from scratch: routing with route-based code splitting, client state in Zustand (selectors to avoid re-renders) and server state in React Query, a design-system structure with CSS Modules, Vitest + Playwright tests, GitHub Actions CI (lint/typecheck/test/build with dependency caching), branch protection, and continuous deployment with per-PR previews and rollback. I added a bundle-size gate to block perf regressions."

That sentence, backed by a real repo, is worth ten theoretical answers. And you can share the GitHub link.
