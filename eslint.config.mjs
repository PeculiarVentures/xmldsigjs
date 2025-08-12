import tseslint from 'typescript-eslint';
import baseConfig from '@peculiar/eslint-config-base';

export default tseslint.config([
  ...baseConfig,
  {
    ignores: [
      'packages/*/build',
      'examples/**',
    ],
  },
  {
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          moduleDirectory: ['node_modules', 'packages'],
        },
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    rules: { 'import/no-unresolved': 'off' },
    files: ['./eslint.config.mjs', 'vitest.config.ts'],
  },
  {
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-useless-escape': 'off',
      '@stylistic/max-len': 'off',
    },
    files: [
      'package/*/sec/**/*.spec.ts',
      'package/*/test/**/*.ts',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@stylistic/operator-linebreak': [
        'error',
        'after',
        {
          overrides: {
            '=': 'after',
            '&&': 'after',
            '||': 'after',
            '??': 'after',
            '?': 'before',
            ':': 'before',
            '|': 'before',
          },
        },
      ],
      '@stylistic/object-curly-newline': [
        'error',
        {
          ExportDeclaration: { multiline: true, minProperties: 4, consistent: true },
        },
      ],
      '@stylistic/padding-line-between-statements': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/unified-signatures': 'off',
    },
  },
]);
