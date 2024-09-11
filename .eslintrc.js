const { resolve } = require("path");
module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: true,

  env: {
    browser: true,
  },

  // Rules order is important, please avoid shuffling them
  extends: ["coralloy"],
};
