module.exports = {
  extends: [
    "next",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended"
  ],
  parser: "@typescript-eslint/parser",
  root: true,
  plugins: ["simple-import-sort"],
  rules: {
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-var-requires": "off",
    "prettier/prettier": ["warn", { usePrettierrc: true }],
    "react/react-in-jsx-scope": "off",
    "react/display-name": "off",
    "@typescript-eslint/no-unused-vars": ["warn"],
    "react/prop-types": "off",
    "react/self-closing-comp": [
      "warn",
      {
        component: true,
        html: true
      }
    ],
    "simple-import-sort/exports": "warn",
    "simple-import-sort/imports": [
      "warn",
      {
        groups: [
          // Packages `react` related packages come first.
          ["^react", "^@?\\w"],
          // Internal packages.
          ["^(@app)(/.*|$)"],
          // Side effect imports.
          ["^\\u0000"],
          // Parent imports. Put `..` last.
          ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
          // Other relative imports. Put same-folder imports and `.` last.
          ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          // Style imports.
          ["^.+\\.?(css)$"]
        ]
      }
    ]
  }
};
