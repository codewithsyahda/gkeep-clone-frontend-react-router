import eslintReact from '@eslint-react/eslint-plugin';
import eslintJs from '@eslint/js';
import eslintPlgQuery from '@tanstack/eslint-plugin-query';
import eslintCfgPrettier from 'eslint-config-prettier/flat';
import eslintPlgStorybook from 'eslint-plugin-storybook';
import eslintPlgUnusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    '.temp/',
    '.react-router/',
    '!.storybook/',
    'build/',
    'temp/',
    'coverage/',
    'public/mockServiceWorker.js',
  ]),
  {
    files: ['**/*.js'],
    plugins: { js: eslintJs },
    extends: [eslintJs.configs.recommended],
  },
  tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['tests/e2e/**'],
    extends: [eslintReact.configs['recommended-typescript']],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  eslintPlgStorybook.configs['flat/recommended'],
  ...eslintPlgQuery.configs['flat/recommended'],
  {
    plugins: {
      'unused-imports': eslintPlgUnusedImports,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  eslintCfgPrettier,
]);
