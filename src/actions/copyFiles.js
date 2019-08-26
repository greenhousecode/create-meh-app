const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { Gitlab } = require('gitlab');
const { ui } = require('inquirer');
const { join } = require('path');
const chalk = require('chalk');

module.exports = async (answers, cwd) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Copying files…'));

  try {
    const gitlab = new Gitlab({ token: answers.token });
    const { name, email } = await gitlab.Users.current();

    const data = {
      ...answers,
      airbnb: answers.react ? 'airbnb' : 'airbnb-base',
      author: `${name} <${email}>`,
    };

    readdirSync('../templates').forEach(filePath => {
      const fileContents = readFileSync(filePath, 'utf8').replace(
        /{{([^}]+)}}/g,
        (_, match) => data[match],
      );

      writeFileSync(join(cwd, filePath.replace(/^_/, '.')), fileContents);
    });
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red('✘ Copying failed'));
    process.exit(1);
  }

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Copied files'));
};
