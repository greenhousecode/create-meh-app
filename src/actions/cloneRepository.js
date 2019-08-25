const { spawn } = require('child_process');
const { ui } = require('inquirer');
const chalk = require('chalk');

module.exports = ({ token }, { ssh_url_to_repo: repoUrl }, cwd) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Cloning repository…'));

  const authenticatedRepoUrl = repoUrl.replace('git@', `gitlab-ci-token:${token}@`);
  const cloning = spawn('git', ['clone', authenticatedRepoUrl], { cwd });

  return new Promise(resolve => {
    cloning.on('close', code => {
      bar.updateBottomBar('');

      if (code === 0) {
        console.error(chalk.red('✘ Cloning failed'));
        process.exit(1);
      }

      console.log(chalk.green('✔ Cloned repository'));
      resolve();
    });
  });
};
