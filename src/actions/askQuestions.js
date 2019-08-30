const { prompt } = require('inquirer');
const { Gitlab } = require('gitlab');
const chalk = require('chalk');
const { GITLAB_MEH_NAMESPACE_ID, GITLAB_MEH_CLUSTER_VARIABLE_KEY } = require('../config.json');

const filter = input => input.trim().replace(/\s+/g, ' ');

module.exports = async () => {
  console.log(chalk.gray('We need to know a few things…'));

  let gitlabData;

  const answers = await prompt([
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

          const [, { name, email }] = await Promise.all([
            // Determine user has access to the MEH namespace within GitLab
            gitlab.GroupVariables.show(GITLAB_MEH_NAMESPACE_ID, GITLAB_MEH_CLUSTER_VARIABLE_KEY),
            gitlab.Users.current(),
          ]);

          gitlabData = { name, email };

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
      type: 'list',
      name: 'framework',
      message: 'Which framework are you planning on using? (Only affects linting)',
      choices: ['None', 'React', 'Vue'],
    },
    {
      name: 'stages',
      type: 'checkbox',
      message: 'Select the deployment stages you want to use:',
      filter: choices => [...choices, 'prod'],
      choices: [
        { name: 'Testing', value: 'test', checked: true },
        { name: 'Acceptance', value: 'acc', checked: true },
        { name: 'Production', disabled: 'always enabled' },
      ],
    },
    {
      type: 'list',
      name: 'protocol',
      message: 'Clone repository using:',
      choices: ['SSH', 'HTTPS'],
    },
  ]);

  return {
    ...answers,
    gitlabData,
  };
};
