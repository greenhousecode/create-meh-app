# {{name}}

{{description}}

## Install

```shell
yarn
```

## Scripts

### Environment Secrets

> There is an `envhelper` binary added to the project (`tools/envhelper`) when installing dependencies with `yarn` through a `postinstall` script.

#### `yarn download-env`

Creates local dotenv files (`.env.<test|acc|prod>`) from remote Kubernetes secrets.

> Add the `--force` (or `-f`) flag to overwrite any pre-existing dotenv files.

#### `yarn upload-env`

Publishes local dotenv files (`.env.<test|acc|prod>`) to remote Kubernetes secrets.

> Add the `--restart` (or `-r`) flag to restart any web pods afterwards (to pick up your published secrets).

{{airflowDoc}}## Environment variables

| Environment | Key | Description |
| ----------- | --- | ----------- |{{redisDoc}}{{mongodbDoc}}
