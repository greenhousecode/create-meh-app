# {{name}}

{{description}}

## Install

```shell
yarn
```

## Scripts

#### `yarn download-env`

Create local `.env.*` files from remote Kubernetes secrets.

> Add the `--force` flag to overwrite any pre-existing local `.env.<stage>` files.

#### `yarn upload-env`

Publish local `.env.*` files as remote Kubernetes secrets.

> Add the `--force` flag to restart any web pods afterwards (to pick up your published secrets).

{{airflowDoc}}## Environment variables

| Env | Key | Description |
| --- | --- | ----------- |{{redisDoc}}{{mongodbDoc}}{{gitlabDoc}}
