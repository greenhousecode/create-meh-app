/* eslint-disable import/no-unresolved, import/no-extraneous-dependencies */
const { file } = require('tempy');
const { Gitlab } = require('gitlab');
const { spawn } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');

const parseEnv = filePath =>
  readFileSync(filePath)
    .split(/\n/)
    .reduce(
      (acc, line) => {
        const matches = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

        if (matches) {
          const [, key, value = ''] = matches;

          if (/^['"].*['"]$/.test(value)) {
            acc.env[key] = value.replace(/^['"]|['"]$/g, '');
          } else if (!acc.multilineKey && /^['"]/.test(value)) {
            acc.multilineKey = key;
            acc.env[key] = value.replace(/^['"]/, '');
          } else {
            acc.env[key] = value.trim();
          }
        } else if (acc.multilineKey) {
          acc.env[acc.multilineKey] += `\n${line.replace(/['"]$/, '')}`;

          if (/['"]$/.test(line)) {
            acc.multilineKey = false;
          }
        }

        return acc;
      },
      { env: {}, multilineKey: false },
    ).env;

const getBranchName = () =>
  readFileSync(`${__dirname}/../.git/HEAD`, 'utf8').match(/ref: refs\/heads\/(.+)/)[1];

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
  name: {{appName}}${stage !== 'prod' ? `-${stage}` : ''}-secret-env
  namespace: bmidevelopment
type: Opaque
data: {}
`;

(async () => {
  const branch = getBranchName();
  const stage = getStageByBranch(branch);
  const clusterConfigPath = file({ extension: 'yml' });
  const secretsPath = file({ extension: 'yml' });
  let secretsContents = getSecretsTemplate(stage);

  const gitlab = new Gitlab({
    token: parseEnv(`${__dirname}/../.env`).GITLAB_PERSONAL_ACCESS_TOKEN,
  });

  const { value: clusterConfig } = await gitlab.GroupVariables.show(
    '{{gitlabNamespaceId}}',
    '{{clusterVariableKey}}',
  );

  try {
    const env = parseEnv(`${__dirname}/../.env.${stage}`);

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

  writeFileSync(clusterConfigPath, Buffer.from(clusterConfig, 'base64').toString('utf8'));
  writeFileSync(secretsPath, secretsContents);

  const job = spawn(`kubectl`, ['apply', '-f', secretsPath], {
    env: { ...process.env, KUBECONFIG: clusterConfigPath },
  });

  job.on('close', code => process.exit(code));
})();
