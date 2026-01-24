/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",

  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        backgroundCard: "var(--background-card)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        borderColor: "var(--sidebar-border)",
        accentGreen: "var(--accent-green)",
      },
    },
  },

  plugins: [],
};

export default config;
