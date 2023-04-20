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
  plugins: [
    createThemes({
      amber: {
        primary: colors.amber
      },
      stone: {
        primary: colors.stone
      },
      green: {
        primary: colors.green
      },
      indigo: {
        primary: colors.indigo
      },
      violet: {
        primary: colors.violet
      },
      rose: {
        primary: colors.rose
      }
    }),
    require("tailwindcss-hero-patterns")
  ]
};
