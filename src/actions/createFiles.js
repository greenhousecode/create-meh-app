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
  CI_COMMANDS,
} = require('../config.json');

const templateDir = join(__dirname, '../templates/default');
const airflowTemplateDir = join(__dirname, '../templates/airflow');
const sentryTemplateDir = join(__dirname, '../templates/sentry');

const updateProductionDeployment = answers => {
  const scriptCopy = STAGES_DEPLOY_SCRIPTS.prod.slice();

  const padding = command => `\n    - ${command}`;

  let sentryScript = '';
  if (answers.sentry) {
    const { sentrySlug } = answers;

    sentryScript = padding(CI_COMMANDS.sentry.replace('{{sentrySlug}}', sentrySlug));
  }

  return scriptCopy.replace('{{sentryScript}}', sentryScript);
};

const prefillProdEnv = answers => [answers.sentry ? `SENTRY_DSN=${answers.sentryDSN}` : undefined];

// eslint-disable-next-line no-unused-vars
const prefillAccEnv = answers => [];

// eslint-disable-next-line no-unused-vars
const prefillTestEnv = answers => [];

const prefillStagedEnv = (stage, answers) => {
  let secrets = [];
  switch (stage) {
    case 'prod':
      secrets = prefillProdEnv(answers);
      break;
    case 'acc':
      secrets = prefillAccEnv(answers);
      break;
    case 'test':
      secrets = prefillTestEnv(answers);
      break;
    default:
      return '';
  }
  return secrets.filter(val => !!val).join('\n');
};

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
    deployProduction: updateProductionDeployment(answers),
    deployDags: answers.airflow ? STAGES_DEPLOY_SCRIPTS.dags : '',
    dagStartScript: answers.airflow
      ? `start:${answers.dagName}": "echo 'No start:${answers.dagName} specified' && exit 0",\n    "`
      : '',
    airflowDoc: answers.airflow
      ? '## Airflow DAG(s)\n\nAny DAG(s) present in `/dags` will be automatically deployed to Airflow by CI/CD, when pushing to `master`.\n\n'
      : '',
    gitlabNamespace: GITLAB_NAMESPACES[answers.namespace].name,
    gitlabNamespaceId: GITLAB_NAMESPACES[answers.namespace].id,
    clusterVariableKey: GITLAB_NAMESPACES[answers.namespace].clusterVariableKey,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };

  const overrideContents = (transformFileName = undefined) => file => ({
    ...file,
    fileName: transformFileName ? transformFileName(file.fileName) : file.fileName,
    fileContents: file.fileContents.replace(/{{([^}]+)}}/g, (_, match) => data[match] || ''),
  });

  // Copy over template files and replace macros
  copyTemplates(
    templateDir,
    answers.cwd,
    overrideContents(fileName => fileName.replace(/^_/, '.')),
  );

  // Optionally copy over Sentry template and replace macros
  if (answers.sentry) {
    copyTemplates(sentryTemplateDir, answers.cwd, overrideContents());
  }

  // Optionally copy over DAG template and replace macros
  if (answers.airflow) {
    copyTemplates(airflowTemplateDir, answers.cwd, overrideContents(() => `${answers.dagName}.py`));
  }

  // Create .env.prod, and optionally .env.acc and .env.test
  answers.stages.forEach(stage =>
    writeFileSync(join(answers.cwd, `.env.${stage}`), prefillStagedEnv(stage, answers)),
  );

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Created files'));
};
