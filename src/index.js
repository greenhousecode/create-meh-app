const { Gitlab } = require('gitlab');
const { prompt } = require('inquirer');
const boxen = require('boxen');
const chalk = require('chalk');
const clear = require('clear');
const { version } = require('../package.json');

const GITLAB_MEH_NAMESPACE = 'GreenhouseGroup/meh';
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
  );
  console.log(chalk.gray('We need to know a few things…'));

  const answers = await prompt([
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
      async validate(slugName) {
        if (!/^[0-9a-z]+(-[0-9a-z]+)*$/.test(slugName)) {
          return 'Please only use kebab-case, without any special characters';
        }

        try {
          await gitlab.Projects.show(`${GITLAB_MEH_NAMESPACE}/${slugName}`);
          return 'This project slug name already exists!';
        } catch ({ message }) {
          if (message !== 'Not Found') {
            return `Couldn't check for duplicates: ${message}`;
          }
        }

        return true;
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Please provide one line describing your app:',
      default: 'To make the world a better place.',
      filter,
    },
  ]);

  console.log('answers', answers);
})();
