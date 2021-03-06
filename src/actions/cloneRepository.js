const { existsSync, mkdirSync } = require('fs');
const git = require('simple-git/promise');
const { ui } = require('inquirer');
const { join } = require('path');
const chalk = require('chalk');

module.exports = async (
  { token, protocol, cwd },
  { ssh_url_to_repo: sshUrl, http_url_to_repo: httpsUrl },
) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Cloning repository…'));

  const repoUrl =
    protocol === 'SSH' ? sshUrl : httpsUrl.replace('https://', `https://gitlab-ci-token:${token}@`);

  const rootFolder = join(cwd, '..');

  if (!existsSync(rootFolder)) {
    mkdirSync(rootFolder, { recursive: true });
  }

  try {
    await git(rootFolder).clone(repoUrl);
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red('✘ Cloning failed'));
    throw err;
  }

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Cloned repository'));
};
