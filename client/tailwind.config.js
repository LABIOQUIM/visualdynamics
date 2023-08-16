const colors = require("tailwindcss/colors");
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./aold/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  future: {
    hoverOnlyWhenSupported: true
  },
  theme: {
    extend: {
      colors: {
        primary: colors.green
      },
      fontFamily: {
        inter: ["Inter", ...fontFamily.sans]
      },
      keyframes: ({ theme }) => ({
        slideUpEnter: {
          "0%": {
            opacity: 0,
            transform: "translateY(20px)"
          },
          "100%": {
            opacity: 100,
            transform: "translateY(0px)"
          }
        },
        rerender: {
          "0%": {
            "border-color": theme("colors.pink")
          },
          "40%": {
            "border-color": theme("colors.pink")
          }
        },
        highlight: {
          "0%": {
            background: theme("colors.pink"),
            color: theme("colors.white")
          },
          "40%": {
            background: theme("colors.pink"),
            color: theme("colors.white")
          }
        },
        shimmer: {
          "100%": {
            transform: "translateX(100%)"
          }
        },
        translateXReset: {
          "100%": {
            transform: "translateX(0)"
          }
        },
        fadeToTransparent: {
          "0%": {
            opacity: 1
          },
          "40%": {
            opacity: 1
          },
          "100%": {
            opacity: 0
          }
        }
      }),
      animation: {
        slideUpEnter: "slideUpEnter .3s ease-in-out"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
