/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F17',
          card: '#111827',
          cardBorder: '#1F2937',
          muted: '#9CA3AF',
          accent: '#1E293B',
          hover: '#1F293D',
        },
        trade: {
          buy: '#10B981',
          buyHover: '#059669',
          buyBg: 'rgba(16, 185, 129, 0.12)',
          sell: '#F43F5E',
          sellHover: '#E11D48',
          sellBg: 'rgba(244, 63, 94, 0.12)',
          profit: '#10B981',
          loss: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
