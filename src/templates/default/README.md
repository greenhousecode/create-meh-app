# {{name}}

> {{description}}

## Install

```shell
yarn
```

{{airflowDoc}}## Environment variables

| Env | Key | Description |
| --- | --- | ----------- |{{sentryDoc}}{{redisDoc}}{{mongodbDoc}}{{gitlabDoc}}

### Publish local `.env.*` files as remote secrets

```shell
yarn upload-env
```

Add the `--restart` flag to restart any web pods afterwards (to pick up your new secrets).

### Create local `.env.*` files from remote secrets

```shell
yarn download-env
```

Add the `--overwrite` flag to overwrite any pre-existing `.env.<stage>` files.
