import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import reactHooksPlugin from "eslint-plugin-react-hooks"; // Import the plugin

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  // Recommended: specify plugins explicitly if needed by compat rules
});

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals"), // Apply Next.js core rules first

  // Configuration object specifically for React Hooks rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"], // Apply only to relevant files
    plugins: {
      "react-hooks": reactHooksPlugin, // Define the plugin
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules, // Spread recommended rules
      "react-hooks/rules-of-hooks": "error", // Explicitly define rules
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: {
         version: "detect", // Automatically detect React version
      },
    }
  },
  // You might have other custom configurations here
];

export default eslintConfig;