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
   - `master`: applies your `.env-prod`\* through `kubectl`
   - `develop`: applies your `.env-acc`\* through `kubectl`
   - other branches: applies your `.env-test`\* through `kubectl`

_\*if it exists_

.env > secrets.yml (name: {{slugName}}__STAGE__-secret-env)
GitLab: GET /groups/:id/variables/MEH_K8S_CLUSTER_CONFIG > value
value > base64 decode > tmp file
KUBECONFIG=tmpfilepath kubectl apply -f secrets.yml
delete secrets.yml
delete tmp file
