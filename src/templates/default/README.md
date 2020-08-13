# {{name}}

{{description}}

## Install

```shell
yarn
```

## Scripts

#### `yarn download-env`

Creates local `.env.<test|acc|prod>` files from remote Kubernetes secrets.

> Add the `--force` or `-f` flag to overwrite any pre-existing local `.env.<test|acc|prod>` files.

#### `yarn upload-env`

Publishes local `.env.<test|acc|prod>` files to remote Kubernetes secrets.

> Add the `--restart` or `-r` flag to restart any web pods afterwards (to pick up your published secrets).

{{airflowDoc}}## Environment variables

| Environment | Key | Description |
| ----------- | --- | ----------- |{{redisDoc}}{{mongodbDoc}}
