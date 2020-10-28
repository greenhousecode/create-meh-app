# Setup
FROM node:14-alpine AS image
WORKDIR /usr/src/app
COPY package.json yarn.lock ./

# Build
FROM image AS build
ARG VERSION
COPY . .
RUN yarn
RUN yarn build --cache-bust=$VERSION

# Install
FROM image
COPY --from=build /usr/src/app/build build
RUN yarn --production

# Run
USER node
EXPOSE 3000
CMD ["yarn", "start"]
