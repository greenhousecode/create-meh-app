const { spawn } = require('child_process');
const { ui } = require('inquirer');
const chalk = require('chalk');

module.exports = async ({ react }, cwd) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Installing dependencies…'));

  const installing = new Promise((resolve, reject) => {
    const job = spawn(
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

    job.on('close', code => (code === 0 ? resolve() : reject()));
  });

  const installingAirbnb = new Promise((resolve, reject) => {
    const job = spawn(
      'npx',
      [
        'install-peerdeps',
        react ? 'eslint-config-airbnb' : 'eslint-config-airbnb-base',
        '--dev',
        '--yarn',
      ],
      { cwd },
    );

    job.on('close', code => (code === 0 ? resolve() : reject()));
  });

  await Promise.all([installing, installingAirbnb]).catch(() => {
    bar.updateBottomBar('');
    console.log(chalk.red('✘ Installing failed'));
    process.exit(1);
  });

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Installed dependencies'));
};
