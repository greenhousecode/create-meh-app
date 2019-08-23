# Create MEH App

> Quickly scaffold a new MEH project, and automate the boring stuff.

## Usage

```shell
yarn create meh-app
```

## Prerequisites

- [x] [Yarn](https://yarnpkg.com/) installed
- [x] A GitLab [personal access token](https://gitlab.com/profile/personal_access_tokens) with `api` scope
- [x] `kubectl` installed and set up with Kubernetes

## What it does

Based on your input data:

1. Creates a new GitLab project
2. Creates a `read_registry` GitLab deploy token, and publishes it through `kubectl`
3. Clones the new repository to the cwd
4. Copies over prefilled configuration and scaffolding files to the cwd
5. Converts and publishes your optional `.env` to `secrets.yml` through `kubectl`, every time you `push` through `git`

## Questions

- Please provide your GitLab personal access token:
- What's the name of your app? Placeholder: My App
- What's the slug name for your app? Default: my-app
- Please provide a one-liner describing your app: (GitLab and README)
- Are you planning to use React? (Only affects linting)
  npx install-peerdeps eslint-config-airbnb --dev --yarn

# OR

npx install-peerdeps eslint-config-airbnb-base --dev --yarn

yarn add prettier eslint-config-prettier eslint-plugin-prettier -D
