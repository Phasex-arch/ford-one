/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DEALERSHIP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Declaração de tipos para módulos SCSS
declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

// Assets
declare module '*.png'  { const src: string; export default src; }
declare module '*.jpg'  { const src: string; export default src; }
declare module '*.jpeg' { const src: string; export default src; }
declare module '*.svg'  { const src: string; export default src; }
declare module '*.webp' { const src: string; export default src; }

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const content: string;
  export default content;
}
