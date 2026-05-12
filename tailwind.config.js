/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
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
  plugins: [],
};
