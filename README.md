# Create MEH App

> Quickly scaffold a new MEH project, and automate the boring stuff.

## Prerequisites

- [x] [Yarn](https://yarnpkg.com/) installed
- [x] [Kubectl v1.11.5](https://storage.googleapis.com/kubernetes-release/release/v1.11.5/bin/darwin/amd64/kubectl) installed
- [x] A GitLab [personal access token](https://gitlab.com/profile/personal_access_tokens) (`api` scoped)

## Usage

```shell
yarn create meh-app <app-name>
```

![Screenshot](docs/screenshot.png)

## Git hooks

#### Pre-commit

- Lints and formats, and attempts to autofix your staged files (`*.{js,jsx,ts,tsx,vue}`) through [ESLint](https://eslint.org/) (extending [Airbnb](https://github.com/airbnb/javascript#readme)) and [Prettier](https://prettier.io/)
- Formats and attempts to autofix your staged files (`*.{css,graphql,html,json,md,scss}`) through Prettier

#### Pre-push

- Runs `yarn test`
- When on `master` branch: Applies your `.env.prod`\* through `kubectl`
- When on `develop` branch: Applies your `.env.acc`\* through `kubectl`
- On other branches: Applies your `.env.test`\* through `kubectl`

_\*if file exists_

## Roadmap

- [ ] Reduce amount of `devDependencies`
- [ ] Stage initial commit
