# Projet end-to-end : Vite + React + TS + CI/CD complet

**But** : construire une app réelle, la mettre sur GitHub, et monter un pipeline CI/CD complet — pour comprendre _en faisant_ tout ce qu'on a vu dans le refresh. L'app est volontairement simple ; le cœur de l'exercice, c'est l'infra autour.

**L'app** : un mini **dashboard de personnalisation** (clin d'œil à la console Dynamic Yield) — plusieurs pages avec un routing simple : une liste de "campagnes" (table triable + recherche) et une page de détail par campagne. Assez riche pour tester des composants, le state management, l'accessibilité et la perf ; assez simple pour tenir en une session ou deux.

**La stack** :

- **Vite + React + TypeScript** — build & langage
- **React Router** — routing (plusieurs pages)
- **Zustand** — state global client (recherche, tri, sélection) — _c'est leur choix chez DY_
- **TanStack Query (React Query)** — server state (les données "API")
- **CSS Modules** — styling scopé (design tokens en variables CSS)
- **Vitest + RTL + Playwright** — tests
- **GitHub Actions + Vercel** — CI/CD

---

## Phase 0 — Prérequis (5 min)

- **Node** ≥ 20 (`node -v`). Sinon installe via nvm.
- **pnpm** : `npm install -g pnpm`.
- **git** configuré + un compte **GitHub**.
- Un éditeur (VS Code) avec les extensions ESLint + Prettier.

- [x] Node installé
- [x] pnpm installé

---

## Phase 1 — Scaffold du projet (10 min)

```bash
pnpm create vite dy-dashboard --template react-ts
cd dy-dashboard
pnpm install
pnpm dev
```

**Ce qui se passe** : Vite génère un squelette React + TypeScript. `pnpm dev` lance le dev server (esbuild + ESM natif → démarrage instantané, HMR actif).

**Regarde et comprends** :

- `vite.config.ts` — la config du bundler.
- `tsconfig.json` — la config TypeScript.
- `package.json` — les scripts (`dev`, `build`, `preview`).
- `index.html` — le point d'entrée (Vite est "HTML-first").

**Premier commit tout de suite** :

```bash
git init
git add -A
git commit -m "chore: scaffold vite react-ts"
```

- [x] Scaffold fait
- [ ] Premier commit
- [ ] Exploration des fichiers de config

---

## Phase 2 — Tooling qualité (20 min)

Objectif : mettre les garde-fous _avant_ d'écrire du code.

**ESLint + Prettier** :

```bash
pnpm add -D eslint prettier eslint-config-prettier
```

- ESLint = qualité (bugs, mauvaises pratiques).
- Prettier = formatage (style).
- `eslint-config-prettier` désactive les règles ESLint qui entrent en conflit avec Prettier.

**Pre-commit hooks (Husky + lint-staged)** :

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

→ configure lint-staged pour lancer eslint+prettier **seulement sur les fichiers modifiés** à chaque commit. Le mauvais code n'entre jamais dans le repo.

**Scripts à ajouter dans `package.json`** :

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Note : `typecheck` = `tsc --noEmit` (vérifie les types sans générer de fichiers). C'est une étape séparée du build → essentiel en CI.

- [ ] ESLint + Prettier
- [ ] Husky + lint-staged
- [ ] Scripts package.json

---

## Phase 3 — Construire l'app (le gros du desktop)

**Structure de dossiers** (pense "design system") :

```
src/
  components/ui/       ← lib réutilisable : Button, Badge, Table, SearchInput (+ .module.css)
  features/campaigns/  ← la feature métier : CampaignTable, CampaignDetail
  pages/               ← une page par route : DashboardPage, CampaignDetailPage
  stores/              ← les stores Zustand (ex : useCampaignStore)
  lib/                 ← utils, types, api mock, queryClient
  routes.tsx           ← définition des routes (React Router)
  App.tsx
```

**Styling — CSS Modules** : chaque composant a son `X.module.css`. Les classes sont **scopées** automatiquement (pas de collision entre composants). Mets tes **design tokens** (couleurs, espacements) dans des variables CSS globales (`:root { --color-primary: … }`) que les modules consomment → c'est le b.a.-ba d'un design system.

**Le point senior** : le dossier `components/ui/` est ta "mini librairie de composants". Tu la conçois pour être **consommée** — props claires, accessibilité intégrée.

**Ce que l'app fait** :

- Route `/` → **DashboardPage** : table de campagnes triable + recherche.
- Route `/campaigns/:id` → **CampaignDetailPage** : le détail d'une campagne.
- Le state partagé (recherche, tri, sélection) vit dans un store Zustand ; les données viennent d'une "API" mock via React Query.

**Accessibilité à intégrer dès le début** (revient partout dans l'offre) :

- Table avec `<th scope="col">`, tri annoncé via `aria-sort`.
- Recherche avec `<label>` associé.
- Navigation clavier : lignes focusables, `Enter` pour ouvrir le détail, focus géré dans le panneau.

- [ ] Structure de dossiers
- [ ] Design tokens CSS
- [ ] Composants UI de base (Button, Badge, Table, SearchInput)
- [ ] DashboardPage (table triable + recherche)
- [ ] CampaignDetailPage
- [ ] Accessibilité (aria-sort, label, clavier)

---

## Phase 3.5 — Routing + State management (le bloc qui parle au poste)

### Routing (React Router)

```bash
pnpm add react-router-dom
```

Définis 2 routes : `/` (dashboard) et `/campaigns/:id` (détail).

**Point perf à connaître** : le **route-based code splitting** — charger le code de chaque page en `React.lazy()` + `Suspense`.

```tsx
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
```

### Client state — Zustand (leur choix)

```bash
pnpm add zustand
```

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

Lecture **par sélecteur** :

```ts
const search = useCampaignStore((s) => s.search) // re-render SEULEMENT si search change
const setSearch = useCampaignStore((s) => s.setSearch)
```

→ **C'est LE talking point perf de Zustand.**

### Server state — React Query (TanStack Query)

```bash
pnpm add @tanstack/react-query
```

Distinction à poser en entretien : **client state ≠ server state.**

- **Zustand** = état de l'UI (recherche, tri, sélection, thème).
- **React Query** = données qui viennent d'une API (cache, loading, erreurs, refetch, dédup).

```tsx
// main.tsx
const queryClient = new QueryClient()
<QueryClientProvider client={queryClient}><App /></QueryClientProvider>
```

```ts
const { data, isLoading, error } = useQuery({
  queryKey: ['campaigns'],
  queryFn: fetchCampaigns,
})
```

### Les hooks, bien utilisés (piège classique senior)

- **`useState`** : état purement local, non partagé.
- **`useEffect`** : synchroniser avec l'extérieur. ⚠️ pas pour dériver de la donnée.
- **`useMemo`** : mémoriser un **calcul coûteux** (trier/filtrer une grande liste).
- **`useCallback`** : stabiliser une **fonction** passée à un composant enfant mémoïsé.
- **Custom hook** : extraire une logique réutilisable (`useCampaigns()`).

Règle d'or : _"je n'optimise pas prématurément ; useMemo/useCallback seulement quand il y a un vrai coût, pas par réflexe."_

- [ ] React Router + code splitting par route
- [ ] Store Zustand avec sélecteurs
- [ ] React Query + queryClient
- [ ] Custom hook useCampaigns()

---

## Phase 4 — Tests (30 min)

**Unitaires / composants** :

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- **Vitest** : runner natif Vite.
- **React Testing Library** : teste le comportement vu par l'utilisateur, pas l'implémentation.
- 2-3 tests : le `Button` réagit au clic, la table trie, la recherche filtre.

**E2E (bonus fort)** :

```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

- 1 scénario : "je cherche une campagne → je clique → le détail s'affiche".

Savoir expliquer la **pyramide de tests** (beaucoup d'unitaires, peu d'E2E) est un point d'entretien facile.

- [ ] Setup Vitest + RTL
- [ ] Tests unitaires (Button, tri, recherche)
- [ ] Setup Playwright
- [ ] Scénario E2E

---

## Phase 5 — GitHub (10 min)

```bash
git remote add origin git@github.com:TON_USER/dy-dashboard.git
git branch -M main
git push -u origin main
```

**Bonne pratique** : ne pas pusher direct sur `main`. Travailler en **branches + Pull Requests**. Activer la **branch protection** sur `main` → interdit le merge tant que la CI n'est pas verte.

- [ ] Repo GitHub créé
- [ ] Remote configuré + push initial
- [ ] Branch protection activée

---

## Phase 6 — CI avec GitHub Actions (le cœur)

`.github/workflows/ci.yml` :

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
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

**Amélioration à connaître** : passer les jobs en **parallèle** (lint et test dans des jobs séparés), via une **matrix** si besoin.

- [ ] Workflow ci.yml créé
- [ ] PR ouverte, CI verte

---

## Phase 7 — CD : déploiement + preview (20 min)

- Connecte le repo GitHub à **Vercel**.
- Chaque push sur `main` → deploy en prod. Chaque PR → preview deployment avec URL jetable.

**Concepts illustrés** : CDN, content hashing (cache busting), déploiement atomique, rollback.

- [ ] Vercel connecté
- [ ] Premier déploiement prod
- [ ] Preview deploy vérifié sur une PR

---

## Phase 8 — Bonus qui font "senior" (optionnel)

- **Bundle size gate** : `size-limit` + step CI qui échoue si dépassement de budget.
- **Storybook** : documente/isole les composants UI.
- **Lighthouse CI** : audit perf/accessibilité automatisé sur chaque PR.
- **Régression visuelle** : Chromatic ou screenshots Playwright.
- **Codecov** : upload du rapport de coverage, badge dans le README.

---

## L'ordre de priorité si tu manques de temps

1. Phases 1-2-3 : app qui tourne, proprement structurée. ✅ obligatoire
2. Phase 5-6 : sur GitHub + CI verte. ✅ le cœur de l'exercice
3. Phase 7 : déployé (Vercel = 10 min). ✅ boucle bouclée
4. Phase 4 (tests) : au moins 2-3 unitaires. ⭐ important
5. Phase 8 : un ou deux bonus. 🎁 différenciant

---

## Ce que tu pourras dire en entretien après ça

> "J'ai monté récemment un dashboard React/TS de zéro : routing avec code-splitting par route, state client en Zustand (sélecteurs pour éviter les re-renders) et server state en React Query, structure design-system en CSS Modules, tests Vitest + Playwright, CI GitHub Actions (lint/typecheck/test/build avec cache des deps), branch protection, et déploiement continu avec preview par PR et rollback. J'ai mis un bundle-size gate pour bloquer les régressions de perf."
