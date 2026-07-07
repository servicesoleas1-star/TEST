/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#FFF3EA",
          100: "#FFE1CC",
          200: "#FFC299",
          300: "#FFA05C",
          400: "#FF8629",
          500: "#FF6A00",
          600: "#E65A00",
          700: "#C24B00",
          800: "#9C3C00",
          900: "#7A2F00",
          DEFAULT: "#FF6A00",
        },
        secondary: {
          50: "#EEF3FF",
          100: "#D6E1FF",
          200: "#A9C1FF",
          300: "#7DA1FF",
          400: "#5384FF",
          500: "#2B6BFF",
          600: "#1B52DB",
          700: "#143FAD",
          800: "#0E2E80",
          900: "#0A2260",
          DEFAULT: "#2B6BFF",
        },
        ink: {
          50: "#F7F7F9",
          100: "#EDEDF2",
          200: "#D8D9E1",
          300: "#B8BAC6",
          400: "#8D8FA0",
          500: "#6B6D80",
          600: "#52546A",
          700: "#3D3F54",
          800: "#262838",
          900: "#1A1A2E",
        },
      },
    },
  },
  plugins: [],
};