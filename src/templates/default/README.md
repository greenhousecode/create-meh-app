# {{name}}

{{description}}

## Install

```shell
yarn
```

## Scripts

#### `yarn download-env`

Creates local `.env.<stage>` files from remote Kubernetes secrets.

> Add the `--force` or `-f` flag to overwrite any pre-existing local `.env.<stage>` files.

#### `yarn upload-env`

Publishes local `.env.<stage>` files to remote Kubernetes secrets.

> `<stage>` can be any of: "test", "acc" or "prod".

> Add the `--restart` or `-r` flag to restart any web pods afterwards (to pick up your published secrets).

{{airflowDoc}}## Environment variables

| Env | Key | Description |
| --- | --- | ----------- |{{redisDoc}}{{mongodbDoc}}
