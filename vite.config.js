import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-only proxy. When VITE_API_TARGET is set, any browser request to
// /api/* is forwarded to that backend from the Vite dev server, so the
// browser sees same-origin traffic and CORS never enters the picture.
// In production, set VITE_API_URL to the real backend URL (no proxy used).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const proxyTarget = env.VITE_API_TARGET;

  return {
    // Deployed at the domain root on AWS Amplify, so assets resolve from /.
    // Amplify needs an SPA rewrite rule (target /index.html, type 200) for
    // BrowserRouter refreshes — configure it in the Amplify console under
    // App settings → Rewrites and redirects.
    base: '/',
    plugins: [react()],
    server: {
      port: 5173,
      open: true,
      proxy: proxyTarget
        ? {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
              rewrite: (path) => path.replace(/^\/api/, ''),
            },
          }
        : undefined,
    },
  };
});
