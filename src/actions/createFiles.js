const { writeFileSync } = require('fs');
const { ui } = require('inquirer');
const { join } = require('path');
const chalk = require('chalk');
const copyTemplates = require('../utils/copyTemplates');
const {
  STAGES_DEPLOY_SCRIPTS,
  GITLAB_NAMESPACES,
  LINT_STAGED_GLOBS,
  ESLINT_EXTENDS,
  LINT_SCRIPTS,
} = require('../config.json');

const templateDir = join(__dirname, '../templates');
const optionalTemplateDir = join(__dirname, '../optionalTemplates');

module.exports = answers => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Creating files…'));

  const now = new Date();
  const { name, email } = answers.gitlabData;
  const variant = answers.typescript ? `${answers.framework}Typescript` : answers.framework;

  const data = {
    ...answers,
    author: `${name} <${email}>`,
    lintScript: LINT_SCRIPTS[variant],
    eslintParser: answers.typescript ? '"parser": "@typescript-eslint/parser",\n  ' : '',
    eslintExtends: ESLINT_EXTENDS[variant],
    lintStagedGlob: LINT_STAGED_GLOBS[variant],
    deployTesting: answers.stages.includes('test') ? STAGES_DEPLOY_SCRIPTS.test : '',
    deployAcceptance: answers.stages.includes('acc') ? STAGES_DEPLOY_SCRIPTS.acc : '',
    deployProduction: answers.stages.includes('prod') ? STAGES_DEPLOY_SCRIPTS.prod : '',
    deployDags: answers.dags ? STAGES_DEPLOY_SCRIPTS.dags : '',
    dagStartScript: answers.dags
      ? `start:${answers.dagName}": "echo 'No start:${answers.dagName} specified' && exit 0",\n    "`
      : '',
    airflowDoc: answers.dags
      ? '## Airflow DAG(s)\n\nAny DAG(s) present in `/dags` will be automatically deployed to Airflow by CI/CD, when pushing to `master`.\n\n'
      : '',
    gitlabNamespace: GITLAB_NAMESPACES[answers.namespace].name,
    gitlabNamespaceId: GITLAB_NAMESPACES[answers.namespace].id,
    clusterVariableKey: GITLAB_NAMESPACES[answers.namespace].clusterVariableKey,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };

  // Copy over template files and replace macros
  copyTemplates(templateDir, answers.cwd, file => ({
    ...file,
    fileName: file.fileName.replace(/^_/, '.'),
    fileContents: file.fileContents.replace(/{{([^}]+)}}/g, (_, match) => data[match] || ''),
  }));

  // Optionally copy over DAG template and replace macros
  if (answers.dags) {
    copyTemplates(join(optionalTemplateDir, 'dags'), answers.cwd, file => ({
      ...file,
      fileName: `${answers.dagName}.py`,
      fileContents: file.fileContents.replace(/{{([^}]+)}}/g, (_, match) => data[match] || ''),
    }));
  }

  // Create .env.prod, and optionally .env.acc and .env.test
  answers.stages.forEach(stage => writeFileSync(join(answers.cwd, `.env.${stage}`), ''));

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Created files'));
};
