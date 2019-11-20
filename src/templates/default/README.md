# {{name}}

> {{description}}

## Install

```shell
yarn
```

{{airflowDoc}}## Environment variables

| Env | Key | Description |
| --- | --- | ----------- |{{sentryDoc}}{{redisDoc}}{{mongodbDoc}}{{gitlabDoc}}

### Publish `.env.*` files as secrets

```shell
yarn upload-env
```

Add the `--restart` flag to restart any web pods afterwards (to pick up your new secrets).

### Create and prefill `.env.*` files with remote secret values

```shell
yarn download-env
```

Add the `--overwrite` flag to overwrite any pre-existing `.env.<stage>` files.
