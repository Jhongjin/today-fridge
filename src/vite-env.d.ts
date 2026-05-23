/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANALYTICS_ENDPOINT?: string;
  readonly VITE_TOSS_REAL_CLIENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
