const { prompt } = require('inquirer');
const { Gitlab } = require('gitlab');
const { join } = require('path');
const chalk = require('chalk');
const { GITLAB_NAMESPACES } = require('../config.json');

const filter = input => input.trim().replace(/\s+/g, ' ');

module.exports = async input => {
  const cwd = input.match(/^\//) ? input : join(process.cwd(), input);
  const appName = input.match(/[0-9a-z-]+$/)[0];
  let gitlabData;

  console.log(chalk.gray(`Creating ${chalk.bold(cwd)}…`));

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
      mask: '●',
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
      message: "What's the name of your app?",
      default: () =>
        appName.replace(/-/g, ' ').replace(/^[a-z]| [a-z]/g, match => match.toUpperCase()),
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
      choices: [
        { name: 'None', value: 'none' },
        { name: 'React', value: 'react' },
        { name: 'Vue', value: 'vue' },
      ],
    },
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Will you be using TypeScript? (Only affects linting)',
      default: false,
    },
    {
      type: 'confirm',
      name: 'sentry',
      message: 'Do you want to use Sentry for this project?',
<<<<<<< HEAD
      default: true,
=======
      default: false,
>>>>>>> rebased feature onto develop
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
    {
      name: 'dags',
      default: false,
      type: 'confirm',
      message: 'Do you want to add Airflow DAG(s)?',
    },
    {
      type: 'input',
      default: 'job',
      name: 'dagName',
      when: ({ dags }) => dags,
      message: "What's the name of your DAG? ([a-z0-9-])",
      validate: dagName => {
        if (!dagName) return 'Please provide a DAG name';
        if (!/^[a-z0-9-]+$/.test(dagName)) return 'Only use [a-z0-9-] for your DAG name';
        return true;
      },
    },
    {
      filter,
      type: 'input',
      name: 'dagDescription',
      when: ({ dags }) => dags,
      default: 'To make the world a better place',
      message: 'Please provide one line describing your DAG:',
      validate: dagDescription => !!dagDescription || 'Please provide a DAG description',
    },
    {
      default: 3,
      type: 'list',
      name: 'dagInterval',
      when: ({ dags }) => dags,
      message: 'How often should this DAG run? (you can change this later)',
      choices: [
        { name: 'Every minute', value: '*/1 * * * *' },
        { name: 'Every 5 minutes', value: '*/5 * * * *' },
        { name: 'Every 15 minutes', value: '*/15 * * * *' },
        { name: 'Every hour', value: '@hourly' },
        { name: 'Every day', value: '@daily' },
        { name: 'Every week', value: '@weekly' },
        { name: 'Every month', value: '@monthly' },
      ],
    },
  ]);

  return { ...answers, gitlabData, appName, cwd };
};
