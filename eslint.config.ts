import eslintJs from '@eslint/js';
import eslintCfgPrettier from 'eslint-config-prettier/flat';
import eslintPlgReact from 'eslint-plugin-react';
import eslintPlgReactHooks from 'eslint-plugin-react-hooks';
import eslintPlgStorybook from 'eslint-plugin-storybook';
import eslintPlgUnusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['.temp/', '.react-router/', '!.storybook', 'build/', 'temp/']),
  {
    files: ['**/*.{js,ts,tsx}'],
    plugins: {
      js: eslintJs,
      react: eslintPlgReact,
    },
    extends: ['js/recommended'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-console': 'error',
      'react/react-in-jsx-scope': 'off',
    },
  },
  eslintPlgReactHooks.configs.flat.recommended,
  tseslint.configs.recommended,
  eslintPlgStorybook.configs['flat/recommended'],
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
  eslintCfgPrettier,
]);
