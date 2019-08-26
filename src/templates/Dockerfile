FROM node:10-alpine
WORKDIR /usr/src/app

# Install
COPY package.json yarn.lock ./
RUN yarn

# Build
COPY . .
RUN yarn build

# Serve
EXPOSE 3000
CMD ["yarn", "start"]
