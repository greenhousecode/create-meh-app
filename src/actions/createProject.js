const { Gitlab } = require('gitlab');
const { ui } = require('inquirer');
const chalk = require('chalk');
const { GITLAB_MEH_NAMESPACE_ID } = require('../config.json');

module.exports = async ({ token, slugName, description }) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Creating GitLab project…'));

  try {
    const gitlab = new Gitlab({ token });
    const project = await gitlab.Projects.create({
      namespace_id: GITLAB_MEH_NAMESPACE_ID,
      name: slugName,
      description,
    });

    bar.updateBottomBar('');
    console.log(chalk.green('✔ Created GitLab project'));
    return project;
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red(`✘ Creating GitLab project failed (${err.message}):`));
    console.log(err.description);
    process.exit(1);
  }

  return null;
};
