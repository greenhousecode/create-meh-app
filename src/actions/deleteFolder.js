const rimraf = require('rimraf');

module.exports = (answers) =>
  new Promise((resolve) => (answers ? rimraf(answers.cwd, resolve) : resolve()));
