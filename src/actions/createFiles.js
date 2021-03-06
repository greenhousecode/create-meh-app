const { writeFileSync } = require('fs');
const { ui } = require('inquirer');
const { join } = require('path');
const chalk = require('chalk');
const yaml = require('yaml');

const copyTemplates = require('../utils/copyTemplates');

const {
  GITLAB_NAMESPACES,
  LINT_STAGED_GLOBS,
  ESLINT_EXTENDS,
  DOCUMENTATION,
  LINT_SCRIPTS,
} = require('../config.json');

const templateDir = join(__dirname, '../templates/default');
const airflowTemplateDir = join(__dirname, '../templates/airflow');

module.exports = (answers) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Creating files…'));

  const now = new Date();
  const { name, email } = answers.gitlabData;
  const variant = answers.framework;
  const isWeb = answers.projectType === 'web';
  const gitlabCi = { include: [], variables: {} };
  const defaultInclude = { project: 'GreenhouseGroup/meh/pipeline-configurations', ref: 'master' };

  if (isWeb) {
    if (answers.addons.includes('airflow'))
      gitlabCi.include.push({
        ...defaultInclude,
        file: '/templates/deployment-dag.yaml',
      });

    gitlabCi.include.push({
      ...defaultInclude,
      file: '/defaults/default-node-webapp-gitlab-ci.yaml',
    });
  } else {
    gitlabCi.include.push({
      ...defaultInclude,
      file: '/defaults/default-dag-gitlab-ci.yaml',
    });
  }

  const { addons } = answers;
  const availableServices = ['athena', 's3', 'ses'];
  const availableServiceAccounts = [
    'apps-meh-athena',
    'apps-meh-s3',
    'apps-meh-s3-ses',
    'apps-meh-s3-ses-athena',
    'apps-meh-ses',
  ];

  // Exception: CloudFront access is provided by the S3 service account
  if (addons.includes('cloudfront')) addons[addons.indexOf('cloudfront')] = 's3';

  const serviceAccount = availableServiceAccounts.find((sa) =>
    availableServices
      .filter((service) => addons.includes(service))
      .reduce((acc, chosenService) => (!acc ? acc : sa.includes(chosenService)), true),
  );

  if (!answers.stages.includes('test')) gitlabCi.variables.CREATE_TEST_ENV = 'false';
  if (answers.stages.includes('acc')) gitlabCi.variables.CREATE_ACCEPTANCE_ENV = 'true';
  if (answers.addons.includes('airflow')) gitlabCi.variables.DAG_FOLDER = 'airflow';

  const data = {
    ...answers,
    isWeb: `${isWeb}`,
    author: `${name} <${email}>`,
    lintScript: LINT_SCRIPTS[variant],
    eslintExtends: ESLINT_EXTENDS[variant],
    lintStagedGlob: LINT_STAGED_GLOBS[variant],
    gitlabCi: `\n${yaml.stringify(gitlabCi)}`,
    dagStartScript: answers.addons.includes('airflow')
      ? `start:${answers.dagName}": "echo 'No start:${answers.dagName} specified' && exit 0",\n    "`
      : '',
    airflowDoc: answers.addons.includes('airflow') ? DOCUMENTATION.airflow : '',
    redisDoc: answers.addons.includes('redis') ? DOCUMENTATION.redis : '',
    mongodbDoc: answers.addons.includes('mongodb') ? DOCUMENTATION.mongodb : '',
    gitlabNamespace: GITLAB_NAMESPACES[answers.namespace].name,
    gitlabNamespaceId: GITLAB_NAMESPACES[answers.namespace].id,
    clusterVariableKey: GITLAB_NAMESPACES[answers.namespace].clusterVariableKey,
    redis: `${answers.addons.includes('redis')}`,
    mongodb: `${answers.addons.includes('mongodb')}`,
    uptimeRobot: answers.addons.includes('uptimeRobot') ? '' : '\n  pingdom: false',
    serviceAccount: serviceAccount ? `\nserviceAccountName: ${serviceAccount}` : '',
    serviceAccountDag: serviceAccount ? `'${serviceAccount}'` : 'None',
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };

  const overrideContents =
    (transformFileName = undefined) =>
    (file) => ({
      ...file,
      fileName: transformFileName ? transformFileName(file.fileName) : file.fileName,
      fileContents: file.fileContents.replace(/{{([^}]+)}}/g, (_, match) => data[match] || ''),
    });

  // Copy over template files and replace macros
  copyTemplates(
    templateDir,
    answers.cwd,
    overrideContents((fileName) => fileName.replace(/^_/, '.')),
  );

  // Optionally copy over DAG template and replace macros
  if (answers.addons.includes('airflow')) {
    copyTemplates(
      airflowTemplateDir,
      answers.cwd,
      overrideContents(() => `${answers.dagName}.py`),
    );
  }

  // Create .env.prod, and optionally .env.acc and .env.test
  answers.stages.forEach((stage) => writeFileSync(join(answers.cwd, `.env.${stage}`), ''));

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Created files'));
};
