# Create MEH App

> Quickly scaffold a new Node.js project by creating a GitLab repository, setting up linting/formatting, automatic Kubernetes deployment, local dotenv ⇄ Kubernetes secrets syncing, and more.

## Usage

```shell
yarn create meh-app <app-name>
```

Examples:

```shell
yarn create meh-app my-app
yarn create meh-app relative-folder/my-app
yarn create meh-app /root-folder/my-app
```

## Features

- [x] Creates and clones a GitLab project and repository
- [x] Initial scaffold commit on `master` and `develop`
- [x] Automatic Kubernetes deployment through GitLab
- [x] Two-way dotenv/secrets sync through `yarn upload-env` and `yarn download-env`
- [x] Lints & formats `.js(x)`, `.ts(x)`, and `.vue` files on commit
- [x] Formats `.graphql`, `.html`, `.json`, `.md`, `.(s)css`, and `.yml` files on commit
- [x] Optional Airflow DAG(s) (automatic deployment through GitLab)
- [x] Optional Redis and/or MongoDB database
- [x] Optional Uptime Robot monitoring

## Prerequisites

- [Node.js](https://nodejs.org/) >=14 (LTS)
- [Yarn](https://yarnpkg.com/)
- [Kubectl v1.14.9](https://storage.googleapis.com/kubernetes-release/release/v1.14.9/bin/darwin/amd64/kubectl)
- GitLab [personal access token](https://gitlab.com/profile/personal_access_tokens) ("api"-scoped)

> **Recommended:** Add `export GITLAB_PERSONAL_ACCESS_TOKEN=<token>` to your `~/.bash_profile` (and/or `~/.zshrc`) so you can use `yarn download-env` and `yarn upload-env` without configuration.

## Functionality

### `yarn upload-env`

Converts any local `.env.<test|acc|prod>` files to secrets, and applies them remotely through `kubectl`. Add the `--restart` or `-r` flag to restart any web pods afterwards (to pick up your new secrets).

> Requires a `GITLAB_PERSONAL_ACCESS_TOKEN` as environment variable.

### `yarn download-env`

Converts any remote project secrets to local dotenv files, and stores them as `.env.<test|acc|prod>`. Add the `--force` or `-f` flag to overwrite any pre-existing `.env.<test|acc|prod>` files.

> Requires a `GITLAB_PERSONAL_ACCESS_TOKEN` as environment variable.

### `pre-commit` git hook

- Lints (and formats), and attempts to autofix your staged (`.js(x)`, `.ts(x)`, and `.vue`) files through [ESLint](https://eslint.org/) (extending [Airbnb](https://github.com/airbnb/javascript#readme) and [Prettier](https://prettier.io/))
- Formats and attempts to autoformat your staged (`.graphql`, `.html`, `.json`, `.md`, `.(s)css`, and `.yml`) files through Prettier

### `pre-push` git hook

- Runs `yarn test`

### Airflow DAGs

If you opted in for Airflow DAG(s) during setup, the following will be added to your project:

- `/airflow/<dagName>.py` (containing the interval and description you entered)
- `"start:<dagName>"` script in `package.json` (the Airflow pod will run `yarn start:<dagName>`)
- Automatic deployment of any `/airflow/*.py` files, when pushing to the `master` branch

## Recommended Visual Studio Code settings

### Extensions

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### `settings.json`

> To open these settings, press: ⌘-Shift-P → "Preferences: Open Settings (JSON)"

```json
{
  "editor.codeActionsOnSave": { "source.fixAll": true },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  "eslint.options": { "ignorePath": ".gitignore" },
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "prettier.disableLanguages": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "prettier.ignorePath": ".gitignore"
}
```

> **Note:** We use `prettier.disableLanguages` to disable Prettier from handling JS(X) and TS(X) files, because ESLint already formats these (using Prettier under the hood).

## Roadmap

- [ ] Dotenv ⇄ secrets sync without a cluster key
- [ ] DAG OTAP
