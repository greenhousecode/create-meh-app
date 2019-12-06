/* eslint-disable consistent-return */
const { Gitlab } = require('gitlab');
const { ui } = require('inquirer');
const chalk = require('chalk');

const { GITLAB_NAMESPACES } = require('../config.json');

const curlPromise = require('../utils/curlPromise');

const BASE_URL = 'https://sentry.io/api/0';

const ALERT_TAGS = ['user', 'logger', 'feature', 'release', 'url'];

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

const call = async (url, method, options, body) => {
  const [err, response, data] = await curlPromise(url, method, {
    options,
    body,
  });

  if (err) {
    throw err;
  }

  if ([200, 201, 202].indexOf(response.statusCode) === -1) {
    const { detail } = JSON.parse(response.body);
    throw new Error(`${response.statusMessage}: ${detail}`);
  }

  return data;
};

module.exports = async ({ addons, namespace, token, appName: name }) => {
  if (!addons.includes('sentry')) {
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

    const options = {
      auth: {
        bearer: SENTRY_AUTH_TOKEN,
      },
    };

    const project = await call(`${BASE_URL}/teams/${SENTRY_ORG}/meh/projects/`, 'post', options, {
      name,
    });

    await call(`${BASE_URL}/projects/${SENTRY_ORG}/${project.slug}/rules/`, 'post', options, {
      actionMatch: 'all',
      actions: [
        // GreenHouse Slack details
        {
          channel: '#dev_hotline',
          channel_id: 'C07QB2P0C',
          id: 'sentry.integrations.slack.notify_action.SlackNotifyServiceAction',
          name: `Send a notification to the Greenhouse Slack workspace to #dev_hotline and show tags [${ALERT_TAGS.join(
            ', ',
          )}] in notification`,
          tags: ALERT_TAGS.join(','),
          workspace: 16727,
        },
      ],
      conditions: [
        {
          id: 'sentry.rules.conditions.first_seen_event.FirstSeenEventCondition',
          name: 'An issue is first seen',
        },
      ],
      // any environment
      environment: null,
      // frequency in minutes
      frequency: 30,
      name: 'Send issues to #dev_hotline',
    });

    bar.updateBottomBar('');
    console.log(chalk.green('✔ Created Sentry project'));

    return {
      id: project.id,
      slug: project.slug,
      token: SENTRY_AUTH_TOKEN,
      org: SENTRY_ORG,
    };
  } catch (err) {
    bar.updateBottomBar('');
    console.log(chalk.red(`✘ Creating Sentry project failed`));
    throw err;
  }
};
