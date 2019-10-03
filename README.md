# Create MEH App

> Quickly scaffolds a new MEH project by setting up linting, formatting and automatic deployment.

## Usage

```shell
yarn create meh-app <app-name>
```

**Examples:**

- `yarn create meh-app my-app`
- `yarn create meh-app folder/my-app`
- `yarn create meh-app /folder/my-app`

## Features

- [x] Lints & formats `.js(x)`, `.ts(x)`, and `.vue`
- [x] Formats `.graphql`, `.html`, `.json`, `.md`, `.(s)css`, and `.yml`
- [x] Creates & clones a GitLab repository
- [x] Initial commits on `master` and `develop`
- [x] Automatic two-way `.env.<stage>` secrets sync
- [x] Automatic Kubernetes deployment
- [x] Automatic Airflow DAG(s) deployment
- [x] Optional Pingdom monitoring

## Prerequisites

- [Yarn](https://yarnpkg.com/)
- [Kubectl v1.11.5](https://storage.googleapis.com/kubernetes-release/release/v1.11.5/bin/darwin/amd64/kubectl)
- GitLab [personal access token](https://gitlab.com/profile/personal_access_tokens) (`api` scoped)
  _Recommended: Add `export GITLAB_PERSONAL_ACCESS_TOKEN=<token>` to your `~/.bash_profile` and/or `~/.zshrc` to automatically create and prefill `.env.<stage>` files on consecutive installs_

## What it does

### Airflow DAGs

If you opted in for Airflow DAG(s) during setup, the following will be added to your project:

- `/dags/<dagName>.py` (containing the interval and description you entered)
- `start:<dagName>` script in `package.json` (the Airflow pod will call `yarn start:<dagName>`)
- `deploy_dags` stage in `.gitlab-ci.yml`. This will automatically deploy any `*.py` files present in `/dags` (when pushing to `master`)

### `postinstall` npm hook

When installing pre-existing projects generated with Create MEH App, it'll try to read out `process.env.GITLAB_PERSONAL_ACCESS_TOKEN`. If it succeeds, it'll authenticate through `kubectl` and retrieve any project-related secrets. These secrets will then be converted to `.env.<stage>` files and placed in your project root folder.

Any changed `.env.<stage>` files will be applied back though `kubectl` whenever you push to their corresponding git branches (see [pre-push git hook](#pre-push-git-hook) below).

### `pre-commit` git hook

- Lints (and formats), and attempts to autofix your staged (`.js(x)`, `.ts(x)`, and `.vue`) files through [ESLint](https://eslint.org/) (extending [Airbnb](https://github.com/airbnb/javascript#readme) and [Prettier](https://prettier.io/))
- Formats and attempts to autoformat your staged (`.graphql`, `.html`, `.json`, `.md`, `.(s)css`, and `.yml`) files through Prettier

### `pre-push` git hook

- Runs `yarn test`
- When on `master` branch: Applies your `.env.prod`\* through `kubectl`
- When on `develop` branch: Applies your `.env.acc`\* through `kubectl`
- On other branches: Applies your `.env.test`\* through `kubectl`

_\*if file exists_

## Recommended Visual Studio Code settings

### Extensions

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### `settings.json`

```json
{
  "editor.formatOnSave": true,
  "eslint.autoFixOnSave": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    {
      "language": "typescript",
      "autoFix": true
    },
    {
      "language": "typescriptreact",
      "autoFix": true
    },
    {
      "language": "vue",
      "autoFix": true
    }
  ],
  "prettier.disableLanguages": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ]
}
```

**Note:** We use `prettier.disableLanguages` to disable Prettier from handling JS(X), TS(X), and Vue files, because ESLint already formats these (using Prettier under the hood).

## Roadmap

- [ ] Optimize CI
- [ ] Separate DAGs for each deployment stage
