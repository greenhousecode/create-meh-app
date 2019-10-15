# Remove -alpine when using advanced system features, like VPN
FROM node:10-alpine
WORKDIR /usr/src/app

# Setup
COPY package.json yarn.lock ./
COPY tools/sentry.js tools/
COPY build build
RUN yarn --production --ignore-scripts

# Run
USER node
EXPOSE 3000
CMD ["yarn", "start"]
