FROM node:20

WORKDIR /usr/src/app

ENV PORT 3003

COPY package*.json ./

EXPOSE 3003

RUN npm install

COPY . .

CMD ["npm", "start"]