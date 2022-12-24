/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        card: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
      },
      backgroundImage: {
        card: "url(/Assets/images/bg.jpg)",
      },
      colors: {
        "overlay-black": "rgba(0,0,0,0.6)",
        bgModal: "rgba(0,0,0,0.3)",
        bgnavy: "white",
      },
      dropShadow: {
        "3xl": "0 1px 1px black",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
