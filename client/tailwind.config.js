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
        gov: {
          navy: '#0A192F',
          dark: '#0F172A',
          card: '#1E293B',
          blue: '#1E40AF',
          accent: '#3B82F6',
          emerald: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
          lightBg: '#F8FAFC',
          lightCard: '#FFFFFF'
        }
      }
    },
  },
  plugins: [],
}
