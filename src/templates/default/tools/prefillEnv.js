const { existsSync, writeFileSync, mkdtempSync } = require('fs');
const { spawn } = require('child_process');
const { tmpdir } = require('os');
const { join } = require('path');
const { get } = require('https');

const token = process.env.GITLAB_PERSONAL_ACCESS_TOKEN;
const tmpDir = mkdtempSync(join(tmpdir(), 'meh-app-'));
const clusterConfigPath = join(tmpDir, 'clusterConfig.yml');
const secrets = {
  test: '{{appName}}-test-secret-env',
  acc: '{{appName}}-acc-secret-env',
  prod: '{{appName}}-secret-env',
};

if (!token) {
  process.exit(0);
}

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

      writeFileSync(clusterConfigPath, Buffer.from(clusterConfig, 'base64').toString('utf8'));

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
                    const line = `${key}=${/\n/.test(value) ? `"${value}"` : value}\n`;

                    return acc + line;
                  }, ''),
                );
              }
            })
            .catch(() => {}),
        ),
      );
    });
  },
);
