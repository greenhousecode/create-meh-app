const { Gitlab } = require('@gitbeaker/node');
const { ui } = require('inquirer');
const chalk = require('chalk');
const { GITLAB_NAMESPACES } = require('../config.json');

module.exports = async ({ namespace, token, appName, description }) => {
  console.log(chalk.gray('\nInstalling…'));

  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Creating GitLab project…'));

  try {
    const gitlab = new Gitlab({ token });
    const project = await gitlab.Projects.create({
      namespace_id: GITLAB_NAMESPACES[namespace].id,
      name: appName,
      description,
    });

    bar.updateBottomBar('');
    console.log(chalk.green('✔ Created GitLab project'));
    return project;
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red('✘ Creating GitLab project failed'));
    throw err;
  }
};
