import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'playwright-report/',
      'test-results/',
      '.auth/',
      'eslint.config.mjs',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // A missing `await` on a Playwright call is the most common cause of flaky tests.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'warn',
      // Page objects expose assertion helpers such as `expectToBeOpen` and `expectCartCount`.
      'playwright/expect-expect': ['error', { assertFunctionPatterns: ['^expect'] }],
    },
  },
  prettier,
);
