const { ui } = require('inquirer');
const chalk = require('chalk');

const spawnPromise = require('../utils/spawnPromise');

module.exports = async ({ cwd }) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Linting and formatting…'));

  try {
    await spawnPromise('yarn', ['lint', '--fix'], { cwd });
    await spawnPromise('yarn', ['format', '--write'], { cwd });
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red('✘ Linting and formatting failed'));
    throw err;
  }

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Linted and formatted'));
};
