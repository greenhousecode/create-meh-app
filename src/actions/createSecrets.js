const { ui } = require('inquirer');
const chalk = require('chalk');
const spawnPromise = require('../utils/spawnPromise');

module.exports = async ({ cwd, token }) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Creating environment secrets…'));

  try {
    await spawnPromise('yarn', ['upload-env'], {
      cwd,
      env: { ...process.env, GITLAB_PERSONAL_ACCESS_TOKEN: token },
    });
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red('✘ Creating environment secrets failed'));
    throw err;
  }

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Created environment secrets'));
};
