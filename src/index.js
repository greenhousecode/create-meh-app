#!/usr/bin/env node
const { existsSync } = require('fs');
const app = require('commander');
const boxen = require('boxen');
const chalk = require('chalk');
const clear = require('clear');
require('promise.allsettled').shim();

const installDependencies = require('./actions/installDependencies');
const createDevelopBranch = require('./actions/createDevelopBranch');
const cloneRepository = require('./actions/cloneRepository');
const { version, description } = require('../package.json');
const createProject = require('./actions/createProject');
const lintAndFormat = require('./actions/lintAndFormat');
const initialCommit = require('./actions/initialCommit');
const deleteProject = require('./actions/deleteProject');
const askQuestions = require('./actions/askQuestions');
const pushBranches = require('./actions/pushBranches');
const deleteFolder = require('./actions/deleteFolder');
const createFiles = require('./actions/createFiles');

let input;

app
  .name('yarn create meh-app')
  .version(version)
  .description(description)
  .usage('<app-name>')
  .arguments('<app-name>')
  .action((appName) => {
    input = appName;
  })
  .parse(process.argv);

// App name validation
if (!input) {
  console.log(
    chalk.red(
      `Please supply an ${chalk.bold('app name')}: "yarn create meh-app ${chalk.bold('my-app')}"`,
    ),
  );

  process.exit(1);
} else if (!/^\/?([\w-]+\/)*[0-9a-z]+(-[0-9a-z]+)*$/.test(input)) {
  console.log(
    chalk.red(
      `For your ${chalk.bold(
        'app name',
      )}, please only use kebab-case: "yarn create meh-app ${chalk.bold('my-app')}"`,
    ),
  );

  process.exit(1);
} else if (existsSync(input)) {
  console.log(chalk.red(`The directory "${input}" already exists`));
  process.exit(1);
}

clear();

console.log(
  boxen(`${chalk.bold('CREATE MEH APP')} ${chalk.gray(`v${version}`)}`, {
    borderColor: 'cyan',
    float: 'center',
    padding: 1,
    margin: 1,
  }),
);

(async () => {
  let answers;
  let project;

  try {
    answers = await askQuestions(input);
    project = await createProject(answers);
    await cloneRepository(answers, project);
    await createFiles(answers);
    await installDependencies(answers);
    await lintAndFormat(answers);
    await initialCommit(answers);
    await createDevelopBranch(answers);
    await pushBranches(answers);
    console.log(chalk.bold.green('\nAll finished!'));
    process.exit(0);
  } catch (err) {
    console.log(chalk.red(`\nSomething went wrong${err ? ` (${err.message}):` : ''}`));
    if (err) console.log(err.description || err);
    await Promise.allSettled([deleteProject(answers, project), deleteFolder(answers)]);
    process.exit(1);
  }
})();
