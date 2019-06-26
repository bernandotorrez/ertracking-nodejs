#FROM node:latest
FROM ertrackingfinal:master

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

COPY ecosystem.config.js .

#RUN npm install pm2 -g

USER node

#RUN npm install --no-optional

COPY --chown=node:node . .

EXPOSE 8088 443 43554

# use "prod-linux-pm2" for production
CMD [ "npm", "run", "prod-linux-pm2" ]

# use "dev-linux-pm2" for development
# CMD [ "npm", "run", "dev-linux-pm2" ]
