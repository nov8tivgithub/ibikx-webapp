// Inline Tailwind config used with the Tailwind Play CDN. Pages load
// this BEFORE the CDN script tag so the theme is in scope.
window.tailwind = window.tailwind || {};
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1e9bff',
          'blue-dark': '#0a7fe8',
          green: '#1f7a3a',
          gold: '#f6b93b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 6px 24px -8px rgba(15, 23, 42, 0.12)',
      },
    },
  },
};
