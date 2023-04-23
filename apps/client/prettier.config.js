module.exports = {
  semi: true,
  singleAttributePerLine: true,
  trailingComma: "none",
  tabWidth: 2,
  singleQuote: false,
  plugins: [require("prettier-plugin-tailwindcss")],
  tailwindConfig: "./tailwind.config.js"
};
