/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2F3C7E", // Sidebar, Graph line
        secondary: "#DDE2F1", // Sidebar selected item
        online: "#00B87C", // Online status
        offline: "#636363", // Offline status
        bgLight: "#EDEDED", // Light backgrounds
        bgWhite: "#FFFFFF", // Main background
        textPrimary: "#000000", // Black text
      },
       keyframes: {
        bell: {
          '0%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(-15deg)' },
          '40%': { transform: 'rotate(15deg)' },
          '60%': { transform: 'rotate(-10deg)' },
          '80%': { transform: 'rotate(10deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
      },
      animation: {
        bell: 'bell 0.6s ease-in-out',
      },
    },
  },
  plugins: [],
};
