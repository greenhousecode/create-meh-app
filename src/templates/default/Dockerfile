# Setup
FROM node:14-alpine
WORKDIR /usr/src/app

# Install (copy from pipeline artifacts)
COPY . .
RUN yarn --production

# Run
USER node
EXPOSE 3000
CMD ["yarn", "start"]
