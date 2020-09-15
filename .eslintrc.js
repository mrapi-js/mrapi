module.exports = {
  root: true,
  plugins: ['jest'],
  env: {
    node: true,
    es6: true,
  },
  extends: [
    'standard-with-typescript',
    'prettier/@typescript-eslint',
    'plugin:jest/recommended',
  ],
  parserOptions: {
    project: ['./tsconfig.json', './packages/*/tsconfig.json'],
  },
  // “off” or 0 - 关闭(禁用)规则
  // “warn” or 1 - 将规则视为一个警告（并不会导致检查不通过）
  // “error” or 2 - 将规则视为一个错误 (退出码为1，检查不通过)
  rules: {
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
    'comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        caughtErrorsIgnorePattern: '^ignore',
      },
    ],
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      { allowAny: true, allowNullish: true, allowBoolean: true },
    ],
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'default-param-last': 'off',
    '@typescript-eslint/default-param-last': 'off',
    '@typescript-eslint/promise-function-async': [
      'error',
      {
        allowedPromiseNames: ['Thenable'],
        checkArrowFunctions: true,
        checkFunctionDeclarations: true,
        checkFunctionExpressions: true,
        checkMethodDeclarations: true,
      },
    ],
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],
  },
}
