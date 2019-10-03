/* eslint-disable consistent-return */
const { Gitlab } = require('gitlab');
const { ui } = require('inquirer');
const chalk = require('chalk');

const { GITLAB_NAMESPACES } = require('../config.json');

const curlPromise = require('../utils/curlPromise');

const BASE_URL = 'https://sentry.io/api/0';

const pick = (property, { key = '', value }) => (key === property ? value : null);

const pickAll = (keys, arr) =>
  arr.reduce((acc, item) => {
    let lastKey = null;
    const value = keys.reduce((prev, key) => {
      if (prev) {
        return prev;
      }

      lastKey = key;

      return pick(key, item);
    }, null);

    if (value) {
      return {
        ...acc,
        [lastKey]: value,
      };
    }

    return acc;
  }, {});

module.exports = async ({ sentry, namespace, token, appName: name }) => {
  if (!sentry) {
    return null;
  }

  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Creating Sentry project…'));

  try {
    const gitlab = new Gitlab({ token });

    const all = await gitlab.GroupVariables.all(GITLAB_NAMESPACES[namespace].id);

    const { SENTRY_ORG, SENTRY_AUTH_TOKEN } = pickAll(['SENTRY_ORG', 'SENTRY_AUTH_TOKEN'], all);

    if (!SENTRY_ORG) {
      throw new Error(`Missing 'SENTRY_ORG' Gitlab variable for namespace ${namespace}`);
    }

    if (!SENTRY_AUTH_TOKEN) {
      throw new Error(`Missing 'SENTRY_AUTH_TOKEN' Gitlab variable for namespace ${namespace}`);
    }

    const [err, response, data] = await curlPromise(
      `${BASE_URL}/teams/${SENTRY_ORG}/meh/projects/`,
      'post',
      {
        options: {
          auth: {
            bearer: SENTRY_AUTH_TOKEN,
          },
        },
        body: { name },
      },
    );

    if (err) {
      throw err;
    }

    if ([200, 201, 202].indexOf(response.statusCode) === -1) {
      const { detail } = JSON.parse(response.body);
      throw new Error(`${response.statusMessage}: ${detail}`);
    }

    bar.updateBottomBar('');
    console.log(chalk.green('✔ Created Sentry project'));

    return {
      id: data.id,
      slug: data.slug,
      token: SENTRY_AUTH_TOKEN,
      org: SENTRY_ORG,
    };
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red(`✘ Creating Sentry project failed`));
    throw err;
  }
};
