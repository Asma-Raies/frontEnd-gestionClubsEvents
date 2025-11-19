import type { Config } from 'tailwindcss'

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: "#f97316",  // orange-500
          600: "#ea580c",  // orange-600
          700: "#c2410c",  // orange-700
        }
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config