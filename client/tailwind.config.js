/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          50: '#f4f6f8',
          100: '#e5e9ee',
          200: '#cbcfd7',
          300: '#a3abb8',
          400: '#758195',
          500: '#546277',
          600: '#3f4b5e',
          700: '#323b4b',
          800: '#29303d',
          900: '#0f172a',
        },
        brand: {
          primary: '#b45309',
          secondary: '#c16905ff',
          accent: '#0f766e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
