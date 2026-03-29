/// <reference types="vite/client" />

/** Injected in vite.config.ts — matches `resolveApiPort` / dev proxy target. */
declare const __EASEUP_DEV_API_PORT__: string

interface ImportMetaEnv {
  /** Origin of the Express API (Firebase web config + optional token verify). */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
