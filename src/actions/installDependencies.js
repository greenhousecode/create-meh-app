const { ui } = require('inquirer');
const chalk = require('chalk');
const spawnPromise = require('../utils/spawnPromise');

const DEFAULT_DEPENDENCIES = [];
const DEFAULT_DEV_DEPENDENCIES = [
  'husky',
  'tempy',
  'dotenv',
  'gitlab',
  'prettier',
  'lint-staged',
  'eslint-config-prettier',
];

module.exports = async ({ sentry, framework, typescript, cwd }) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Installing dependencies…'));

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
        ...(framework === 'Vue' ? ['eslint-plugin-vue', '--dev'] : ['--dev']),
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
