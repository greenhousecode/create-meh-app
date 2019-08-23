const { Gitlab } = require('gitlab');
const inquirer = require('inquirer');

const GITLAB_MEH_GROUP_ID = 4495257;
let gitlab;

const filter = input => input.trim().replace(/\s+/g, ' ');

(async () => {
  const answers = await inquirer.prompt([
    {
      mask: '*',
      type: 'password',
      name: 'gitlabPersonalAccessToken',
      message: 'Please provide your GitLab personal access token:',
      filter,
      async validate(token) {
        try {
          if (!token.trim()) {
            throw new Error('Please provide a token');
          }

          gitlab = new Gitlab({ token });

          const projects = await gitlab.GroupProjects.all(GITLAB_MEH_GROUP_ID, {
            maxPages: 1,
            perPage: 1,
          });

          if (projects.length !== 1) {
            throw new Error(`You don't have access to the "MEH" group in GitLab`);
          }

          return true;
        } catch ({ message }) {
          return `There was an issue with your token: ${message}`;
        }
      },
    },
    {
      name: 'name',
      type: 'input',
      message: `What's the name of your app?`,
      default: 'My App',
      filter,
    },
    {
      type: 'input',
      name: 'slugName',
      message: `What's the slug name for your app?`,
      default: ({ name }) => name.toLowerCase().replace(/\s+/g, '-'),
      filter,
      validate: slugName =>
        /^[0-9a-z]+(-[0-9a-z]+)*$/.test(slugName) || 'Please only use kebab-case',
    },
    {
      type: 'input',
      name: 'description',
      message: 'Please provide a one-liner describing your app:',
      default: 'To make the world a better place.',
      filter,
    },
  ]);

  console.log('answers', answers);
})();
