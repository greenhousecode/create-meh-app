# Remove -alpine when using advanced system features, like VPN
FROM node:10-alpine
WORKDIR /usr/src/app

# Setup
COPY . .

# Run
USER node
EXPOSE 3000
CMD ["yarn", "start"]
