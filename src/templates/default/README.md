# {{name}}

{{description}}

## Install

```shell
yarn
```

## Scripts

### Environment Secrets

There is an `envhelper` binary included in the project when starting it with `yarn create`. If you cloned an
existing project you should fetch the binary separately.

```shell
curl -o ./tools/envhelper 'https://cdn.greenhousegroup.com/ghg-nl/meh/binaries/envhelper-latest'
chmod +x ./tools/envhelper
```

#### `yarn download-env`

Creates local dotenv files (`.env.<test|acc|prod>`) from remote Kubernetes secrets.

> Add the `--force` (or `-f`) flag to overwrite any pre-existing dotenv files.

#### `yarn upload-env`

Publishes local dotenv files (`.env.<test|acc|prod>`) to remote Kubernetes secrets.

> Add the `--restart` (or `-r`) flag to restart any web pods afterwards (to pick up your published secrets).

{{airflowDoc}}## Environment variables

| Environment | Key | Description |
| ----------- | --- | ----------- |{{redisDoc}}{{mongodbDoc}}
