# Base image
FROM node:20-alpine as build-stage

WORKDIR /app

COPY dto ./dto/
COPY socket.messages.ts ./

WORKDIR /app/tictactoe-frontend

COPY tictactoe-frontend/package*.json ./
COPY tictactoe-frontend/tailwind.config.js tictactoe-frontend/postcss.config.js ./

RUN npm install

COPY tictactoe-frontend .

RUN npm run build
CMD ["npm", "run", "preview", "--", "--port","80","--host","0.0.0.0"]
