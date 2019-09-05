const { ui } = require('inquirer');
const chalk = require('chalk');
const spawnPromise = require('../utils/spawnPromise');

module.exports = async ({ framework, typescript, cwd }) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Installing dependencies…'));

  try {
    // Install devDependencies
    await spawnPromise(
      'yarn',
      [
        'add',
        'husky',
        'tempy',
        'dotenv',
        'gitlab',
        'prettier',
        'lint-staged',
        'eslint-config-prettier',
        'eslint-plugin-prettier',
        ...(framework === 'Vue' ? ['eslint-plugin-vue', '--dev'] : ['--dev']),
      ],
      { cwd },
    );

    // Install Airbnb ESLint config
    if (typescript) {
      await spawnPromise(
        'yarn',
        [
          'add',
          'eslint',
          'typescript',
          'eslint-plugin-import',
          'eslint-config-airbnb-typescript',
          '@typescript-eslint/eslint-plugin',
          ...(framework === 'React'
            ? ['eslint-plugin-jsx-a11y', 'eslint-plugin-react', '--dev']
            : ['--dev']),
        ],
        { cwd },
      );
    } else {
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
    }
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red('✘ Installing failed'));
    process.exit(1);
  }

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Installed dependencies'));
};
