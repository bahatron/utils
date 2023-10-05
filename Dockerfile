FROM node:lts
RUN npm i --location=global pm2

WORKDIR /app
COPY ./package* ./
RUN npm install
COPY ./playground/package* ./playground/
RUN (cd playground && npm install)
COPY ./playground ./playground
COPY . .
RUN npm run build:clean
