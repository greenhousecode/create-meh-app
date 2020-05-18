/* eslint-disable no-console */
const { existsSync, writeFileSync, mkdtempSync } = require('fs');
const { spawn } = require('child_process');
const { get } = require('https');
const { join } = require('path');
const { tmpdir } = require('os');

const { name: appName } = require('../package.json');

const { GITLAB_PERSONAL_ACCESS_TOKEN } = process.env;
const tmpDir = mkdtempSync(join(tmpdir(), 'meh-app-'));
const clusterConfigPath = join(tmpDir, 'clusterConfig.yml');

if (!GITLAB_PERSONAL_ACCESS_TOKEN) {
  console.error('Please provide a GITLAB_PERSONAL_ACCESS_TOKEN environment variable');
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

(async () => {
  const clusterConfig = await getClusterConfig();
  writeFileSync(clusterConfigPath, Buffer.from(clusterConfig, 'base64').toString('utf8'));

  // Create .env.<stage> files
  await Promise.all(
    Object.keys(secrets).map(async (stage) => {
      try {
        const result = await spawnPromise(
          'kubectl',
          ['get', 'secret', secrets[stage], '-o', 'json'],
          { env: { ...process.env, KUBECONFIG: clusterConfigPath } },
        );

        const { data } = JSON.parse(result);
        const envFile = join(__dirname, `../.env.${stage}`);

        if (!existsSync(envFile) || process.argv.includes('--force')) {
          writeFileSync(
            envFile,
            Object.keys(data).reduce((acc, key) => {
              const value = Buffer.from(data[key], 'base64').toString('utf8');
              const line = `${key}=${/\n|\s/.test(value) ? `"${value}"` : value}\n`;

              return acc + line;
            }, ''),
          );

          console.log(`.env.${stage} created.`);
        } else {
          console.log(`.env.${stage} already exists, add the --force flag to overwrite.`);
        }
      } catch (err) {} // eslint-disable-line no-empty
    }),
  );

  process.exit(0);
})();
