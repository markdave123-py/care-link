/* eslint.config.cjs */

const js = require("@eslint/js");              // core ESLint rules
const tseslint = require("typescript-eslint"); // parser + TS rules

module.exports = [
  // 1) ESLint recommended
  js.configs.recommended,

  // 2) TypeScript recommended
  ...tseslint.configs.recommended,

  // 3) Your project tweaks
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { project: "./tsconfig.json" }, // enables type‑aware rules
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  },
];
