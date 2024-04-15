# Base image
FROM node:20-alpine 

WORKDIR /app
COPY dto ./dto/
COPY socket.messages.ts ./

WORKDIR /app/tictactoe-backend

COPY tictactoe-backend/package*.json ./

RUN npm install

# default command to be executed when the container starts, which is running the entrypoint.sh script
COPY tictactoe-backend .
COPY /tictactoe-backend/entrypoint.sh ./
RUN chmod +x entrypoint.sh
ENTRYPOINT ["/app/tictactoe-backend/entrypoint.sh"]

EXPOSE 3000 3001

CMD [ "npm", "run", "start" ]