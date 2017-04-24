module.exports = {
  parser: "babel-eslint",
  extends: [
    "airbnb-base",
    "plugin:flowtype/recommended",
    "plugin:jest/recommended"
  ],
  plugins: ["import", "promise", "flowtype", "jest"],
  env: {
    node: true,
    jest: true,
    browser: false
  },
  globals: {
    atom: false
  },
  rules: {
    "no-confusing-arrow": 0
  }
};
