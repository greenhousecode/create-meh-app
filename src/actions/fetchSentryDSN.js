/* eslint-disable consistent-return */
const { ui } = require('inquirer');
const chalk = require('chalk');

const curlPromise = require('../utils/curlPromise');

const BASE_URL = 'https://sentry.io/api/0';

module.exports = async (sentry) => {
  if (!sentry) {
    return {};
  }

  const bar = new ui.BottomBar();
  bar.updateBottomBar(chalk.gray('Fetching Sentry DSN…'));

  try {
    const { id, slug, org, token } = sentry;

    const url = `${BASE_URL}/projects/${org}/${slug}/keys/`;

    const [err, response, data] = await curlPromise(url, 'get', {
      options: {
        auth: {
          bearer: token,
        },
      },
    });

    if (err) {
      throw err;
    }

    if ([200, 201, 202].indexOf(response.statusCode) === -1) {
      const { detail } = JSON.parse(response.body);
      throw new Error(`${response.statusMessage}: ${detail}`);
    }

    const [{ dsn }] = data;

    bar.updateBottomBar('');
    console.log(chalk.green('✔ Fetched Sentry DSN'));

    return {
      sentryId: id,
      sentrySlug: slug,
      sentryOrg: org,
      sentryToken: token,
      sentryDSN: dsn.public,
    };
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red(`✘ Fetching Sentry DSN failed`));
    throw err;
  }
};
