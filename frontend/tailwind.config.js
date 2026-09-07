/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        susu: {
          green: "#2f9e44",
          gold: "#d4a017",
        },
      },
    },
  },
  plugins: [],
};
