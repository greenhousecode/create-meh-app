const boxen = require('boxen');
const chalk = require('chalk');
const clear = require('clear');
const createDirectory = require('./actions/createDirectory');
const cloneRepository = require('./actions/cloneRepository');
const createProject = require('./actions/createProject');
const askQuestions = require('./actions/askQuestions');
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
  const cwd = createDirectory(answers);
  await cloneRepository(project, cwd);
  // copyFiles(answers, direcory); // & rewriteFiles(answers, direcory);
  // installDependencies(answers, direcory);
})();
