const git = require('simple-git/promise');
const { ui } = require('inquirer');
const chalk = require('chalk');

module.exports = async ({ cwd }) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Checking out develop branch…'));

  try {
    await git(cwd).checkoutLocalBranch('develop');
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red('✘ Checking out develop branch failed'));
    process.exit(1);
  }

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Checked out develop branch'));
};
