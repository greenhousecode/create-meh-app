# {{name}}

> {{description}}

## Install

```shell
yarn
```

{{airflowDoc}}## Environment variables

If any of the following files exist, they will be deployed as secrets automatically, when pushing to the following branches:

- `master`: `/.env.prod`
- `develop`: `/.env.acc`
- (other): `/.env.test`

| Env | Key | Description |
| --- | --- | ----------- |{{redisDoc}}{{mongodbDoc}}{{gitlabDoc}}
