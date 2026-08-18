/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#B48C51', // Elegant Gold
        secondary: '#3D3329', // Dark Brown
        background: '#FDFBF7', // Cream
      }
    },
  },
  plugins: [],
}
