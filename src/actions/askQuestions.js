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
      name: 'namespace',
      type: 'list',
      message: 'Choose a GitLab namespace:',
      choices: Object.keys(GITLAB_NAMESPACES).map(key => ({
        name: GITLAB_NAMESPACES[key].name,
        value: key,
      })),
    },
    ...Object.keys(GITLAB_NAMESPACES).map(key => ({
      name: 'token',
      type: 'password',
      message: process.env.GITLAB_PERSONAL_ACCESS_TOKEN
        ? `GITLAB_PERSONAL_ACCESS_TOKEN found and prefilled, hit ${chalk.cyan('<RETURN>')}`
        : 'Provide your GitLab personal access token:',
      default: process.env.GITLAB_PERSONAL_ACCESS_TOKEN,
      mask: '●',
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
      name: 'description',
      type: 'input',
      message: 'Please provide one line describing your app:',
      default: 'To make the world a better place.',
      filter,
    },
    {
      name: 'protocol',
      type: 'list',
      message: 'Clone repository using:',
      choices: ['SSH', 'HTTPS'],
    },
    {
      name: 'framework',
      type: 'list',
      message: 'Which framework are you planning on using? (Only affects linting)',
      choices: [
        { name: 'None', value: 'none' },
        { name: 'React', value: 'react' },
        { name: 'Vue', value: 'vue' },
      ],
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
      name: 'addons',
      type: 'checkbox',
      message: 'Check any of the following you want to include:',
      choices: [
        { name: 'TypeScript (only affects linting)', value: 'typescript' },
        { name: 'Airflow DAG(s)', value: 'airflow' },
        { name: 'MongoDB database', value: 'mongodb' },
        { name: 'Pingdom monitoring', value: 'pingdom', checked: true },
      ],
    },
    {
      name: 'dagName',
      type: 'input',
      message: "What's the name of your DAG? ([a-z0-9-])",
      default: 'job',
      when: ({ addons }) => addons.includes('airflow'),
      validate: dagName => {
        if (!dagName) return 'Please provide a DAG name';
        if (!/^[a-z0-9-]+$/.test(dagName)) return 'Only use [a-z0-9-] for your DAG name';
        return true;
      },
    },
    {
      name: 'dagDescription',
      type: 'input',
      message: 'Please provide one line describing your DAG:',
      default: 'To make the world a better place',
      filter,
      when: ({ addons }) => addons.includes('airflow'),
      validate: dagDescription => !!dagDescription || 'Please provide a DAG description',
    },
    {
      name: 'dagInterval',
      type: 'list',
      message: 'How often should this DAG run? (you can change this later)',
      default: 3,
      when: ({ addons }) => addons.includes('airflow'),
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
