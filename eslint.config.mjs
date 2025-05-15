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
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
    },
  },
  // Override TypeScript rules more broadly to allow any type
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // This rule targets any usage of 'any' type
      "@typescript-eslint/ban-types": [
        "error",
        {
          types: {
            "{}": false,
            object: false,
            any: false,
          },
          extendDefaults: true,
        },
      ],
    },
  },
];

export default eslintConfig;
