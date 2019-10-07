/* eslint-disable no-console */
const { readFileSync, writeFileSync, mkdtempSync } = require('fs');
const { spawn } = require('child_process');
const { get } = require('https');
const { join } = require('path');
const { tmpdir } = require('os');

const spawnPromise = (...args) =>
  new Promise((resolve, reject) => {
    const job = spawn(...args);
    job.on('close', code => (code === 0 ? resolve() : reject()));
  });

const parseEnv = filePath =>
  readFileSync(filePath, 'utf8')
    .split(/\n/)
    .reduce(
      (acc, line) => {
        const matches = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

        if (matches) {
          const [, key, value = ''] = matches;

          if (/^'.*(?<!\\)'$|^".*(?<!\\)"$/.test(value)) {
            // Quoted single line value
            acc.env[key] = value.replace(/^['"]|['"]$/g, '');
          } else if (!acc.multilineKey && /^['"]/.test(value)) {
            // Quoted multiline value
            acc.multilineKey = key;
            [acc.delimiter] = value;
            acc.env[key] = value.replace(/^['"]/, '');
          } else {
            // Single line value
            acc.env[key] = value.trim();
          }
        } else if (acc.multilineKey) {
          // End of quoted multiline value
          const match = new RegExp(`(?<!\\\\)${acc.delimiter}$`);
          acc.env[acc.multilineKey] += `\n${line.replace(match, '')}`;

          if (match.test(line)) {
            acc.multilineKey = null;
          }
        }

        return acc;
      },
      { env: {}, multilineKey: null, delimiter: null },
    ).env;

const getBranchName = () =>
  readFileSync(join(__dirname, '../.git/HEAD'), 'utf8').match(/ref: refs\/heads\/(.+)/)[1];

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
  const tmpDir = mkdtempSync(join(tmpdir(), 'meh-app-'));
  const clusterConfigPath = join(tmpDir, 'clusterConfig.yml');
  const secretsPath = join(tmpDir, 'secrets.yml');
  let secretsContents = getSecretsTemplate(stage);

  try {
    const env = parseEnv(join(__dirname, `../.env.${stage}`));

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

  get(
    'https://gitlab.com/api/v4/groups/{{gitlabNamespaceId}}/variables/{{clusterVariableKey}}',
    {
      headers: {
        'private-token':
          process.env.GITLAB_PERSONAL_ACCESS_TOKEN ||
          parseEnv(join(__dirname, '../.env')).GITLAB_PERSONAL_ACCESS_TOKEN,
      },
    },
    res => {
      let body = '';

      res.on('data', chunk => {
        body += chunk;
      });

      res.on('end', async () => {
        try {
          const { value: clusterConfig } = JSON.parse(body);

          writeFileSync(clusterConfigPath, Buffer.from(clusterConfig, 'base64').toString('utf8'));
          writeFileSync(secretsPath, secretsContents);

          await spawnPromise('kubectl', ['apply', '-f', secretsPath], {
            env: { ...process.env, KUBECONFIG: clusterConfigPath },
          });

          await spawnPromise(
            'kubectl',
            ['delete', 'pods', '-l', `app={{appName}}${stage !== 'prod' ? `-${stage}` : ''}-web`],
            { env: { ...process.env, KUBECONFIG: clusterConfigPath } },
          );

          console.log('Secrets were applied successfully');
          process.exit(0);
        } catch ({ message }) {
          console.log(message);
          process.exit(1);
        }
      });
    },
  );
})();
