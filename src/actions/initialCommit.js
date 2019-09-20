const git = require('simple-git/promise');
const { ui } = require('inquirer');
const chalk = require('chalk');

module.exports = async ({ cwd }) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Creating initial commit…'));

  try {
    await git(cwd).add('./*');
    await git(cwd).commit('Initial commit');
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red('✘ Creating initial commit failed'));
    throw err;
  }

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Created initial commit'));
};
