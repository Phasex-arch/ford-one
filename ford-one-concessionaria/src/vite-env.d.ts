/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_DEV_AUTOLOGIN?: string;
  readonly VITE_DEV_EMAIL?: string;
  readonly VITE_DEV_SENHA?: string;
  readonly VITE_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
