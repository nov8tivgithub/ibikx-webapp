// Single source of truth for app-wide constants. Wraps env.js so consumers
// can import everything they need (env-backed values + static literals) from
// one place — `import { ... } from '../config/constants'`.

import { apiKey, baseUrl, deviceSecret, webviewUrl } from './env';

const env = import.meta.env || {};

// ─── Env-backed values (re-exported from env.js) ─────────────────────────────
export { apiKey, baseUrl, deviceSecret, webviewUrl };

// ─── Footer / legal URLs ─────────────────────────────────────────────────────
// Override per-environment with VITE_TERMS_URL / VITE_PRIVACY_URL /
// VITE_SUPPORT_URL in .env. Defaults point at the hosted backend pages so
// they work out-of-the-box against the existing infra.
export const TERMS_URL   = env.VITE_STATICVIEW_URL + 'termsandconditions' || 'https://ideascaards.com/termsandconditions';
export const PRIVACY_URL = env.VITE_STATICVIEW_URL + 'privacypolicy' || 'https://ideascaards.com/privacypolicy';

// ─── Branding ────────────────────────────────────────────────────────────────
export const APP_NAME        = env.VITE_APP_NAME       || 'Mobilix IdeasCaards';
export const POWERED_BY_NAME = env.VITE_POWERED_BY     || 'Swizzle';
export const POWERED_BY_URL  = env.VITE_POWERED_BY_URL || 'https://swizzleup.com';

// ─── Misc ────────────────────────────────────────────────────────────────────
export const APP_YEAR        = new Date().getFullYear();
