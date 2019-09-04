# Create MEH App

> Quickly scaffolds a new MEH project by setting up linting, formatting and automatic deployment.

## Features

- [x] Linting & formatting
- [x] Creates & clones GitLab repo
- [x] Initial commit on `master` and `develop`
- [x] Automatic Kubernetes deployment
- [x] Automatic `.env.<stage>` deployment

## Prerequisites

- [Yarn](https://yarnpkg.com/)
- [Kubectl v1.11.5](https://storage.googleapis.com/kubernetes-release/release/v1.11.5/bin/darwin/amd64/kubectl)
- GitLab [personal access token](https://gitlab.com/profile/personal_access_tokens) (`api` scoped)

## Usage

```shell
yarn create meh-app <app-name>
```

![Screenshot](docs/screenshot.png)

## Git hooks

#### Pre-commit

- Lints and formats, and attempts to autofix your staged files (`*.{js,jsx,ts,tsx,vue}`) through [ESLint](https://eslint.org/) (extending [Airbnb](https://github.com/airbnb/javascript#readme)) and [Prettier](https://prettier.io/)
- Formats and attempts to autoformat your staged files (`*.{css,graphql,html,json,md,scss,yml}`) through Prettier

#### Pre-push

- Runs `yarn test`
- When on `master` branch: Applies your `.env.prod`\* through `kubectl`
- When on `develop` branch: Applies your `.env.acc`\* through `kubectl`
- On other branches: Applies your `.env.test`\* through `kubectl`

_\*if file exists_

## Roadmap

- [ ] Support integrated Airflow DAGs
- [ ] Reduce amount of `devDependencies`
