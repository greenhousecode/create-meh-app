const { spawn } = require('child_process');
const { ui } = require('inquirer');
const chalk = require('chalk');

module.exports = (
  { protocol, token },
  { ssh_url_to_repo: sshUrl, https_url_to_repo: httpsUrl },
  cwd,
) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Cloning repository…'));

  const repoUrl =
    protocol === 'SSH' ? sshUrl : httpsUrl.replace('https://', `https://gitlab-ci-token:${token}@`);

  return new Promise(resolve => {
    const job = spawn('git', ['clone', repoUrl], { cwd });

    job.on('close', code => {
      bar.updateBottomBar('');

      if (code !== 0) {
        console.log(chalk.red('✘ Cloning failed'));
        process.exit(1);
      }

      console.log(chalk.green('✔ Cloned repository'));
      resolve();
    });
  });
};
