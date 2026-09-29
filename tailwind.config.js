module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./batteries/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "accent-1": "#333",
        // Battery Masters palette
        bg: "rgb(11 18 32 / <alpha-value>)",
        panel: "rgb(17 26 44 / <alpha-value>)",
        ink: "rgb(230 237 247 / <alpha-value>)",
        accent: "rgb(61 214 198 / <alpha-value>)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
