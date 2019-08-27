const { ui } = require('inquirer');
const chalk = require('chalk');
const spawnPromise = require('../utils/spawnPromise');

module.exports = async ({ framework }, cwd) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Installing dependencies…'));

  try {
    // Install dependencies
    await spawnPromise(
      'yarn',
      [
        'add',
        'husky',
        'lint-staged',
        'prettier',
        'eslint-config-prettier',
        'eslint-plugin-prettier',
        '--dev',
      ],
      { cwd },
    );

    // Install Airbnb ESLint config
    await spawnPromise(
      'npx',
      [
        'install-peerdeps',
        framework === 'React' ? 'eslint-config-airbnb' : 'eslint-config-airbnb-base',
        '--dev',
        '--yarn',
      ],
      { cwd },
    );
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red('✘ Installing failed'));
    process.exit(1);
  }

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Installed dependencies'));
};
