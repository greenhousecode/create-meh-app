const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { ui } = require('inquirer');
const { join } = require('path');
const chalk = require('chalk');

module.exports = (answers, cwd) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Copying files…'));

  const { name, email, clusterConfig } = answers.gitlabData;

  const data = {
    ...answers,
    airbnb: answers.react ? 'airbnb' : 'airbnb-base',
    author: `${name} <${email}>`,
  };

  // Create .env, CLUSTER_CONFIG is used for applying secrets through kubectl
  writeFileSync(join(cwd, '.env'), `CLUSTER_CONFIG=${clusterConfig}\n`);

  // Optionally create .env-test, .env-acc
  answers.stages.forEach(stage => writeFileSync(join(cwd, `.env-${stage}`), ''));

  // Copy over template files and replace macros
  readdirSync('../templates').forEach(filePath => {
    const fileContents = readFileSync(filePath, 'utf8').replace(
      /{{([^}]+)}}/g,
      (_, match) => data[match],
    );

    writeFileSync(join(cwd, filePath.replace(/^_/, '.')), fileContents);
  });

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Copied files'));
};
