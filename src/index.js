const boxen = require('boxen');
const chalk = require('chalk');
const clear = require('clear');
const installDependencies = require('./actions/installDependencies');
const createDeployToken = require('./actions/createDeployToken');
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

  const answers = await askQuestions();
  const project = await createProject(answers);
  await createDeployToken(/* answers, project */);
  const cwd = createDirectory(answers);
  await cloneRepository(answers, project, cwd);
  await copyFiles(cwd);
  await installDependencies(answers, cwd);

  console.log(chalk.bold.green('\nAll finished!'));
})();
