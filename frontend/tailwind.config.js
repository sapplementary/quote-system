/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Это говорит Tailwind: "Смотри во все файлы в папке src"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}