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
2. Creates a `read_registry` GitLab deploy token, and publishes it through `kubectl`
3. Creates a directory, and clones the new repository
4. Copies over configuration files to the cwd, and installs dependencies
5. Every time you `push` through `git`: Converts your `.env` to `secrets.yml`, and publishes it through `kubectl`
