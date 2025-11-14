import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import {defineConfig, globalIgnores} from 'eslint/config'
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
                tsconfigRootDir: __dirname,
            },
        },
    },
    tseslint.configs.recommended,
    prettier,
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
])
