/* eslint-disable consistent-return */
const curlPromise = require('../utils/curlPromise');

const BASE_URL = 'https://sentry.io/api/0';

module.exports = async (sentry) => {
  if (!sentry) {
    return;
  }

  const { org, slug, token } = sentry;

  const url = `${BASE_URL}/projects/${org}/${slug}/`;

  const [err, response] = await curlPromise(url, 'delete', {
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
};
