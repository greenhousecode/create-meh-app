const boxen = require('boxen');
const chalk = require('chalk');
const clear = require('clear');
const installDependencies = require('./actions/installDependencies');
const createDirectory = require('./actions/createDirectory');
const cloneRepository = require('./actions/cloneRepository');
const createProject = require('./actions/createProject');
const askQuestions = require('./actions/askQuestions');
const copyFiles = require('./actions/copyFiles');
const { version } = require('../package.json');

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

  try {
    const answers = await askQuestions();
    const project = await createProject(answers);
    const cwd = createDirectory(answers);
    await cloneRepository(answers, project, cwd);
    copyFiles(answers, cwd);
    await installDependencies(answers, cwd);
  } catch (err) {
    console.log(chalk.red(`\nSomething went wrong (${err.message})…`));
    console.log(err.description || err);
    process.exit(1);
  }

  console.log(chalk.bold.green('\nAll finished!'));
})();
