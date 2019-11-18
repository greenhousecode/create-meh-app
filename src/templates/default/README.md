# {{name}}

> {{description}}

## Install

```shell
GITLAB_PERSONAL_ACCESS_TOKEN=<token> yarn
```

{{airflowDoc}}## Environment variables

| Env | Key | Description |
| --- | --- | ----------- |{{sentryDoc}}{{redisDoc}}{{mongodbDoc}}{{gitlabDoc}}

### Publish `.env.*` files as secrets

```shell
yarn upload-env
```

### Create and prefill `.env.*` files with remote secret values

```shell
yarn download-env
```
