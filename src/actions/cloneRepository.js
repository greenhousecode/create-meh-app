const { ui } = require('inquirer');
const chalk = require('chalk');
const { join } = require('path');
const spawnPromise = require('../utils/spawnPromise');

module.exports = async (
  { token, slugName, protocol },
  { ssh_url_to_repo: sshUrl, https_url_to_repo: httpsUrl },
) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Cloning repository…'));

  const repoUrl =
    protocol === 'SSH' ? sshUrl : httpsUrl.replace('https://', `https://gitlab-ci-token:${token}@`);

  try {
    await spawnPromise('git', ['clone', repoUrl]);
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red('✘ Cloning failed'));
    process.exit(1);
  }

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Cloned repository'));
  return join(process.cwd(), slugName);
};
