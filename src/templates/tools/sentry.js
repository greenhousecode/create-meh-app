/* eslint-disable */
const { init } = require('@sentry/node');
const { RewriteFrames } = require('@sentry/integrations');

if (process.env.SENTRY_DSN) {
  init({
    // provided by .env.prod
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // required for sourcemaps!
      new RewriteFrames({
        root: process.cwd(),
      })
    ],
    // automatic from CI
    release: process.env.SENTRY_RELEASE_ID,
  })
}
