const { prompt } = require('inquirer');
const { Gitlab } = require('gitlab');
const { join } = require('path');
const chalk = require('chalk');
const { GITLAB_NAMESPACES } = require('../config.json');

const filter = input => input.trim().replace(/\s+/g, ' ');

module.exports = async slugName => {
  console.log(chalk.gray('We need to know a few things…'));

  let gitlabData;

  const answers = await prompt([
    {
      type: 'list',
      name: 'namespace',
      message: 'Choose a GitLab namespace:',
      choices: Object.keys(GITLAB_NAMESPACES).map(key => ({
        name: GITLAB_NAMESPACES[key].name,
        value: key,
      })),
    },
    ...Object.keys(GITLAB_NAMESPACES).map(key => ({
      mask: '*',
      name: 'token',
      type: 'password',
      message: 'Provide your GitLab personal access token:',
      filter,
      when: ({ namespace }) => namespace === key,
      async validate(token) {
        if (!token) {
          return 'Please provide a token';
        }

        try {
          const gitlab = new Gitlab({ token });

          const [, { name, email }] = await Promise.all([
            // Determine user has access to the chosen namespace
            gitlab.GroupVariables.show(
              GITLAB_NAMESPACES[key].id,
              GITLAB_NAMESPACES[key].clusterVariableKey,
            ),
            gitlab.Users.current(),
          ]);

          gitlabData = { name, email };

          return true;
        } catch ({ message }) {
          return message === 'Not Found'
            ? `You don't have access to the "${GITLAB_NAMESPACES[key].name}" namespace`
            : `There was an issue with your token: ${message}`;
        }
      },
    })),
    {
      name: 'name',
      type: 'input',
      message: `What's the name of your app?`,
      default: () =>
        slugName.replace(/-/g, ' ').replace(/^[a-z]| [a-z]/g, match => match.toUpperCase()),
      filter,
      validate: name => !!name || 'Please provide a name',
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
      type: 'confirm',
      name: 'typescript',
      message: 'Will you be using TypeScript? (Only affects linting)',
      default: false,
    },
    {
      name: 'stages',
      type: 'checkbox',
      message: 'Select the deployment stages (besides production) you wish to use:',
      filter: choices => [...choices, 'prod'],
      choices: [
        { name: 'Testing', value: 'test', checked: true },
        { name: 'Acceptance', value: 'acc', checked: true },
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
    slugName,
    cwd: join(process.cwd(), slugName),
  };
};
