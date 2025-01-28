/** @type {import('tailwindcss').Config} */
import { fontFamily } from 'tailwindcss/defaultTheme'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        ultra: ['Ultra', ...fontFamily.serif],
      },
      animation: {
        'spin-fast': 'spin 0.2s linear infinite',
      },
    },
  },
  plugins: [],
}

