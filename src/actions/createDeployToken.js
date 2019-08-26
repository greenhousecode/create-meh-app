// const { spawn } = require('child_process');
// const { Gitlab } = require('gitlab');
const { ui } = require('inquirer');
const chalk = require('chalk');

module.exports = async (/* { token, slugName }, project */) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Creating deploy token…'));

  try {
    // TODO: create deploy token, and get username/password
    // const gitlab = new Gitlab({ token });

    // await new Promise((resolve, reject) => {
    //   const job = spawn('kubectl', [
    //     'create',
    //     'secret',
    //     'docker-registry',
    //     `${slugName}-gitlab-deploy-token`,
    //     '--docker-server=registry.gitlab.com',
    //     `--docker-username="${username}"`,
    //     `--docker-password="${password}"`,
    //   ]);

    //   job.on('close', code => (code === 0 ? resolve() : reject()));
    // });

    bar.updateBottomBar('');
    console.log(chalk.green('✔ Created deploy token'));
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red('✘ Creating deploy token failed'));
    process.exit(1);
  }
};
