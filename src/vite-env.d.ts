/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CLOUDFLARE_MEETING_ID: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_REALTIMEKIT_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
