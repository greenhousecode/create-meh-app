/* eslint-disable no-console */
const { readFileSync, writeFileSync, mkdtempSync } = require('fs');
const { spawn } = require('child_process');
const { get } = require('https');
const { join } = require('path');
const { tmpdir } = require('os');

const { name: appName } = require('../package.json');

const { GITLAB_PERSONAL_ACCESS_TOKEN } = process.env;
const tmpDir = mkdtempSync(join(tmpdir(), 'meh-app-'));
const clusterConfigPath = join(tmpDir, 'clusterConfig.yml');

if (!GITLAB_PERSONAL_ACCESS_TOKEN) {
  console.log('Please provide a GITLAB_PERSONAL_ACCESS_TOKEN environment variable');
  process.exit(1);
}

const secrets = {
  test: `${appName}-test-secret-env`,
  acc: `${appName}-acc-secret-env`,
  prod: `${appName}-secret-env`,
};

const getClusterConfig = () =>
  new Promise((resolve, reject) => {
    get(
      'https://gitlab.com/api/v4/groups/{{gitlabNamespaceId}}/variables/{{clusterVariableKey}}',
      { headers: { 'private-token': GITLAB_PERSONAL_ACCESS_TOKEN } },
      (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', async () => {
          const { value: clusterConfig } = JSON.parse(body);
          resolve(clusterConfig);
        });
      },
    ).on('error', reject);
  });

const spawnPromise = (...args) =>
  new Promise((resolve, reject) => {
    const job = spawn(...args);
    let result = '';

    job.stdout.on('data', (data) => {
      result += data.toString();
    });

    job.on('close', (code) => (code === 0 ? resolve(result) : reject(code)));
  });

const parseEnv = (filePath) =>
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

const getSecretsTemplate = (stage) => `apiVersion: v1
kind: Secret
metadata:
  name: ${secrets[stage]}
  namespace: bmidevelopment
type: Opaque
data: {}
`;

(async () => {
  const clusterConfig = await getClusterConfig();
  writeFileSync(clusterConfigPath, Buffer.from(clusterConfig, 'base64').toString('utf8'));

  await Promise.all(
    Object.keys(secrets).map(async (stage) => {
      try {
        let secretsContents = getSecretsTemplate(stage);
        const env = parseEnv(join(__dirname, `../.env.${stage}`));
        const secretsPath = join(tmpDir, `secrets-${stage}.yml`);

        if (Object.keys(env).length) {
          secretsContents = secretsContents.replace(
            'data: {}',
            Object.keys(env).reduce(
              (acc, key) => `${acc}\n  ${key}: ${Buffer.from(env[key]).toString('base64')}`,
              'data:',
            ),
          );
        }

        writeFileSync(secretsPath, secretsContents);

        // Apply new secrets
        await spawnPromise('kubectl', ['apply', '-f', secretsPath], {
          env: { ...process.env, KUBECONFIG: clusterConfigPath },
        });

        console.log(`Environment secrets from .env.${stage} were applied successfully.`);

        // eslint-disable-next-line no-self-compare
        if (process.argv.includes('--force') && '{{projectType}}' === 'web') {
          // Restart web pods to pick up new secrets
          await spawnPromise(
            'kubectl',
            ['delete', 'pods', '-l', `app=${appName}${stage !== 'prod' ? `-${stage}` : ''}-web`],
            { env: { ...process.env, KUBECONFIG: clusterConfigPath } },
          );

          console.log(`"${stage}" web pods have been restarted.`);
        }
      } catch (err) {} // eslint-disable-line no-empty
    }),
  );

  process.exit(0);
})();
