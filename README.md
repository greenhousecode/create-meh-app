# Create MEH App

> Quickly scaffolds a new Node.js project by setting up linting, formatting, automatic deployment, and two-way environment secrets syncing.

## Usage

```shell
yarn create meh-app <app-name>
```

**Examples:**

- `yarn create meh-app my-app`
- `yarn create meh-app folder/my-app`
- `yarn create meh-app /folder/my-app`

## Features

- [x] Lints & formats `.js(x)`, `.ts(x)`, and `.vue` files
- [x] Formats `.graphql`, `.html`, `.json`, `.md`, `.(s)css`, and `.yml` files
- [x] Creates and clones a new GitLab project and repository
- [x] Initial commits on `master` and `develop`
- [x] Automatic Kubernetes deployment through GitLab
- [x] Two-way `.env.<stage>` secrets sync through `yarn upload-env` and `yarn download-env`
- [x] Optional Airflow DAG(s) (automatic deployment through GitLab)
- [x] Optional Redis database
- [x] Optional MongoDB database
- [x] Optional Uptime Robot monitoring

## Prerequisites

- [Yarn](https://yarnpkg.com/)
- [Kubectl v1.13.0](https://storage.googleapis.com/kubernetes-release/release/v1.13.0/bin/darwin/amd64/kubectl)
- GitLab [personal access token](https://gitlab.com/profile/personal_access_tokens) (`api`-scoped)

_Recommended: Add `export GITLAB_PERSONAL_ACCESS_TOKEN=<token>` to your `~/.bash_profile` (and/or `~/.zshrc`) so you can use `yarn download-env` and `yarn upload-env` without configuration._

## Functionality

### `yarn upload-env`

Converts any local `.env.<stage>` files to secrets, and applies them remotely through `kubectl`. Add the `--restart` flag to restart any web pods afterwards (to pick up your new secrets).

_(requires `GITLAB_PERSONAL_ACCESS_TOKEN` as environment variable)_

### `yarn download-env`

Converts any remote project secrets to local dotenv files, and stores them as `.env.<stage>`. Add the `--overwrite` flag to overwrite any pre-existing `.env.<stage>` files.

_(requires `GITLAB_PERSONAL_ACCESS_TOKEN` as environment variable, and does not overwrite pre-existing dotenv files)_

### `pre-commit` git hook

- Lints (and formats), and attempts to autofix your staged (`.js(x)`, `.ts(x)`, and `.vue`) files through [ESLint](https://eslint.org/) (extending [Airbnb](https://github.com/airbnb/javascript#readme) and [Prettier](https://prettier.io/))
- Formats and attempts to autoformat your staged (`.graphql`, `.html`, `.json`, `.md`, `.(s)css`, and `.yml`) files through Prettier

### `pre-push` git hook

- Runs `yarn test`

### Airflow DAGs

If you opted in for Airflow DAG(s) during setup, the following will be added to your project:

- `/airflow/<dagName>.py` (containing the interval and description you entered)
- `"start:<dagName>"` script in `package.json` (the Airflow pod will run `yarn start:<dagName>`)
- Automatic deployment of any `/airflow/*.py` files, when pushing to `master`

## Recommended Visual Studio Code settings

### Extensions

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### `settings.json`

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "editor.formatOnSave": true,
  "prettier.disableLanguages": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}
```

> **Note:** We use `prettier.disableLanguages` to disable Prettier from handling JS(X) and TS(X) files, because ESLint already formats these (using Prettier under the hood).

## Roadmap

- [ ] Fix ESLint setups with TypeScript
- [ ] DAG OTAP
- [ ] Optimize/simplify CI and values configuration
