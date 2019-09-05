#!/usr/bin/env node
const boxen = require('boxen');
const chalk = require('chalk');
const clear = require('clear');
const app = require('commander');
const installDependencies = require('./actions/installDependencies');
const createDevelopBranch = require('./actions/createDevelopBranch');
const cloneRepository = require('./actions/cloneRepository');
const { version, description } = require('../package.json');
const createProject = require('./actions/createProject');
const initialCommit = require('./actions/initialCommit');
const askQuestions = require('./actions/askQuestions');
const pushBranches = require('./actions/pushBranches');
const copyFiles = require('./actions/copyFiles');

let slugName;

app
  .name('yarn create meh-app')
  .version(version)
  .description(description)
  .usage('<app-name>')
  .arguments('<app-name>')
  .action(appName => {
    slugName = appName;
  })
  .parse(process.argv);

// App name validation
if (!slugName) {
  console.log(
    chalk.red(
      `Please supply an ${chalk.bold('app name')}: "yarn create meh-app ${chalk.bold('my-app')}"`,
    ),
  );

  process.exit(1);
} else if (!/^[0-9a-z]+(-[0-9a-z]+)*$/.test(slugName)) {
  console.log(
    chalk.red(
      `For your ${chalk.bold(
        'app name',
      )}, please only use kebab-case: "yarn create meh-app ${chalk.bold('my-app')}"`,
    ),
  );

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
  try {
    const answers = await askQuestions(slugName);
    const project = await createProject(answers);
    await cloneRepository(answers, project);
    copyFiles(answers);
    await installDependencies(answers);
    await initialCommit(answers);
    await createDevelopBranch(answers);
    await pushBranches(answers);
    console.log(chalk.bold.green('\nAll finished!'));
    process.exit(0);
  } catch (err) {
    console.log(chalk.red(`\nSomething went wrong (${err.message}):`));
    console.log(err.description || err);
  }
})();
