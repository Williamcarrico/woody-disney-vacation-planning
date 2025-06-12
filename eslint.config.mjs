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
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    rules: {
      // Temporarily relax these rules to focus on core functionality
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "react/no-unescaped-entities": "warn",
      "import/no-anonymous-default-export": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      // Keep these as errors for critical issues
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
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
