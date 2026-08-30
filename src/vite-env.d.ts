/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the campaigns API. Empty in dev (Vite proxies `/api`). */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
