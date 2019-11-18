/* eslint-disable no-console */
const { existsSync, writeFileSync, mkdtempSync } = require('fs');
const { spawn } = require('child_process');
const { get } = require('https');
const { join } = require('path');
const { tmpdir } = require('os');

const token = process.env.GITLAB_PERSONAL_ACCESS_TOKEN;
const tmpDir = mkdtempSync(join(tmpdir(), 'meh-app-'));
const clusterConfigPath = join(tmpDir, 'clusterConfig.yml');

if (!token) {
  console.log('Please provide a GITLAB_PERSONAL_ACCESS_TOKEN environment variable');
  process.exit(1);
}

const secrets = {
  test: '{{appName}}-test-secret-env',
  acc: '{{appName}}-acc-secret-env',
  prod: '{{appName}}-secret-env',
};

const getClusterConfig = () =>
  new Promise((resolve, reject) => {
    get(
      'https://gitlab.com/api/v4/groups/{{gitlabNamespaceId}}/variables/{{clusterVariableKey}}',
      { headers: { 'private-token': token } },
      res => {
        let body = '';

        res.on('data', chunk => {
          body += chunk;
        });

        res.on('end', async () => {
          const { value: clusterConfig } = JSON.parse(body);
          resolve(clusterConfig);
        });
      },
    ).on('error', reject);
  });

(async () => {
  const clusterConfig = await getClusterConfig();
  writeFileSync(clusterConfigPath, Buffer.from(clusterConfig, 'base64').toString('utf8'));

  // Create .env.<stage>
  await Promise.all(
    Object.keys(secrets).map(stage =>
      new Promise((resolve, reject) => {
        const job = spawn('kubectl', ['get', 'secret', secrets[stage], '-o', 'json'], {
          env: { ...process.env, KUBECONFIG: clusterConfigPath },
        });

        let result = '';

        job.stdout.on('data', data => {
          result += data.toString();
        });

        job.on('close', code => (code === 0 ? resolve(result) : reject(code)));
      })
        .then(result => {
          const { data } = JSON.parse(result);
          const envFile = join(__dirname, `../.env.${stage}`);

          if (!existsSync(envFile)) {
            writeFileSync(
              envFile,
              Object.keys(data).reduce((acc, key) => {
                const value = Buffer.from(data[key], 'base64').toString('utf8');
                const line = `${key}=${/\n|\s/.test(value) ? `"${value}"` : value}\n`;

                return acc + line;
              }, ''),
            );

            console.log(`${envFile} created and prefilled.`);
          } else {
            console.log(`${envFile} already exists, not updating contents.`);
          }
        })
        // Allow for fails since not all stages are required
        .catch(() => {}),
    ),
  );

  process.exit(0);
})();
