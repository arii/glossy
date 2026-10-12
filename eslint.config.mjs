import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  globalIgnores([
    ".next/**",
    ".open-next/**",
    "out/**",
    "node_modules/**",
    "next-env.d.ts",
    "public/admin/**",
    "scripts/archive/**",
    "tina/__generated__/**",
  ]),
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off"
    }
  }
]);
