/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // 如果你有使用其他目錄也記得加進來
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};
