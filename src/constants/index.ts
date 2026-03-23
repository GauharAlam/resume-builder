// Application-wide constants

// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        ME: '/auth/me',
        VERIFY_TOKEN: '/auth/verify-token',
    },
    RESUMES: {
        BASE: '/resumes',
        GET_ALL: '/resumes',
        GET_BY_ID: (id: string) => `/resumes/${id}`,
        CREATE: '/resumes',
        UPDATE: (id: string) => `/resumes/${id}`,
        DELETE: (id: string) => `/resumes/${id}`,
    },
} as const;

// Local storage keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    THEME: 'theme',
    USER: 'user',
} as const;

// Theme constants
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
} as const;

// Route paths
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    EDIT_RESUME: '/edit-resume',
    HISTORY: '/history',
} as const;

// Resume accent colors
export const ACCENT_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#6366F1', // Indigo
] as const;
