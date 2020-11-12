# Build arguments
ARG BUILD_PATH
ARG NODE_VERSION

# Setup
FROM node:$NODE_VERSION AS image
WORKDIR /usr/src/app

# Install (copy from pipeline artifacts)
COPY $BUILD_PATH $BUILD_PATH
RUN yarn --production

# Run
USER node
EXPOSE 3000
CMD ["yarn", "start"]
