import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      // Dependency directories
      "node_modules/",

      // NextJS Files
      "build/",
      "public/*",
      ".next/",
      "next-env.d.ts",

      // Generated types
      ".next/types/**/*",

      // Additional common ignores
      "dist/",
      "*.d.ts",
      ".env*",
      ".cache/",
      ".turbo/",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": ["error"],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: [
      "src/app/dashboard/settings/components/vacation-preferences-settings.tsx",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
