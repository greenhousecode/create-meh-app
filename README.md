# Create MEH App

> Quickly scaffold a new MEH project, and automate the boring stuff.

## Usage

```shell
yarn create meh-app
```

## Prerequisites

- [x] [Yarn](https://yarnpkg.com/) installed
- [x] `kubectl` installed and set up with Kubernetes
- [x] A GitLab [personal access token](https://gitlab.com/profile/personal_access_tokens) with `api` scope

## What it does

Based on your input data:

1. Creates a GitLab project
2. Creates a directory, and clones the new project's repository
3. Scaffolds, and installs dependencies
4. Every time you `git push` to
   - `master`: applies your `.env.prod`\* through `kubectl`
   - `develop`: applies your `.env.acc`\* through `kubectl`
   - other branches: applies your `.env.test`\* through `kubectl`

_\*if file exists_
