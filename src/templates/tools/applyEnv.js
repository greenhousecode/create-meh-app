/* eslint-disable import/no-extraneous-dependencies */
const { file } = require('tempy');
const { parse } = require('dotenv');
const { Gitlab } = require('gitlab');
const getBranch = require('git-branch');
const { spawn } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');

const getStageByBranch = branch => {
  switch (branch) {
    case 'master':
      return 'prod';

    case 'develop':
      return 'acc';

    default:
      return 'test';
  }
};

const getSecretsTemplate = stage => `apiVersion: v1
kind: Secret
metadata:
  name: {{slugName}}${stage !== 'prod' ? `-${stage}` : ''}-secret-env
  namespace: bmidevelopment
type: Opaque
data: {}
`;

(async () => {
  const branch = await getBranch();
  const stage = getStageByBranch(branch);
  const clusterConfigPath = file({ extension: 'yml' });
  const secretsPath = file({ extension: 'yml' });
  let secretsContents = getSecretsTemplate(stage);

  const gitlab = new Gitlab({
    token: parse(readFileSync(`${__dirname}/../.env`)).GITLAB_PERSONAL_ACCESS_TOKEN,
  });

  const { value: clusterConfig } = await gitlab.GroupVariables.show(
    4495257,
    'MEH_K8S_CLUSTER_CONFIG',
  );

  try {
    const env = parse(readFileSync(`${__dirname}/../.env.${stage}`));

    if (Object.keys(env).length) {
      secretsContents = secretsContents.replace(
        'data: {}',
        Object.keys(env).reduce(
          (acc, key) => `${acc}\n  ${key}: ${Buffer.from(env[key]).toString('base64')}`,
          'data:',
        ),
      );
    }
  } catch (err) {} // eslint-disable-line no-empty

  writeFileSync(clusterConfigPath, Buffer.from(clusterConfig, 'base64').toString('utf-8'));
  writeFileSync(secretsPath, secretsContents);

  const job = spawn(`kubectl`, ['apply', '-f', secretsPath], {
    env: { ...process.env, KUBECONFIG: clusterConfigPath },
  });

  job.on('close', code => process.exit(code));
})();
