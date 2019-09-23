const git = require('simple-git/promise');
const { ui } = require('inquirer');
const chalk = require('chalk');

module.exports = async ({ cwd }) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Pushing all branches…'));

  try {
    await git(cwd).push('origin', 'master');
    await git(cwd).push('origin', 'develop');
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red('✘ Pushing branches failed'));
    throw err;
  }

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Pushed all branches'));
};
