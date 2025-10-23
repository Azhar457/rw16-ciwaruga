import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
// Hapus import reactHooksPlugin jika tidak digunakan langsung

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals"), // Cukup gunakan ini, biasanya sudah include react-hooks

  // --- Hapus atau komentari bagian ini ---
  // {
  //   files: ["**/*.{js,jsx,ts,tsx}"],
  //   plugins: {
  //     "react-hooks": reactHooksPlugin,
  //   },
  //   rules: {
  //     ...reactHooksPlugin.configs.recommended.rules,
  //     "react-hooks/rules-of-hooks": "error",
  //     "react-hooks/exhaustive-deps": "warn",
  //   },
  //   settings: {
  //     react: {
  //       version: "detect",
  //     },
  //   }
  // },
  // ----------------------------------------
];

export default eslintConfig;