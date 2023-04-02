const colors = require("tailwindcss/colors");
const { fontFamily } = require("tailwindcss/defaultTheme");
const { createThemes } = require("tw-colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  future: {
    hoverOnlyWhenSupported: true
  },
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", ...fontFamily.sans],
        grotesk: ["Space Grotesk", ...fontFamily.sans]
      },
      backgroundImage: ({ theme }) => ({
        "vc-border-gradient": `radial-gradient(at left top, ${theme(
          "colors.gray.500"
        )}, 50px, ${theme("colors.gray.800")} 50%)`
      }),
      keyframes: ({ theme }) => ({
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
      })
    }
  },
  plugins: [
    createThemes({
      brand: {
        "gray-1000": "#0D0D0D",
        "gray-1001": "#161616",
        "gray-1002": "#212121",
        primary: colors.emerald
      },
      sky: {
        "gray-1000": "#0D0D0D",
        "gray-1001": "#161616",
        "gray-1002": "#212121",
        primary: colors.sky
      },
      violet: {
        "gray-1000": "#0D0D0D",
        "gray-1001": "#161616",
        "gray-1002": "#212121",
        primary: colors.violet
      },
      rose: {
        "gray-1000": "#0D0D0D",
        "gray-1001": "#161616",
        "gray-1002": "#212121",
        primary: colors.rose
      }
    }),
    require("@tailwindcss/forms"),
    require("tailwindcss-hero-patterns")
  ]
};
