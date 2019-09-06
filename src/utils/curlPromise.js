const curl = require('curl');

/**
 * Promised curl request
 *
 * @param {string} url
 * @param {'get'|'post'} method
 * @param {{body: string | *[] | {[key: string]: *}, options: {[key: string]: *}}} param2
 * @returns {[*, *]} Returns a tuple of response object and data
 */
const curlPromise = (url, method, { body, options = {}, json = true } = {}) =>
  new Promise((resolve, reject) => {
    const prefilledOptions = Object.assign(
      options,
      json
        ? {
            headers: {
              'Content-type': 'application/json',
            },
          }
        : {},
      options,
    );

    const curlOpts = [typeof body === 'object' ? JSON.stringify(body) : body, prefilledOptions];

    curl[method](
      url,
      ...(method !== 'post' || !body ? curlOpts.slice(1) : curlOpts),
      (err, response, data) => {
        if (err) {
          return reject(err);
        }

        let output = null;
        try {
          output = JSON.parse(data);
        } catch (e) {
          output = data;
        }

        return resolve([response, output]);
      },
    );
  });

module.exports = curlPromise;
