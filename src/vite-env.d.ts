/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly APP_VERSION: string;
  readonly APP_REPO_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
