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
    "node_modules/**",
    "next-env.d.ts",
    "public/admin/**",
    "tina/__generated__/**",
  ]),
]);
