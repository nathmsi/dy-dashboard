# dy-dashboard

Projet end-to-end : **Vite + React + TypeScript + CI/CD complet**.

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

## Lancer le projet

```bash
pnpm install
pnpm dev          # dev server
pnpm lint         # oxlint
pnpm format       # prettier --write
pnpm format:check # prettier --check
pnpm typecheck    # tsc -b
pnpm build        # tsc -b && vite build
```

Un hook **pre-commit** (Husky + lint-staged) lint/formate les fichiers modifiés et fait tourner `typecheck` sur tout le projet à chaque commit.

---

## Plan complet, phase par phase

### Phase 0 — Prérequis (5 min)

- **Node** ≥ 20 (`node -v`). Sinon installe via nvm.
- **pnpm** : `npm install -g pnpm`.
- **git** configuré + un compte **GitHub**.
- Un éditeur (VS Code) avec les extensions ESLint + Prettier.

- [x] Node installé
- [x] pnpm installé

---

### Phase 1 — Scaffold du projet (10 min)

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

- [x] Scaffold fait
- [x] Premier commit
- [x] Exploration des fichiers de config

---

### Phase 2 — Tooling qualité (20 min)

Objectif : mettre les garde-fous _avant_ d'écrire du code.

**Lint + format** :

- **oxlint** = qualité (bugs, mauvaises pratiques) — gardé tel quel (déjà scaffoldé par Vite, écrit en Rust donc rapide) plutôt qu'ESLint.
- **Prettier** = formatage (style).

**Pre-commit hooks (Husky + lint-staged)** :

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

→ lint-staged lance oxlint + prettier **seulement sur les fichiers modifiés** à chaque commit. `typecheck` (`tsc -b`) tourne aussi sur tout le projet à chaque commit — le mauvais code (style, lint, ou erreur de type) n'entre jamais dans le repo.

**Scripts ajoutés dans `package.json`** :

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

Note : `typecheck` = `tsc -b` (project references — `tsc --noEmit` seul ne suffisait pas ici car le `tsconfig.json` racine a `"files": []` et délègue à `tsconfig.app.json` / `tsconfig.node.json` via `references`).

- [x] Prettier
- [x] Husky + lint-staged
- [x] Scripts package.json
- [x] typecheck bloqué en pre-commit (vérifié : un commit avec une erreur de type est rejeté)

---

### Phase 3 — Construire l'app (le gros du desktop)

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

**Le point senior** : le dossier `components/ui/` est ta "mini librairie de composants". Tu la conçois pour être **consommée** — props claires, accessibilité intégrée. C'est exactement le discours "mon utilisateur est le dev".

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

### Phase 3.5 — Routing + State management (le bloc qui parle au poste)

#### Routing (React Router)

```bash
pnpm add react-router-dom
```

Définis 2 routes : `/` (dashboard) et `/campaigns/:id` (détail).

**Point perf à connaître** : le **route-based code splitting** — charger le code de chaque page en `React.lazy()` + `Suspense`, pour ne pas tout mettre dans un seul bundle.

```tsx
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
```

→ à citer en entretien : "je split par route pour réduire le bundle initial".

#### Client state — Zustand (leur choix)

```bash
pnpm add zustand
```

Un store = un hook. On y met l'état partagé + les setters :

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

Dans un composant, on lit **par sélecteur** (le point clé) :

```ts
const search = useCampaignStore((s) => s.search) // re-render SEULEMENT si search change
const setSearch = useCampaignStore((s) => s.setSearch)
```

→ le sélecteur `(s) => s.search` évite les re-renders inutiles. **C'est LE talking point perf de Zustand.**

#### Server state — React Query (TanStack Query)

```bash
pnpm add @tanstack/react-query
```

La distinction à poser en entretien : **client state ≠ server state.**

- **Zustand** = état de l'UI (recherche, tri, sélection, thème). Ça t'appartient.
- **React Query** = données qui viennent d'une API. Il gère pour toi le cache, le loading, les erreurs, le refetch, la déduplication.

Setup :

```tsx
// main.tsx
const queryClient = new QueryClient()
;<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

Usage :

```ts
const { data, isLoading, error } = useQuery({
  queryKey: ['campaigns'],
  queryFn: fetchCampaigns, // ta fonction mock (Promise + setTimeout)
})
```

→ à dire : "je ne mets jamais les données serveur dans Zustand ; le server state a son propre outil". Cette phrase seule te situe au-dessus de beaucoup de candidats.

#### Les hooks, bien utilisés (piège classique senior)

- **`useState`** : état purement local, non partagé (un input isolé, un toggle de modale).
- **`useEffect`** : synchroniser avec l'extérieur (abonnement, titre du document). ⚠️ pas pour dériver de la donnée — piège fréquent.
- **`useMemo`** : mémoriser un **calcul coûteux** (ex : trier/filtrer une grande liste). Pas à mettre partout "au cas où".
- **`useCallback`** : stabiliser une **fonction** passée à un composant enfant mémoïsé, pour éviter son re-render.
- **Custom hook** : extraire une logique réutilisable (`useCampaigns()` qui enveloppe le `useQuery`). Montre que tu structures.

Règle d'or à énoncer : _"je n'optimise pas prématurément ; `useMemo`/`useCallback` seulement quand il y a un vrai coût ou une vraie casse de mémoïsation, pas par réflexe."_ Un intervieweur adore cette nuance.

- [ ] React Router + code splitting par route
- [ ] Store Zustand avec sélecteurs
- [ ] React Query + queryClient
- [ ] Custom hook useCampaigns()

---

### Phase 4 — Tests (30 min)

**Unitaires / composants** :

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- **Vitest** : runner natif Vite.
- **React Testing Library** : teste le comportement vu par l'utilisateur (clique, cherche du texte), pas l'implémentation.
- Écris 2-3 tests : le `Button` réagit au clic, la table trie, la recherche filtre.

**E2E (bonus fort)** :

```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

- **Playwright** : simule un vrai navigateur. Écris 1 scénario : "je cherche une campagne → je clique → le détail s'affiche".

Savoir expliquer la **pyramide de tests** (beaucoup d'unitaires, peu d'E2E) est un point d'entretien facile.

- [ ] Setup Vitest + RTL
- [ ] Tests unitaires (Button, tri, recherche)
- [ ] Setup Playwright
- [ ] Scénario E2E

---

### Phase 5 — GitHub (10 min)

```bash
# crée un repo vide sur github.com (sans README), puis :
git remote add origin git@github.com:TON_USER/dy-dashboard.git
git branch -M main
git push -u origin main
```

**Bonne pratique à montrer** : ne pushe pas direct sur `main`. Travaille en **branches + Pull Requests**. Active la **branch protection** sur `main` (Settings → Branches) → interdit le merge tant que la CI n'est pas verte. Ça, c'est un réflexe senior.

- [ ] Repo GitHub créé
- [ ] Remote configuré + push initial
- [ ] Branch protection activée

---

### Phase 6 — CI avec GitHub Actions (le cœur)

Crée `.github/workflows/ci.yml` :

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
          cache: 'pnpm' # ← cache les deps selon le lockfile

      - run: pnpm install --frozen-lockfile

      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build # vérifie que le build passe
```

**Comprends chaque morceau** :

- `on:` — quand ça se déclenche (chaque PR + push sur main).
- `cache: 'pnpm'` — réutilise les deps entre runs = le plus gros gain de temps.
- `--frozen-lockfile` — échoue si le lockfile n'est pas à jour (builds reproductibles).
- Les steps = ton pipeline : lint → typecheck → test → build.

**Amélioration à connaître** (à mentionner en entretien) : passer les jobs en **parallèle** (lint et test dans des jobs séparés) pour accélérer, via une **matrix** si besoin.

- [ ] Workflow ci.yml créé
- [ ] PR ouverte, CI verte

---

### Phase 7 — CD : déploiement + preview (20 min)

Le plus simple et le plus impressionnant : **Vercel** ou **Netlify**.

- Connecte le repo GitHub à Vercel.
- **Automatique** : chaque push sur `main` → **deploy en prod**. Chaque PR → **preview deployment** avec une URL jetable. → tu obtiens gratuitement les _preview deploys par PR_ dont on a parlé, sans config.

**Si tu veux le faire "à la main"** (plus formateur, à faire en second) : un workflow GitHub Actions qui build et déploie sur **GitHub Pages** ou un bucket. Là tu gères toi-même : build → upload des assets → activation. Tu touches au vrai CD.

**Concepts que ce setup illustre** : CDN, content hashing (Vite met un hash dans les noms de fichiers → cache busting), déploiement atomique, et — à savoir citer — le **rollback** (Vercel garde chaque déploiement, tu peux revenir en 1 clic).

- [ ] Vercel connecté
- [ ] Premier déploiement prod
- [ ] Preview deploy vérifié sur une PR

---

### Phase 8 — Bonus qui font "senior" (optionnel)

À ajouter si tu as le temps, chacun est un talking point :

- **Bundle size gate** : `pnpm add -D size-limit @size-limit/preset-app` + un step CI qui échoue si le bundle dépasse un budget. → "j'empêche les régressions de perf automatiquement".
- **Storybook** : `pnpm dlx storybook@latest init` — documente/isole tes composants UI. Parfait pour le discours design system.
- **Lighthouse CI** : audit perf/accessibilité automatisé sur chaque PR.
- **Régression visuelle** : Chromatic (via Storybook) ou screenshots Playwright.
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

Cette phrase, dite avec un vrai repo derrière, vaut dix réponses théoriques. Et tu peux partager le lien GitHub.
