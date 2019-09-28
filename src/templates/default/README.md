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

| Env   | Key                          | Description                                                                                                                                |
| ----- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Local | GITLAB_PERSONAL_ACCESS_TOKEN | A GitLab [personal access token](https://gitlab.com/profile/personal_access_tokens) with `api` scope, used to deploy `.env.<stage>` files. |
