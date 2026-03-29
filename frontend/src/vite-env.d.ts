/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the Express API (Firebase web config + optional token verify). */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
