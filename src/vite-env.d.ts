/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin; empty in production (same-origin through nginx) */
  readonly REACT_APP_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
