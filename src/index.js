const { existsSync, mkdirSync } = require('fs');
const { spawn } = require('child_process');
const { prompt, ui } = require('inquirer');
const { Gitlab } = require('gitlab');
const boxen = require('boxen');
const chalk = require('chalk');
const clear = require('clear');
const { version } = require('../package.json');

const GITLAB_MEH_NAMESPACE = 'GreenhouseGroup/meh';
const GITLAB_MEH_NAMESPACE_ID = 4495257;
let gitlab;

const filter = input => input.trim().replace(/\s+/g, ' ');

(async () => {
  clear();
  console.log(
    boxen(`${chalk.bold('CREATE MEH APP')} ${chalk.gray(`v${version}`)}`, {
      borderColor: 'cyan',
      float: 'center',
      padding: 1,
      margin: 1,
    }),
    chalk.gray('\nWe need to know a few things…'),
  );

  const { slugName, description } = await prompt([
    {
      mask: '*',
      type: 'password',
      name: 'gitlabPersonalAccessToken',
      message: 'Please provide your GitLab personal access token:',
      filter,
      async validate(token) {
        if (!token) {
          return 'Please provide a token';
        }

        try {
          gitlab = new Gitlab({ token });

          // TODO: find a better way to determine access
          await gitlab.GroupProjects.all(GITLAB_MEH_NAMESPACE, { maxPages: 1, perPage: 1 });

          return true;
        } catch ({ message }) {
          return message === 'Not Found'
            ? `You don't have access to the "MEH" group`
            : `There was an issue with your token: ${message}`;
        }
      },
    },
    {
      name: 'name',
      type: 'input',
      message: `What's the name of your app?`,
      default: 'My App',
      filter,
      validate: name => !!name || 'Please provide a name',
    },
    {
      type: 'input',
      name: 'slugName',
      message: `What's the slug name for your app?`,
      default: ({ name }) =>
        name
          .toLowerCase()
          .replace(/[^0-9a-z\s]+/g, '')
          .replace(/\s+/g, '-'),
      filter,
      validate: slugName =>
        /^[0-9a-z]+(-[0-9a-z]+)*$/.test(slugName) ||
        'Please only use kebab-case, without any special characters',
    },
    {
      type: 'input',
      name: 'description',
      message: 'Please provide one line describing your app:',
      default: 'To make the world a better place.',
      filter,
    },
    {
      name: 'react',
      type: 'confirm',
      message: `Are you planning to use React? (Only affects linting)`,
      default: false,
    },
  ]);

  console.log(chalk.gray('\nInstalling…'));
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Creating GitLab project…'));

  try {
    const { ssh_url_to_repo, http_url_to_repo, web_url } = await gitlab.Projects.create({
      namespace_id: GITLAB_MEH_NAMESPACE_ID,
      name: slugName,
      description,
    });

    bar.updateBottomBar('');
    console.log(chalk.green('✔ Created GitLab project'));
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red(`✘ Creating GitLab project failed (${err.message}):`));
    console.error(err.description);
    process.exit(1);
  }

  if (!existsSync(slugName)) {
    mkdirSync(slugName);
    console.log(chalk.green(`✔ Created new directory "${slugName}"`));
  } else {
    console.log(chalk.yellow(`✔ Directory "${slugName}" already exists`));
  }
})();
