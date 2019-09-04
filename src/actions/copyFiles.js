const { writeFileSync } = require('fs');
const { ui } = require('inquirer');
const { join } = require('path');
const chalk = require('chalk');
const copyTemplates = require('../utils/copyTemplates');
const { GITLAB_NAMESPACES } = require('../config.json');

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

const lintScriptsTypescript = {
  None: 'eslint --ext .js,.ts --ignore-path .gitignore .',
  React: 'eslint --ext .js,.ts,.jsx,.tsx --ignore-path .gitignore .',
  Vue: 'eslint --ext .js,.ts,.vue --ignore-path .gitignore .',
};

const eslintExtends = {
  None: '["airbnb-base", "plugin:prettier/recommended"]',
  React: '["airbnb", "plugin:prettier/recommended"]',
  Vue: '["plugin:vue/recommended", "airbnb-base", "prettier/vue", "plugin:prettier/recommended"]',
};

const eslintExtendsTypescript = {
  None: '["airbnb-typescript/base", "plugin:prettier/recommended"]',
  React: '["airbnb-typescript", "plugin:prettier/recommended"]',
  Vue:
    '["plugin:vue/recommended", "airbnb-typescript/base", "prettier/vue", "plugin:prettier/recommended"]',
};

const lintStagedGlobs = {
  None: '*.js',
  React: '*.{js,jsx}',
  Vue: '*.{js,vue}',
};

const lintStagedGlobsTypescript = {
  None: '*.{js,ts}',
  React: '*.{js,jsx,ts,tsx}',
  Vue: '*.{js,ts,vue}',
};

module.exports = answers => {
  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Copying files…'));

  const { name, email } = answers.gitlabData;

  const data = {
    ...answers,
    author: `${name} <${email}>`,
    lintScript: answers.typescript
      ? lintScriptsTypescript[answers.framework]
      : lintScripts[answers.framework],
    eslintExtends: answers.typescript
      ? eslintExtendsTypescript[answers.framework]
      : eslintExtends[answers.framework],
    lintStagedGlob: answers.typescript
      ? lintStagedGlobsTypescript[answers.framework]
      : lintStagedGlobs[answers.framework],
    accStage: answers.stages.includes('acc') ? accStage : '',
    testStage: answers.stages.includes('test') ? testStage : '',
    gitlabNamespaceId: GITLAB_NAMESPACES[answers.namespace].id,
    clusterVariableKey: GITLAB_NAMESPACES[answers.namespace].clusterVariableKey,
  };

  // Create .env
  writeFileSync(
    join(answers.cwd, '.env'),
    `# Used by \`yarn apply-env\` for applying secrets through kubectl\n` +
      `GITLAB_PERSONAL_ACCESS_TOKEN=${answers.token}\n`,
  );

  // Create .env.prod, and optionally .env.acc and .env.test
  answers.stages.forEach(stage => writeFileSync(join(answers.cwd, `.env.${stage}`), ''));

  // Copy over template files and replace macros
  copyTemplates(templateDir, answers.cwd, file => ({
    ...file,
    fileName: file.fileName.replace(/^_/, '.'),
    fileContents: file.fileContents.replace(/{{([^}]+)}}/g, (_, match) => data[match]),
  }));

  bar.updateBottomBar('');
  console.log(chalk.green('✔ Copied files'));
};
