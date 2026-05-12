// Central env reader. Vite exposes vars prefixed with VITE_ on import.meta.env.

const env = import.meta.env || {};

// Where axios actually sends requests. In dev with the Vite proxy this is
// typically "/api" so the browser sees same-origin traffic. In production,
// set it to the real backend URL.
export const baseUrl       = env.VITE_API_URL    || '';

// `apitoken` value (app credential) sent inside the apiInfo envelope.
export const apiKey        = env.VITE_API_KEY    || '';

// Shared device secret. Currently used only by loginService to compute the
// MD5 `enckey` (= md5(lowercase(email) + password + deviceSecret)). Other
// services don't need it.
export const deviceSecret  = env.VITE_DEVICE_SECRET || '';

if (import.meta.env.DEV && !baseUrl) {
  // eslint-disable-next-line no-console
  console.warn('[env] VITE_API_URL is not set. API calls will fail until you create a .env file (see .env.example).');
}
