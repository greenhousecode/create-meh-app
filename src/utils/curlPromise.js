const request = require('request');

const noop = () => {};

const merge = (...args) => {
  const mergeWith = items =>
    function next(input, index) {
      const obj = items[index];
      if (!obj || typeof obj !== 'object') {
        return input;
      }
      const output = { ...input, ...obj };
      return next(output, index + 1);
    };

  return mergeWith(args)({}, 0);
};

const curl = (method, withData) => (url, body, options, callback = noop) => {
  let callbackCopy = callback;
  let optionsCopy = options;
  if (!callbackCopy && typeof optionsCopy === 'function') {
    callbackCopy = options;
    optionsCopy = {};
  }

  const newOptions = merge(optionsCopy, {
    method,
    url,
    body,
  });

  if (!withData) {
    delete newOptions.body;
  }

  delete newOptions.uri;

  request(newOptions, callbackCopy);
};

const requestOptions = {
  get: curl('GET', false),
  post: curl('POST', true),
  put: curl('PUT', true),
  delete: curl('DELETE', false),
};

/**
 * Promised curl request
 *
 * @param {string} url
 * @param {'get'|'post'|'put'|'delete'} method
 * @param {{body: string | *[] | {[key: string]: *}, options: {[key: string]: *}}} param2
 * @returns {Promise<[undefined|Error,*, *]>} Returns a tuple of error, response object, and data
 */
const curlPromise = (url, method, { body, options = {}, json = true } = {}) =>
  // eslint-disable-next-line consistent-return
  new Promise(resolve => {
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

    try {
      requestOptions[method](url, ...curlOpts, (err, response, data) => {
        if (err) {
          throw typeof err === 'string' ? new Error(err) : err;
        }

        let output = null;
        try {
          output = JSON.parse(data);
        } catch (e) {
          output = data;
        }

        return resolve([null, response, output]);
      });
    } catch (err) {
      return resolve([err]);
    }
  });

module.exports = curlPromise;
