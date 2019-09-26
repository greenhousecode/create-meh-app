/* eslint-disable consistent-return */
const curlPromise = require('../utils/curlPromise');

const BASE_URL = 'https://sentry.io/api/0';

module.exports = async answers => {
  if (!answers || !('sentryId' in answers)) {
    return;
  }

  const { sentryOrg, sentrySlug, sentryToken } = answers;

  const url = `${BASE_URL}/projects/${sentryOrg}/${sentrySlug}/`;

  const [err, response] = await curlPromise(url, 'delete', {
    options: {
      auth: {
        bearer: sentryToken,
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
};
