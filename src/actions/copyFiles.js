const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { ui } = require('inquirer');
const { join } = require('path');
const chalk = require('chalk');

const templateDir = join(__dirname, '../templates');

const testStage = `test_deploy:
  <<: *deploy_config
  when: on_success
  script:
  - source init-kubectl.sh
  - echo 1 > REPLICAS && echo '-test' > STAGE
  - sh ./scripts/replace_values_yaml.sh values.template.yml
  - helm upgrade --install "$CI_PROJECT_NAME-test" ./chart/
  environment:
    name: test
  except:
    refs:
      - master\n\n`;

const accStage = `acceptance_deploy:
  <<: *deploy_config
  when: on_success
  script:
  - source init-kubectl.sh
  - echo 1 > REPLICAS && echo '-acc' > STAGE
  - sh ./scripts/replace_values_yaml.sh values.template.yml
  - helm upgrade --install "$CI_PROJEC_NAME-acc" ./chart/
  environment:
    name: acceptance
  only:
    refs:
    - develop\n\n`;

const lintScripts = {
  None: 'eslint --ignore-path .gitignore .',
  React: 'eslint --ext .js,.jsx --ignore-path .gitignore .',
  Vue: 'eslint --ext .js,.vue --ignore-path .gitignore .',
};

const eslintExtends = {
  None: '["airbnb-base", "plugin:prettier/recommended"]',
  React: '["airbnb", "plugin:prettier/recommended"]',
  Vue: '["plugin:vue/recommended", "airbnb-base", "prettier/vue", "plugin:prettier/recommended"]',
};

module.exports = (answers, cwd) => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Copying files…'));

  const { name, email, clusterConfig } = answers.gitlabData;

  const data = {
    ...answers,
    author: `${name} <${email}>`,
    lintScript: lintScripts[answers.framework],
    eslintExtends: eslintExtends[answers.framework],
    accStage: answers.stages.includes('acc') ? accStage : '',
    testStage: answers.stages.includes('test') ? testStage : '',
  };

  // Create .env, CLUSTER_CONFIG is used for applying secrets through kubectl
  writeFileSync(join(cwd, '.env'), `CLUSTER_CONFIG=${clusterConfig}\n`);

  // Optionally create .env-test, .env-acc
  answers.stages.forEach(stage => writeFileSync(join(cwd, `.env-${stage}`), ''));

  // Copy over template files and replace macros
  readdirSync(templateDir).forEach(fileName => {
    const filePath = join(templateDir, fileName);

    const fileContents = readFileSync(filePath, 'utf8').replace(
      /{{([^}]+)}}/g,
      (_, match) => data[match],
    );

    writeFileSync(join(cwd, fileName.replace(/^_/, '.')), fileContents);
  });

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Copied files'));
};
