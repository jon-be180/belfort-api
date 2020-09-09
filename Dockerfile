FROM node:8

ENV HOST localhost
ENV PORT 3005

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install dependencies
COPY package.json .
RUN npm install --production && \
    npm cache clean --force

# Bundle app source
COPY . /usr/src/app

EXPOSE $PORT
RUN chmod +x /usr/src/app/docker-entrypoint.sh
ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]

CMD
