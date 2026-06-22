import nextPlugin from '@next/eslint-plugin-next';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', '*.tsbuildinfo'],
  },
  nextPlugin.flatConfig.coreWebVitals,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@next/next/no-page-custom-font': 'off',
    },
  },
];

export default eslintConfig;
