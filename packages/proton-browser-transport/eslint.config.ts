import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import css from '@eslint/css'
import {defineConfig, globalIgnores} from 'eslint/config'
import svelte from 'eslint-plugin-svelte'
import svelteparser from 'svelte-eslint-parser'
import prettier from 'eslint-plugin-prettier/recommended'

export default defineConfig([
  globalIgnores(['lib/*', 'node_modules/**/*']),
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: {js},
    extends: ['js/recommended'],
    languageOptions: {
      globals: {...globals.browser, ...globals.node, NodeJS: true},
      parserOptions: {
        extraFileExtensions: ['.svelte'],
        tsconfigRootDir: __dirname,
      },
    },
  },
  tseslint.configs.recommended,
  svelte.configs.recommended,
  prettier,
  svelte.configs.prettier,
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parser: svelteparser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte'],
      },
    },
  },
  {
    rules: {
      'prettier/prettier': 'warn',
      'no-console': 'warn',

      'sort-imports': [
        'warn',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'no-inner-declarations': 'off',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {files: ['**/*.css'], plugins: {css}, language: 'css/css', extends: ['css/recommended']},

  // {files: ['**/*.json'], plugins: {json}, language: 'json/json', extends: ['json/recommended']},
])
