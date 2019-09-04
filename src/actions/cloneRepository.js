const git = require('simple-git/promise');
const { ui } = require('inquirer');
const chalk = require('chalk');

module.exports = async (
  { token, protocol },
  { ssh_url_to_repo: sshUrl, http_url_to_repo: httpsUrl },
) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Cloning repository…'));

  const repoUrl =
    protocol === 'SSH' ? sshUrl : httpsUrl.replace('https://', `https://gitlab-ci-token:${token}@`);

  try {
    await git().clone(repoUrl);
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red('✘ Cloning failed'));
    process.exit(1);
  }

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Cloned repository'));
};
