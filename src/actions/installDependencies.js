const { ui } = require('inquirer');
const chalk = require('chalk');
const spawnPromise = require('../utils/spawnPromise');

const DEFAULT_DEPENDENCIES = [];
const DEFAULT_DEV_DEPENDENCIES = [
  'husky',
  'tempy',
  'gitlab',
  'prettier',
  'lint-staged',
  'eslint-config-prettier',
];

module.exports = async ({ sentry, framework, typescript, cwd }) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Installing dependencies (this can take a minute)…'));

  try {
    const dependencies = [...DEFAULT_DEPENDENCIES];

    if (sentry) {
      dependencies.push('@sentry/node');
    }

    if (dependencies.length) {
      // Install dependencies
      await spawnPromise('yarn', ['add', ...dependencies], { cwd });
    }

    // Install devDependencies
    await spawnPromise(
      'yarn',
      [
        'add',
        ...DEFAULT_DEV_DEPENDENCIES,
        ...(typescript
          ? ['typescript', '@typescript-eslint/parser', '@typescript-eslint/eslint-plugin']
          : ['eslint-plugin-prettier']),
        ...(framework === 'vue' ? ['eslint-plugin-vue', '--dev'] : ['--dev']),
      ],
      { cwd },
    );

    // Install Airbnb ESLint config
    await spawnPromise(
      'npx',
      [
        'install-peerdeps',
        framework === 'react' ? 'eslint-config-airbnb' : 'eslint-config-airbnb-base',
        '--dev',
        '--yarn',
      ],
      { cwd },
    );
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red('✘ Installing failed'));
    throw err;
  }

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Installed dependencies'));
};
