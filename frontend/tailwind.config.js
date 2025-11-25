/***** Tailwind CSS Configuration *****/
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.html",
    "./src/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f9ff',
          100: '#e6f0ff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af'
        },
        surface: '#0f172a'
      }
    }
  },
  plugins: []
};
