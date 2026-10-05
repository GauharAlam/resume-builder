/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_CLERK_PUBLISHABLE_KEY: string;
    readonly VITE_NVIDIA_API_KEY: string;
    readonly VITE_NVIDIA_BASE_URL: string;
    readonly VITE_AI_MODEL: string;
    readonly VITE_RAPIDAPI_KEY: string;
    readonly VITE_ANALYTICS_ENDPOINT?: string;
    readonly VITE_GOOGLE_CLIENT_ID?: string;
    // Legacy / fallback
    readonly VITE_GEMINI_API_KEY?: string;
    readonly VITE_OPENROUTER_API_KEY?: string;
    readonly VITE_OPENROUTER_BASE_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
