# {{name}}

{{description}}

## Install

```shell
yarn
```

## Scripts

#### `yarn download-env`

Creates local `.env.<stage>` files from remote Kubernetes secrets.

> Add the `--force` flag to overwrite any pre-existing local `.env.<stage>` files.

#### `yarn upload-env`

Publishes local `.env.<stage>` files to remote Kubernetes secrets.

> `<stage>` can be any of: "test", "acc", "prod".

> Add the `--force` flag to restart any web pods afterwards (to pick up your published secrets).

> Always encapsulate multiline values in double quotes "".

{{airflowDoc}}## Environment variables

| Env | Key | Description |
| --- | --- | ----------- |{{redisDoc}}{{mongodbDoc}}
