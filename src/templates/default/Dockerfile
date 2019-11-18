# Build
FROM node:12-alpine
ARG VERSION
WORKDIR /tmp/app
COPY . .
RUN yarn
RUN yarn build --cache-bust=$VERSION

# Install
FROM node:12-alpine
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
COPY --from=0 /tmp/app/build build
RUN yarn --production

# Serve
USER node
EXPOSE 3000
CMD ["yarn", "start"]
