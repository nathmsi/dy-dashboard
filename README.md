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

- **Node** ≥ 20 (`node -v`). Install via nvm if needed.
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

- [ ] GitHub repo created
- [ ] Remote configured + initial push
- [ ] Branch protection enabled

---

### Phase 6 — CI with GitHub Actions (the core)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm' # ← caches deps based on the lockfile

      - run: pnpm install --frozen-lockfile

      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build # verifies the build passes
```

**Understand each piece**:

- `on:` — when it triggers (every PR + push to main).
- `cache: 'pnpm'` — reuses deps between runs = the biggest time saver.
- `--frozen-lockfile` — fails if the lockfile is out of date (reproducible builds).
- The steps = your pipeline: lint → typecheck → test → build.

**Improvement to know about** (worth mentioning in interviews): running jobs **in parallel** (lint and test in separate jobs) to speed things up, via a **matrix** if needed.

- [ ] ci.yml workflow created
- [ ] PR opened, CI green

---

### Phase 7 — CD: deployment + previews (20 min)

The simplest and most impressive option: **Vercel** or **Netlify**.

- Connect the GitHub repo to Vercel.
- **Automatic**: every push to `main` → **deploys to prod**. Every PR → **preview deployment** with a disposable URL. → you get _per-PR preview deploys_ for free, with zero config.

**If you want to do it "by hand"** (more educational, do this second): a GitHub Actions workflow that builds and deploys to **GitHub Pages** or a bucket. There you manage it yourself: build → upload assets → activate. That's real CD.

**Concepts this setup illustrates**: CDN, content hashing (Vite hashes file names → cache busting), atomic deployments, and — worth citing — **rollback** (Vercel keeps every deployment, you can revert in 1 click).

- [ ] Vercel connected
- [ ] First prod deployment
- [ ] Preview deploy verified on a PR

---

### Phase 8 — Bonuses that make you look "senior" (optional)

Add these if you have time, each is a talking point:

- **Bundle size gate**: `pnpm add -D size-limit @size-limit/preset-app` + a CI step that fails if the bundle exceeds a budget. → "I automatically prevent perf regressions."
- **Storybook**: `pnpm dlx storybook@latest init` — documents/isolates your UI components. Perfect for the design-system narrative.
- **Lighthouse CI**: automated perf/accessibility audit on every PR.
- **Visual regression**: Chromatic (via Storybook) or Playwright screenshots.
- **Codecov**: upload the coverage report, badge in the README.

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
