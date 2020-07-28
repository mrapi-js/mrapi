module.exports = {
  root: true,
  plugins: ['jest'],
  extends: [
    'standard-with-typescript',
    'prettier/@typescript-eslint',
    'plugin:jest/recommended',
  ],
  parserOptions: {
    project: ['./tsconfig.json', './packages/**/tsconfig.json'],
  },
  // “off” or 0 - 关闭(禁用)规则
  // “warn” or 1 - 将规则视为一个警告（并不会导致检查不通过）
  // “error” or 2 - 将规则视为一个错误 (退出码为1，检查不通过)
  rules: {
    'comma-dangle': ['off', 'never'],
  },
}
