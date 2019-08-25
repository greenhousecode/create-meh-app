const chalk = require('chalk');
const { join } = require('path');
const { existsSync, mkdirSync } = require('fs');

module.exports = ({ slugName }) => {
  if (!existsSync(slugName)) {
    mkdirSync(slugName);
    console.log(chalk.green(`✔ Created new directory "${slugName}"`));
  } else {
    console.log(chalk.yellow(`✔ Directory "${slugName}" already exists`));
  }

  return join(process.cwd(), slugName);
};
