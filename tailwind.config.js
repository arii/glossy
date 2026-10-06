/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Charis SIL"', '"Doulos SIL"', '"Noto Serif"', "Georgia", "serif"],
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
