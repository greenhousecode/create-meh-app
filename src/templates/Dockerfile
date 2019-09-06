# Remove -alpine when using advanced system features, like VPN
FROM node:10-alpine
WORKDIR /usr/src/app

# Install
COPY package.json yarn.lock ./
RUN yarn
COPY . .
# Or preferably, move build folder only:
#COPY ./build ./build

# Serve
USER node
EXPOSE 3000
CMD ["yarn", "start"]
