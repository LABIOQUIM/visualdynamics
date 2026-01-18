import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";
import prettierPlugin from "eslint-plugin-prettier";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

/**
 * Helper: return a shallow copy of an object with any `extends` property removed.
 * This prevents "Nested 'extends' is not allowed." when spreading configs that themselves
 * contain an `extends` field.
 */
const stripExtends = (cfg = {}) => {
  if (!cfg || typeof cfg !== "object") return {};
  const { extends: _discard, ...rest } = cfg;
  return rest;
};

export default defineConfig([
  globalIgnores(["dist", "node_modules", "routeTree.gen.ts"]),
  {
    ...stripExtends(reactPlugin.configs?.flat?.recommended),
    ...stripExtends(reactPlugin.configs?.flat?.["jsx-runtime"]),
    ...stripExtends(js.configs?.recommended),
    ...stripExtends(tsPlugin.configs?.recommended),
    ...stripExtends(reactHooks.configs?.["recommended-latest"]),
    files: ["**/*.{cjs,mjs,js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "simple-import-sort": simpleImportSort,
      react: reactPlugin,
      "@stylistic": stylistic,
      prettier: prettierPlugin,
    },
    rules: {
      ...(reactPlugin.configs?.recommended?.rules ?? {}),

      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",

      "@stylistic/jsx-quotes": ["warn", "prefer-double"],
      // "@stylistic/indent": ["warn", 2],
      "@stylistic/semi": ["warn", "always"],
      "@stylistic/quotes": ["warn", "double", { avoidEscape: true }],
      "@stylistic/object-curly-spacing": ["warn", "always"],
      "@stylistic/comma-dangle": ["warn", "always-multiline"],
      "@stylistic/jsx-indent-props": ["warn", 2],
      "@stylistic/jsx-sort-props": "warn",

      "prettier/prettier": "warn",

      "react-refresh/only-export-components": "off",

      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "warn",

      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],

      "simple-import-sort/exports": "warn",
      "simple-import-sort/imports": [
        "warn",
        {
          groups: [
            ["^.+\\.?(css)$"],
            ["^\\u0000"],
            ["^react", "^@?\\w"],
            ["^(@app)(/.*|$)"],
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          ],
        },
      ],
    },
  },
]);
