const { prompt } = require('inquirer');
const { Gitlab } = require('gitlab');
const chalk = require('chalk');
const { GITLAB_MEH_NAMESPACE } = require('../config.json');

const filter = input => input.trim().replace(/\s+/g, ' ');

module.exports = () => {
  console.log(chalk.gray('\nWe need to know a few things…'));

  return prompt([
    {
      mask: '*',
      name: 'token',
      type: 'password',
      message: 'Please provide your GitLab personal access token:',
      filter,
      async validate(token) {
        if (!token) {
          return 'Please provide a token';
        }

        try {
          const gitlab = new Gitlab({ token });

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
      message: `Are you planning on using React? (Only affects linting)`,
      default: false,
    },
  ]);
};
