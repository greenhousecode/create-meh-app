# {{name}}

> {{description}}

## Install

```shell
GITLAB_PERSONAL_ACCESS_TOKEN=<token> yarn
```

{{airflowDoc}}## Environment variables

| Env | Key | Description |
| --- | --- | ----------- |{{sentryDoc}}{{redisDoc}}{{mongodbDoc}}{{gitlabDoc}}

### Publish `.env.*` files

If any of the following files exist, they will be deployed as secrets automatically, when pushing to the following branches:

- `master`: `/.env.prod`
- `develop`: `/.env.acc`
- (other): `/.env.test`

### Create and prefill `.env.*` files with pre-existing secrets

```shell
yarn prefill-env
```
