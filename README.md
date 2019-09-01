# Create MEH App

> Quickly scaffold a new MEH project, and automate the boring stuff.

![Screenshot](docs/screenshot.png)

## Usage

```shell
yarn create meh-app <app-name>
```

## Prerequisites

- [x] [Yarn](https://yarnpkg.com/) installed
- [x] [Kubectl v1.11.5](https://storage.googleapis.com/kubernetes-release/release/v1.11.5/bin/darwin/amd64/kubectl) installed
- [x] An `api` scoped GitLab [personal access token](https://gitlab.com/profile/personal_access_tokens)

## Git hooks

#### Pre-commit

- Lints and attempts to autofix your staged files (ESLint)
- Formats and attempts to autoformat your staged files (Prettier)

#### Pre-push

- `master` branch: Applies your `.env.prod`\* through `kubectl`
- `develop` branch: Applies your `.env.acc`\* through `kubectl`
- Other branches: Applies your `.env.test`\* through `kubectl`

_\*if file exists_
