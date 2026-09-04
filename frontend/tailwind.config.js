/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // full 0–100 opacity scale so every `color/NN` modifier (e.g. ink/8) works
      opacity: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, i / 100])),
      colors: {
        // PrintWala brand: deep navy ink + orange, with CMYK print accents
        cream: "#f6f7f9",
        paper: "#ffffff",
        ink: {
          DEFAULT: "#17293b",
          soft: "#3e5266",
          mute: "#748498",
        },
        // "clay" retained as the class name but tuned to the brand orange
        clay: {
          50: "#fff5e8",
          100: "#ffe6c6",
          200: "#ffce8c",
          300: "#fdb24f",
          400: "#f99d28",
          500: "#f7941d",
          600: "#e17c0b",
          700: "#b9620b",
          800: "#934e10",
          900: "#7a4111",
        },
        // CMYK accents from the logo
        cyan: "#28abe2",
        magenta: "#ec008c",
        yellow: "#ffc20e",
        moss: {
          100: "#e2efe6",
          400: "#5aa06e",
          600: "#3f7d54",
          700: "#316143",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px -3px rgba(23,41,59,0.10), 0 8px 30px -12px rgba(23,41,59,0.14)",
        lift: "0 10px 40px -12px rgba(23,41,59,0.24)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
