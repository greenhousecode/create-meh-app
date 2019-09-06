/* eslint-disable no-param-reassign */
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

const curl = method => (url, options, callback) => {
  if (!callback) {
    callback = options;
    options = {};
  }

  const newOptions = merge(options, { url }, { method });

  delete newOptions.uri;

  request(newOptions, callback);
};

const curlWithData = method => (url, body, options, callback) => {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  callback = callback || noop;

  const newOptions = merge(options, {
    method,
    url,
    body,
  });

  delete newOptions.uri;

  request(newOptions, callback);
};

const requestOptions = {
  get: curl('GET'),
  post: curlWithData('POST'),
  put: curlWithData('PUT'),
  delete: curl('DELETE'),
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
      requestOptions[method](
        url,
        ...((method !== 'post' && method !== 'put') || !body ? curlOpts.slice(1) : curlOpts),
        (err, response, data) => {
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
        },
      );
    } catch (err) {
      return resolve([err]);
    }
  });

module.exports = curlPromise;
