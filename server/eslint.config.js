const js = require("@eslint/js");
const globals = require("globals");
const tseslint = require("typescript-eslint");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": ["error", { ignoreRestSiblings: true }],
    },
  },
  {
    files: ["**/*.ts"],
    extends: [tseslint.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
    },
  },
  {
    files: ["tests/**/*.ts"],
    languageOptions: { globals: globals.vitest },
  },
]);
