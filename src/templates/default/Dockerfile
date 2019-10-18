# Build
FROM node:12-alpine
WORKDIR /tmp
COPY . .
RUN yarn
RUN yarn build

# Install
FROM node:12-alpine
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
COPY --from=0 /tmp/build build
RUN yarn --production

# Serve
USER node
EXPOSE 3000
CMD ["yarn", "start"]
